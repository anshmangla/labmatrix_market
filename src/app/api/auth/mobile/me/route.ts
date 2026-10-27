import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthSession } from "@/lib/auth-session";
import { corsHeaders, handleCorsOptions } from "@/lib/cors";

export async function OPTIONS() {
  return handleCorsOptions();
}

export async function GET(request: Request) {
  try {
    const session = await getAuthSession(request);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401, headers: corsHeaders() }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        phoneNumber: true,
        companyName: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404, headers: corsHeaders() }
      );
    }

    return NextResponse.json(
      { user },
      { status: 200, headers: corsHeaders() }
    );
  } catch (error: any) {
    console.error("Mobile me error:", error);
    return NextResponse.json(
      { error: "Failed to fetch user profile" },
      { status: 500, headers: corsHeaders() }
    );
  }
}
