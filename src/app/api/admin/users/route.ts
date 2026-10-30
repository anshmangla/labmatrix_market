import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth-session";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const session = await getAuthSession(request);
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

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1") || 1);
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "50") || 50));
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        orderBy: { createdAt: "desc" },
        take: limit,
        skip,
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
      }),
      prisma.user.count(),
    ]);

    return NextResponse.json({
      users,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
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
    const session = await getAuthSession(req);
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

export async function DELETE(req: Request) {
  try {
    const session = await getAuthSession(req);
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

    const { userId } = await req.json().catch(() => ({}));

    if (!userId || typeof userId !== "string") {
      return NextResponse.json({ error: "A valid user ID is required." }, { status: 400 });
    }

    // Safety check: Prevent self-deletion via admin console
    if (userId === session.user.id) {
      return NextResponse.json(
        { error: "You cannot delete your own account from the administrator console." },
        { status: 400 }
      );
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!targetUser) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    const originalEmail = targetUser.email;
    const isAlreadyArchived = originalEmail.includes("@archived.labmatrixindia.com");

    if (isAlreadyArchived) {
      return NextResponse.json(
        { error: "This user account is already archived." },
        { status: 400 }
      );
    }

    const archivedEmail = `deleted_${targetUser.id}_${Date.now()}@archived.labmatrixindia.com`;

    // 1. Anonymize user record
    await prisma.user.update({
      where: { id: targetUser.id },
      data: {
        name: "Deleted User",
        email: archivedEmail,
        phoneNumber: null,
        companyName: null,
        password: null,
        image: null,
        role: "USER",
      },
    });

    // 2. Archive user's equipment listings (mark as unapproved and SOLD so they are removed from public view)
    await prisma.listing.updateMany({
      where: { sellerId: targetUser.id },
      data: {
        status: "SOLD",
        isApproved: false,
      },
    });

    // 3. Archive user's buyer requirements (mark as CLOSED and unapproved)
    await prisma.requirement.updateMany({
      where: { buyerId: targetUser.id },
      data: {
        status: "CLOSED",
        isApproved: false,
      },
    });

    // 4. Invalidate all sessions, OAuth accounts, notifications, and verification tokens
    await Promise.all([
      prisma.session.deleteMany({ where: { userId: targetUser.id } }),
      prisma.account.deleteMany({ where: { userId: targetUser.id } }),
      prisma.notification.deleteMany({ where: { userId: targetUser.id } }),
      prisma.verificationToken.deleteMany({
        where: {
          identifier: { in: [originalEmail, `reset:${originalEmail}`] },
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: `User account for ${originalEmail} has been deactivated and records archived.`,
    });
  } catch (error: any) {
    console.error("Admin delete user error:", error);
    return NextResponse.json(
      { error: "Failed to delete user account." },
      { status: 500 }
    );
  }
}
