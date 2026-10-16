import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { sendOtpEmail } from "@/lib/resend";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);

    // 1. Rate Limit per IP: Max 8 OTP requests per 10 minutes
    const ipLimit = checkRateLimit(`otp_send_ip:${ip}`, 8, 10 * 60 * 1000);
    if (!ipLimit.success) {
      return NextResponse.json(
        { error: "Too many verification requests from this network. Please try again later." },
        {
          status: 429,
          headers: { "Retry-After": ipLimit.resetSeconds.toString() },
        }
      );
    }

    const body = await request.json().catch(() => ({}));
    const { email, name } = body;

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "A valid email address is required." },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail) || cleanEmail.length > 254) {
      return NextResponse.json(
        { error: "Please provide a valid email address format." },
        { status: 400 }
      );
    }

    // 2. Cooldown Rate Limit per Email: Max 1 request every 50 seconds
    const emailCooldown = checkRateLimit(`otp_cooldown:${cleanEmail}`, 1, 50 * 1000);
    if (!emailCooldown.success) {
      return NextResponse.json(
        {
          error: `Please wait ${emailCooldown.resetSeconds} seconds before requesting another code.`,
          cooldownRemaining: emailCooldown.resetSeconds,
        },
        { status: 429 }
      );
    }

    // 3. Verify that user doesn't already exist
    const existingUser = await prisma.user.findUnique({
      where: { email: cleanEmail },
      select: { id: true },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists. Please sign in instead." },
        { status: 400 }
      );
    }

    // 4. Generate cryptographically secure 6-digit numeric OTP
    const rawOtp = crypto.randomInt(100000, 1000000).toString();
    const hashedToken = crypto.createHash("sha256").update(rawOtp).digest("hex");
    const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

    // 5. Invalidate existing tokens for this email and record new token
    await prisma.verificationToken.deleteMany({
      where: { identifier: cleanEmail },
    });

    await prisma.verificationToken.create({
      data: {
        identifier: cleanEmail,
        token: hashedToken,
        expires,
      },
    });

    // 6. Send OTP email via Resend
    const cleanName = typeof name === "string" ? name.trim().slice(0, 100) : null;
    const sendResult = await sendOtpEmail({
      email: cleanEmail,
      name: cleanName,
      otpCode: rawOtp,
    });

    if (!sendResult.success) {
      return NextResponse.json(
        { error: "Failed to dispatch verification email. Please check your address and try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `A 6-digit verification code has been dispatched to ${cleanEmail}.`,
      expiresInMinutes: 10,
    });
  } catch (error: any) {
    console.error("Send OTP error:", error);
    return NextResponse.json(
      { error: "Internal server error while sending verification code." },
      { status: 500 }
    );
  }
}
