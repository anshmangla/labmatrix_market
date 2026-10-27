import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signMobileToken } from "@/lib/mobile-auth";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { corsHeaders, handleCorsOptions } from "@/lib/cors";

export async function OPTIONS() {
  return handleCorsOptions();
}

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);

    // 1. Rate Limit per IP: Max 15 login attempts per 10 minutes
    const ipLimit = checkRateLimit(`mobile_login_ip:${ip}`, 15, 10 * 60 * 1000);
    if (!ipLimit.success) {
      return NextResponse.json(
        { error: "Too many login attempts. Please try again in a few minutes." },
        {
          status: 429,
          headers: {
            ...corsHeaders(),
            "Retry-After": ipLimit.resetSeconds.toString(),
          },
        }
      );
    }

    const body = await request.json().catch(() => ({}));
    const { email, password } = body;

    if (!email || !password || typeof email !== "string" || typeof password !== "string") {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400, headers: corsHeaders() }
      );
    }

    const cleanEmail = email.toLowerCase().trim();

    // 2. Rate Limit per Email: Max 5 failed attempts per 10 minutes
    const emailLimit = checkRateLimit(`mobile_login_email:${cleanEmail}`, 8, 10 * 60 * 1000);
    if (!emailLimit.success) {
      return NextResponse.json(
        { error: "Account temporarily locked due to failed attempts. Please wait a few minutes." },
        { status: 429, headers: corsHeaders() }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: cleanEmail },
      select: {
        id: true,
        name: true,
        email: true,
        password: true,
        phoneNumber: true,
        companyName: true,
        role: true,
      },
    });

    if (!user || !user.password) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401, headers: corsHeaders() }
      );
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401, headers: corsHeaders() }
      );
    }

    const token = await signMobileToken({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    const { password: _, ...safeUser } = user;

    return NextResponse.json(
      {
        message: "Login successful",
        token,
        user: safeUser,
      },
      {
        status: 200,
        headers: corsHeaders(),
      }
    );
  } catch (error: any) {
    console.error("Mobile login error:", error);
    return NextResponse.json(
      { error: "Internal server error. Please try again later." },
      { status: 500, headers: corsHeaders() }
    );
  }
}
