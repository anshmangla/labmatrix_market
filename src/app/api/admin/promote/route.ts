import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!currentUser || !currentUser.email) {
      return NextResponse.json({ error: "User not found or email missing" }, { status: 404 });
    }

    // Strictly allow promotion ONLY if user's email matches ADMIN_EMAIL/ADMIN_EMAILS environment variable
    const configuredAdminEmails = (process.env.ADMIN_EMAIL || process.env.ADMIN_EMAILS || "")
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);

    if (configuredAdminEmails.length === 0) {
      return NextResponse.json(
        { error: "Admin bootstrap is not configured on this server. Please set ADMIN_EMAIL in environment." },
        { status: 403 }
      );
    }

    const isOwnerEmail = configuredAdminEmails.includes(currentUser.email.toLowerCase());

    if (!isOwnerEmail) {
      return NextResponse.json(
        { error: "Forbidden: Your email address is not authorized for administrator access." },
        { status: 403 }
      );
    }

    const updated = await prisma.user.update({
      where: { id: currentUser.id },
      data: { role: "ADMIN" },
    });

    return NextResponse.json({
      message: "Your account has been elevated to Platform Administrator.",
      role: updated.role,
    });
  } catch (error: any) {
    console.error("Promote admin error:", error);
    return NextResponse.json(
      { error: "Failed to promote user" },
      { status: 500 }
    );
  }
}
