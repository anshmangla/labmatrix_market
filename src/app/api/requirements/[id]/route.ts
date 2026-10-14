import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();

    const requirement = await prisma.requirement.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        description: true,
        category: true,
        itemType: true,
        partNumber: true,
        compatibleWith: true,
        status: true,
        isApproved: true,
        buyerId: true,
        createdAt: true,
        // STRICT PRIVACY: Buyer details are never selected for public viewing
      },
    });

    if (!requirement) {
      return NextResponse.json(
        { error: "Requirement not found" },
        { status: 404 }
      );
    }

    // If not approved yet, only the buyer or an admin can view it
    const isOwner = session?.user?.id === requirement.buyerId;
    const isAdmin = (session?.user as any)?.role === "ADMIN";

    if (!requirement.isApproved && !isOwner && !isAdmin) {
      return NextResponse.json(
        { error: "This requirement is currently pending admin review." },
        { status: 403 }
      );
    }

    const { buyerId, ...publicRequirement } = requirement;

    return NextResponse.json({ requirement: publicRequirement });
  } catch (error: any) {
    console.error("Fetch requirement by id error:", error);
    return NextResponse.json(
      { error: "Failed to fetch requirement details" },
      { status: 500 }
    );
  }
}

// PATCH /api/requirements/[id] - Allows buyers to toggle status (OPEN / FULFILLED) and admins to manage
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { status, isApproved } = body;

    const req = await prisma.requirement.findUnique({
      where: { id },
      select: { buyerId: true },
    });

    if (!req) {
      return NextResponse.json({ error: "Requirement not found" }, { status: 404 });
    }

    // Verify user role directly from database
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    const isOwner = req.buyerId === session.user.id;
    const isAdmin = user?.role === "ADMIN";

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { error: "Forbidden: You cannot edit this requirement." },
        { status: 403 }
      );
    }

    // Regular users can ONLY edit status between OPEN and FULFILLED
    if (!isAdmin) {
      if (status !== "OPEN" && status !== "FULFILLED") {
        return NextResponse.json(
          { error: "You can only toggle status between Open and Fulfilled." },
          { status: 400 }
        );
      }

      const updated = await prisma.requirement.update({
        where: { id },
        data: { status },
      });

      return NextResponse.json({
        message: "Status updated successfully",
        requirement: updated,
      });
    }

    // Admin can update status and approval
    const updateData: any = {};
    if (status) updateData.status = status;
    if (typeof isApproved === "boolean") updateData.isApproved = isApproved;

    const updated = await prisma.requirement.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      message: "Requirement updated by admin",
      requirement: updated,
    });
  } catch (error: any) {
    console.error("Update requirement error:", error);
    return NextResponse.json(
      { error: "Failed to update requirement" },
      { status: 500 }
    );
  }
}

// DELETE /api/requirements/[id] - STRICTLY RESTRICTED TO ADMIN ONLY
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (user?.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden: Only platform administrators can delete requirements." },
        { status: 403 }
      );
    }

    const { id } = await params;

    await prisma.requirement.delete({
      where: { id },
    });

    return NextResponse.json({
      message: "Requirement successfully deleted by administrator.",
    });
  } catch (error: any) {
    console.error("Delete requirement error:", error);
    return NextResponse.json(
      { error: "Failed to delete requirement" },
      { status: 500 }
    );
  }
}
