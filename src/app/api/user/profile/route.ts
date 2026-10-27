import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth-session";
import { prisma } from "@/lib/prisma";
import { handleCorsOptions, corsHeaders } from "@/lib/cors";

export async function OPTIONS() {
  return handleCorsOptions();
}

export async function GET(request: Request) {
  try {
    const session = await getAuthSession(request);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: corsHeaders() });
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
        password: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404, headers: corsHeaders() });
    }

    const { password, ...safeUser } = user;
    return NextResponse.json(
      {
        user: {
          ...safeUser,
          hasPassword: Boolean(password),
        },
      },
      { status: 200, headers: corsHeaders() }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to fetch user profile" },
      { status: 500, headers: corsHeaders() }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getAuthSession(request);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: corsHeaders() });
    }

    const body = await request.json().catch(() => ({}));
    const { name, phoneNumber, companyName } = body;

    const data: Record<string, string | null> = {};
    if (typeof name === "string") data.name = name.trim().slice(0, 100);
    if (typeof phoneNumber === "string") data.phoneNumber = phoneNumber.trim().slice(0, 20);
    if (typeof companyName === "string") data.companyName = companyName.trim().slice(0, 100);

    const updated = await prisma.user.update({
      where: { id: session.user.id },
      data,
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

    return NextResponse.json(
      { user: updated, message: "Profile updated successfully" },
      { status: 200, headers: corsHeaders() }
    );
  } catch (error: any) {
    console.error("Profile update error:", error);
    return NextResponse.json(
      { error: "Failed to update user profile" },
      { status: 500, headers: corsHeaders() }
    );
  }
}
