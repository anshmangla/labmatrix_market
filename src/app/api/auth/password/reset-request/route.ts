import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { sendPasswordResetOtpEmail } from "@/lib/resend";
import { recordOtpSend } from "@/lib/otp";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);

    // 1. IP Rate Limit: Max 6 reset requests per 15 minutes per IP
    const ipLimit = checkRateLimit(`reset_request_ip:${ip}`, 6, 15 * 60 * 1000);
    if (!ipLimit.success) {
      return NextResponse.json(
        { error: "Too many password reset requests from this network. Please try again later." },
        {
          status: 429,
          headers: { "Retry-After": ipLimit.resetSeconds.toString() },
        }
      );
    }

    const body = await request.json().catch(() => ({}));
    const { email } = body;

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "A valid email address is required." },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail) || cleanEmail.length > 254 || cleanEmail.includes(":")) {
      return NextResponse.json(
        { error: "Please provide a valid email address format." },
        { status: 400 }
      );
    }

    // 2. Cooldown Rate Limit per Email: Max 1 request every 50 seconds
    const emailCooldown = checkRateLimit(`reset_cooldown:${cleanEmail}`, 1, 50 * 1000);
    if (!emailCooldown.success) {
      return NextResponse.json(
        {
          error: `Please wait ${emailCooldown.resetSeconds} seconds before requesting another code.`,
          cooldownRemaining: emailCooldown.resetSeconds,
        },
        { status: 429 }
      );
    }

    // 3. Check if user exists in the database
    const user = await prisma.user.findUnique({
      where: { email: cleanEmail },
      select: { id: true, name: true, email: true },
    });

    // 4. Strict Privacy: If user does not exist, return success without revealing non-existence
    const genericSuccessMessage =
      "If an account is associated with this email, a 6-digit verification code has been dispatched.";

    if (!user) {
      return NextResponse.json({
        success: true,
        message: genericSuccessMessage,
        expiresInMinutes: 10,
      });
    }

    // Daily cap per account: each new code carries a fresh guess budget. Respond with the
    // same generic message so the cap doesn't reveal whether the account exists.
    if (!(await recordOtpSend(`reset:${cleanEmail}`))) {
      return NextResponse.json({
        success: true,
        message: genericSuccessMessage,
        expiresInMinutes: 10,
      });
    }

    // 5. Generate cryptographically secure 6-digit OTP
    const rawOtp = crypto.randomInt(100000, 1000000).toString();
    const hashedToken = crypto.createHash("sha256").update(rawOtp).digest("hex");
    const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry
    const identifier = `reset:${cleanEmail}`;

    // 6. Delete previous reset tokens for this email and save new token
    await prisma.verificationToken.deleteMany({
      where: { identifier },
    });

    await prisma.verificationToken.create({
      data: {
        identifier,
        token: hashedToken,
        expires,
      },
    });

    // 7. Dispatch password reset OTP email
    const sendResult = await sendPasswordResetOtpEmail({
      email: cleanEmail,
      name: user.name,
      otpCode: rawOtp,
    });

    if (!sendResult.success) {
      return NextResponse.json(
        { error: "Failed to dispatch verification email. Please try again shortly." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: genericSuccessMessage,
      expiresInMinutes: 10,
    });
  } catch (error: any) {
    console.error("Password reset request error:", error);
    return NextResponse.json(
      { error: "Internal server error while processing password reset request." },
      { status: 500 }
    );
  }
}
