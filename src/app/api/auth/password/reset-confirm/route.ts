import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { checkOtp } from "@/lib/otp";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const ipLimit = checkRateLimit(`reset_confirm_ip:${ip}`, 10, 10 * 60 * 1000);
    if (!ipLimit.success) {
      return NextResponse.json(
        { error: "Too many reset attempts from this network. Please try again shortly." },
        {
          status: 429,
          headers: { "Retry-After": ipLimit.resetSeconds.toString() },
        }
      );
    }

    const body = await request.json().catch(() => ({}));
    const { email, otp, password } = body;

    if (!email || !password || typeof email !== "string" || typeof password !== "string") {
      return NextResponse.json(
        { error: "A valid email and new password are required." },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail) || cleanEmail.length > 254) {
      return NextResponse.json(
        { error: "Please provide a valid email address." },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long." },
        { status: 400 }
      );
    }

    if (password.length > 72) {
      return NextResponse.json(
        { error: "Password cannot exceed 72 characters." },
        { status: 400 }
      );
    }

    // 1. Validate OTP structure
    const cleanOtp = typeof otp === "string" ? otp.trim() : "";
    if (!cleanOtp || cleanOtp.length !== 6 || !/^\d{6}$/.test(cleanOtp)) {
      return NextResponse.json(
        { error: "Please enter the valid 6-digit verification code sent to your email." },
        { status: 400 }
      );
    }

    // 2. Prevent brute-force OTP guessing: Max 5 verification attempts per 10 minutes per email
    const verifyLimit = checkRateLimit(`reset_verify:${cleanEmail}`, 5, 10 * 60 * 1000);
    if (!verifyLimit.success) {
      return NextResponse.json(
        { error: "Too many incorrect verification attempts. Please request a fresh code." },
        { status: 429 }
      );
    }

    const identifier = `reset:${cleanEmail}`;

    // 3. Verify OTP against stored token
    const otpResult = await checkOtp(identifier, cleanOtp);

    if (otpResult === "missing") {
      return NextResponse.json(
        { error: "No active verification code found for this email. Please request a new code." },
        { status: 400 }
      );
    }

    if (otpResult === "expired") {
      return NextResponse.json(
        { error: "Verification code has expired. Please request a fresh code." },
        { status: 400 }
      );
    }

    if (otpResult === "retry") {
      return NextResponse.json(
        { error: "A verification attempt is already in progress. Please try again." },
        { status: 409 }
      );
    }

    if (otpResult !== "valid") {
      return NextResponse.json(
        { error: "Incorrect verification code. Please check your inbox or request a new code." },
        { status: 400 }
      );
    }

    // 4. Code is valid! Delete used verification token
    await prisma.verificationToken.deleteMany({
      where: { identifier },
    });

    // 5. Check if user exists
    const user = await prisma.user.findUnique({
      where: { email: cleanEmail },
      select: { id: true, emailVerified: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Account not found. Please create an account." },
        { status: 404 }
      );
    }

    // 6. Hash new password and update user record
    const hashedPassword = await bcrypt.hash(password, 10);
    await prisma.user.update({
      where: { email: cleanEmail },
      data: {
        password: hashedPassword,
        emailVerified: user.emailVerified || new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Your password has been updated successfully. Please sign in with your new password.",
    });
  } catch (error: any) {
    console.error("Password reset confirmation error:", error);
    return NextResponse.json(
      { error: "Internal server error while resetting password." },
      { status: 500 }
    );
  }
}
