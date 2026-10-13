import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const admin = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (admin?.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden: Admin only" }, { status: 403 });
    }

    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        phoneNumber: true,
        companyName: true,
        role: true,
        createdAt: true,
        _count: {
          select: {
            listings: true,
            requirements: true,
            inquiries: true,
          },
        },
      },
    });

    return NextResponse.json({ users });
  } catch (error: any) {
    console.error("Admin fetch users error:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const admin = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (admin?.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden: Admin only" }, { status: 403 });
    }

    const { userId, role } = await req.json();

    if (!userId || !["USER", "ADMIN"].includes(role)) {
      return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
    }

    // Safety check: Prevent self-demotion so the admin doesn't lock themselves out
    if (userId === session.user.id && role !== "ADMIN") {
      return NextResponse.json(
        { error: "You cannot revoke your own administrator rights." },
        { status: 400 }
      );
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    return NextResponse.json({
      message: `User role updated to ${role} successfully.`,
      user: updatedUser,
    });
  } catch (error: any) {
    console.error("Admin update user role error:", error);
    return NextResponse.json(
      { error: "Failed to update user role" },
      { status: 500 }
    );
  }
}
