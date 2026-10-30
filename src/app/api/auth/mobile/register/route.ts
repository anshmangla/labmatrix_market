import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { checkOtp } from "@/lib/otp";
import { signMobileToken } from "@/lib/mobile-auth";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { corsHeaders, handleCorsOptions } from "@/lib/cors";

export async function OPTIONS() {
  return handleCorsOptions();
}

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);

    // 1. Rate Limit per IP
    const rateLimit = checkRateLimit(`mobile_register:${ip}`, 10, 10 * 60 * 1000);
    if (!rateLimit.success) {
      return NextResponse.json(
        { error: "Too many registration attempts. Please try again in a few minutes." },
        {
          status: 429,
          headers: {
            ...corsHeaders(),
            "Retry-After": rateLimit.resetSeconds.toString(),
          },
        }
      );
    }

    const body = await request.json().catch(() => ({}));
    const { name, email, password, otp, phoneNumber, companyName } = body;

    if (!email || !password || typeof email !== "string" || typeof password !== "string") {
      return NextResponse.json(
        { error: "A valid email and password are required." },
        { status: 400, headers: corsHeaders() }
      );
    }

    const cleanEmail = email.toLowerCase().trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail) || cleanEmail.length > 254) {
      return NextResponse.json(
        { error: "Please provide a valid email address." },
        { status: 400, headers: corsHeaders() }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long." },
        { status: 400, headers: corsHeaders() }
      );
    }

    if (password.length > 72) {
      return NextResponse.json(
        { error: "Password cannot exceed 72 characters." },
        { status: 400, headers: corsHeaders() }
      );
    }

    // 2. Validate OTP presence
    const cleanOtp = typeof otp === "string" ? otp.trim() : "";
    if (!cleanOtp || cleanOtp.length !== 6 || !/^\d{6}$/.test(cleanOtp)) {
      return NextResponse.json(
        { error: "Please enter the valid 6-digit verification code sent to your email." },
        { status: 400, headers: corsHeaders() }
      );
    }

    // 3. OTP rate limit
    const verifyLimit = checkRateLimit(`mobile_otp_verify:${cleanEmail}`, 5, 10 * 60 * 1000);
    if (!verifyLimit.success) {
      return NextResponse.json(
        { error: "Too many incorrect verification attempts. Please request a fresh verification code." },
        { status: 429, headers: corsHeaders() }
      );
    }

    // 4. Verify OTP against stored token
    const otpResult = await checkOtp(cleanEmail, cleanOtp);

    if (otpResult === "missing") {
      return NextResponse.json(
        { error: "No verification code found for this email. Please request a new code." },
        { status: 400, headers: corsHeaders() }
      );
    }

    if (otpResult === "expired") {
      return NextResponse.json(
        { error: "Verification code has expired. Please click Resend Code to get a fresh one." },
        { status: 400, headers: corsHeaders() }
      );
    }

    if (otpResult === "retry") {
      return NextResponse.json(
        { error: "A verification attempt is already in progress. Please try again." },
        { status: 409, headers: corsHeaders() }
      );
    }

    if (otpResult !== "valid") {
      return NextResponse.json(
        { error: "Incorrect verification code. Please check your inbox or request a new code." },
        { status: 400, headers: corsHeaders() }
      );
    }

    // 5. Code is valid: delete verification token
    await prisma.verificationToken.deleteMany({
      where: { identifier: cleanEmail },
    });

    // 6. Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists. Please sign in." },
        { status: 400, headers: corsHeaders() }
      );
    }

    const cleanName = typeof name === "string" ? name.trim().slice(0, 100) : null;
    const cleanPhone = typeof phoneNumber === "string" ? phoneNumber.trim().slice(0, 20) : null;
    const cleanCompany = typeof companyName === "string" ? companyName.trim().slice(0, 100) : null;
    const hashedPassword = await bcrypt.hash(password, 10);

    const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase().trim();
    const role = adminEmail && cleanEmail === adminEmail ? "ADMIN" : "USER";

    const user = await prisma.user.create({
      data: {
        name: cleanName,
        email: cleanEmail,
        password: hashedPassword,
        phoneNumber: cleanPhone,
        companyName: cleanCompany,
        role: role,
        emailVerified: new Date(),
      },
    });

    const token = await signMobileToken({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      password: user.password,
    });

    return NextResponse.json(
      {
        message: "Account registered successfully",
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phoneNumber: user.phoneNumber,
          companyName: user.companyName,
          role: user.role,
        },
      },
      {
        status: 201,
        headers: corsHeaders(),
      }
    );
  } catch (error: any) {
    console.error("Mobile registration error:", error);
    return NextResponse.json(
      { error: "Internal server error. Please try again later." },
      { status: 500, headers: corsHeaders() }
    );
  }
}
