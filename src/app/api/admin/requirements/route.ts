import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
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

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1") || 1);
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "50") || 50));
    const skip = (page - 1) * limit;

    const [requirements, total] = await Promise.all([
      prisma.requirement.findMany({
        orderBy: { createdAt: "desc" },
        take: limit,
        skip,
        include: {
          buyer: {
            select: {
              id: true,
              name: true,
              email: true,
              phoneNumber: true,
              companyName: true,
            },
          },
          _count: {
            select: {
              inquiries: true,
            },
          },
        },
      }),
      prisma.requirement.count(),
    ]);

    return NextResponse.json({
      requirements,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error("Admin fetch requirements error:", error);
    return NextResponse.json(
      { error: "Failed to fetch requirements" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
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

    const body = await request.json();
    const { id, status, isApproved } = body;

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    const updateData: any = {};
    if (status) updateData.status = status;
    if (typeof isApproved === "boolean") updateData.isApproved = isApproved;

    const updated = await prisma.requirement.update({
      where: { id },
      data: updateData,
    });

    // Notify user if requirement was just approved
    if (isApproved === true) {
      try {
        await prisma.notification.create({
          data: {
            userId: updated.buyerId,
            type: "ENTRY_APPROVED",
            title: "🎉 Request Approved & Live!",
            message: `Your procurement request "${updated.title}" has been approved by admin and is now visible to sellers on the marketplace.`,
            link: updated.itemType === "SPARE_PART" ? "/spare-parts?tab=wanted" : `/requests/${updated.id}`,
          },
        });
      } catch (notifErr) {
        console.error("Failed to create approval notification for requirement:", notifErr);
      }
    }

    return NextResponse.json({ requirement: updated });
  } catch (error: any) {
    console.error("Admin update requirement error:", error);
    return NextResponse.json(
      { error: "Failed to update requirement" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
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

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Requirement ID is required" }, { status: 400 });
    }

    await prisma.requirement.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Requirement deleted successfully" });
  } catch (error: any) {
    console.error("Admin delete requirement error:", error);
    return NextResponse.json(
      { error: "Failed to delete requirement" },
      { status: 500 }
    );
  }
}
