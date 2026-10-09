import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const adminCount = await prisma.user.count({
      where: { role: "ADMIN" },
    });

    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Allow promotion if: no admin exists yet OR user's email matches ADMIN_EMAIL env
    const isOwnerEmail =
      process.env.ADMIN_EMAIL &&
      currentUser.email.toLowerCase() === process.env.ADMIN_EMAIL.toLowerCase();

    if (adminCount === 0 || isOwnerEmail) {
      const updated = await prisma.user.update({
        where: { id: currentUser.id },
        data: { role: "ADMIN" },
      });

      return NextResponse.json({
        message: "Your account has been elevated to Platform Administrator.",
        role: updated.role,
      });
    }

    return NextResponse.json(
      { error: "Admin already exists. Please contact the existing administrator." },
      { status: 403 }
    );
  } catch (error: any) {
    console.error("Promote admin error:", error);
    return NextResponse.json(
      { error: "Failed to promote user" },
      { status: 500 }
    );
  }
}
