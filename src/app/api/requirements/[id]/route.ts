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
    let isAdmin = false;
    if (session?.user?.id) {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { role: true },
      });
      isAdmin = user?.role === "ADMIN";
    }

    if (!requirement.isApproved && !isOwner && !isAdmin) {
      return NextResponse.json(
        { error: "This requirement is currently pending admin review." },
        { status: 403 }
      );
    }

    const { buyerId, ...publicRequirement } = requirement;

    return NextResponse.json({
      requirement: publicRequirement,
      isOwner,
      isAdmin,
    });
  } catch (error: any) {
    console.error("Fetch requirement by id error:", error);
    return NextResponse.json(
      { error: "Failed to fetch requirement details" },
      { status: 500 }
    );
  }
}

// PATCH /api/requirements/[id] - Allows buyers to edit their requirement (resets to pending approval) or toggle status, and admins to manage
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
    const {
      title,
      description,
      category,
      itemType,
      partNumber,
      compatibleWith,
      status,
      isApproved,
    } = body;

    const req = await prisma.requirement.findUnique({
      where: { id },
      select: {
        id: true,
        buyerId: true,
        title: true,
        itemType: true,
        isApproved: true,
      },
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

    const updateData: any = {};
    let contentChanged = false;

    // Content fields
    if (title !== undefined) {
      const trimmedTitle = String(title).trim();
      if (trimmedTitle.length < 3 || trimmedTitle.length > 120) {
        return NextResponse.json(
          { error: "Title must be between 3 and 120 characters." },
          { status: 400 }
        );
      }
      updateData.title = trimmedTitle;
      contentChanged = true;
    }

    if (description !== undefined) {
      const trimmedDesc = String(description).trim();
      if (trimmedDesc.length < 10 || trimmedDesc.length > 5000) {
        return NextResponse.json(
          { error: "Description must be between 10 and 5,000 characters." },
          { status: 400 }
        );
      }
      updateData.description = trimmedDesc;
      contentChanged = true;
    }

    if (category !== undefined) {
      updateData.category = String(category).trim().slice(0, 100);
      contentChanged = true;
    }

    if (itemType !== undefined) {
      if (itemType === "MACHINE" || itemType === "SPARE_PART") {
        updateData.itemType = itemType;
        contentChanged = true;
      }
    }

    if (partNumber !== undefined) {
      updateData.partNumber = partNumber ? String(partNumber).trim().slice(0, 100) : null;
      contentChanged = true;
    }

    if (compatibleWith !== undefined) {
      updateData.compatibleWith = compatibleWith ? String(compatibleWith).trim().slice(0, 150) : null;
      contentChanged = true;
    }

    // Status update (OPEN / FULFILLED)
    if (status !== undefined) {
      if (status !== "OPEN" && status !== "FULFILLED") {
        return NextResponse.json(
          { error: "Requirement status must be OPEN or FULFILLED." },
          { status: 400 }
        );
      }
      updateData.status = status;
    }

    // Admin can directly toggle approval
    if (isAdmin && typeof isApproved === "boolean") {
      updateData.isApproved = isApproved;
    } else if (!isAdmin && contentChanged) {
      // RULE: If a regular buyer edits content, it MUST be re-approved by admin!
      updateData.isApproved = false;
    }

    const updated = await prisma.requirement.update({
      where: { id },
      data: updateData,
    });

    // Notify user and admin if content was edited by owner
    if (!isAdmin && contentChanged) {
      try {
        // 1. Notify the user that edits require approval
        await prisma.notification.create({
          data: {
            userId: session.user.id,
            type: "ENTRY_PENDING",
            title: "Requirement Edits Submitted for Review",
            message: `Your changes to "${updated.title}" have been saved and are under admin review. Once approved, the updated request will appear live on the marketplace.`,
            link: "/dashboard",
          },
        });

        // 2. Notify all platform administrators
        const admins = await prisma.user.findMany({
          where: { role: "ADMIN" },
          select: { id: true },
        });

        if (admins.length > 0) {
          const userName = session.user?.name || session.user?.email || "User";
          await prisma.notification.createMany({
            data: admins.map((admin) => ({
              userId: admin.id,
              type: "ADMIN_REVIEW",
              title: `Buyer Request Edited: ${updated.title}`,
              message: `${userName} made changes to "${updated.title}". Please review and re-approve on the Admin Deal Desk.`,
              link: "/admin",
            })),
          });
        }
      } catch (notifErr) {
        console.error("Failed to create notifications for requirement edit:", notifErr);
      }
    }

    // If an admin just approved the requirement, notify the buyer
    if (isAdmin && isApproved === true) {
      try {
        await prisma.notification.create({
          data: {
            userId: updated.buyerId,
            type: "ENTRY_APPROVED",
            title: "🎉 Buyer Request Approved & Live!",
            message: `Your request "${updated.title}" has been approved by admin and is now publicly live on the marketplace.`,
            link: updated.itemType === "SPARE_PART" ? "/spare-parts" : `/requests/${updated.id}`,
          },
        });
      } catch (notifErr) {
        console.error("Failed to create approval notification for requirement:", notifErr);
      }
    }

    return NextResponse.json({
      message: contentChanged && !isAdmin
        ? "Request updated successfully! Your changes are pending admin re-approval before appearing live."
        : "Request updated successfully.",
      requirement: updated,
      requiresReapproval: contentChanged && !isAdmin,
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
