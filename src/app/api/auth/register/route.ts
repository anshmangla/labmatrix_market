import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { checkOtp } from "@/lib/otp";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const rateLimit = checkRateLimit(`register:${ip}`, 10, 10 * 60 * 1000); // 10 registrations per 10 mins per IP
    if (!rateLimit.success) {
      return NextResponse.json(
        { error: "Too many registration attempts. Please try again in a few minutes." },
        {
          status: 429,
          headers: { "Retry-After": rateLimit.resetSeconds.toString() },
        }
      );
    }

    const body = await request.json();
    const { name, email, password, otp } = body;

    if (!email || !password || typeof email !== "string" || typeof password !== "string") {
      return NextResponse.json(
        { error: "A valid email and password are required." },
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

    // 1. Validate OTP presence
    const cleanOtp = typeof otp === "string" ? otp.trim() : "";
    if (!cleanOtp || cleanOtp.length !== 6 || !/^\d{6}$/.test(cleanOtp)) {
      return NextResponse.json(
        { error: "Please enter the valid 6-digit verification code sent to your email." },
        { status: 400 }
      );
    }

    // 2. Prevent brute-force OTP guessing: Max 5 verification attempts per 10 minutes per email
    const verifyLimit = checkRateLimit(`otp_verify:${cleanEmail}`, 5, 10 * 60 * 1000);
    if (!verifyLimit.success) {
      return NextResponse.json(
        { error: "Too many incorrect verification attempts. Please request a fresh verification code." },
        { status: 429 }
      );
    }

    // 3. Verify OTP against stored token
    const otpResult = await checkOtp(cleanEmail, cleanOtp);

    if (otpResult === "missing") {
      return NextResponse.json(
        { error: "No verification code found for this email. Please request a new code." },
        { status: 400 }
      );
    }

    if (otpResult === "expired") {
      return NextResponse.json(
        { error: "Verification code has expired. Please click Resend Code to get a fresh one." },
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
      where: { identifier: cleanEmail },
    });

    // 5. Check if user already exists (e.g. registered in parallel or OAuth)
    const existingUser = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists. Please sign in." },
        { status: 400 }
      );
    }

    const cleanName = typeof name === "string" ? name.trim().slice(0, 100) : null;
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name: cleanName,
        email: cleanEmail,
        password: hashedPassword,
        emailVerified: new Date(),
      },
    });

    return NextResponse.json(
      {
        message: "Email verified and account registered successfully.",
        user: { id: user.id, email: user.email, name: user.name },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Internal server error. Please try again later." },
      { status: 500 }
    );
  }
}
