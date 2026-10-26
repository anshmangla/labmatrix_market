import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();

    const listing = await prisma.listing.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        description: true,
        category: true,
        itemType: true,
        partNumber: true,
        compatibleWith: true,
        minPrice: true,
        maxPrice: true,
        condition: true,
        location: true,
        photos: true,
        quantity: true,
        status: true,
        isApproved: true,
        sellerId: true,
        createdAt: true,
        // PRIVACY RULE: Seller phone, email, and name are omitted!
      },
    });

    if (!listing) {
      return NextResponse.json(
        { error: "Listing not found" },
        { status: 404 }
      );
    }

    // If listing is not approved yet, only the seller or an admin can view it
    const isOwner = session?.user?.id === listing.sellerId;
    let isAdmin = false;
    if (session?.user?.id) {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { role: true },
      });
      isAdmin = user?.role === "ADMIN";
    }

    if (!listing.isApproved && !isOwner && !isAdmin) {
      return NextResponse.json(
        { error: "This listing is currently pending admin review." },
        { status: 403 }
      );
    }

    // Strip sellerId before returning to public
    const { sellerId, ...publicListing } = listing;

    return NextResponse.json({
      listing: publicListing,
      isOwner,
      isAdmin,
    });
  } catch (error: any) {
    console.error("Fetch listing by id error:", error);
    return NextResponse.json(
      { error: "Failed to fetch listing details" },
      { status: 500 }
    );
  }
}

// PATCH /api/listings/[id] - Allows sellers to edit their listing (resets to pending approval) or toggle status, and admins to manage
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
      minPrice,
      maxPrice,
      condition,
      location,
      photos,
      quantity,
      status,
      isApproved,
    } = body;

    const listing = await prisma.listing.findUnique({
      where: { id },
      select: {
        id: true,
        sellerId: true,
        title: true,
        itemType: true,
        isApproved: true,
      },
    });

    if (!listing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    // Verify user role directly from database
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    const isOwner = listing.sellerId === session.user.id;
    const isAdmin = user?.role === "ADMIN";

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { error: "Forbidden: You cannot edit this listing." },
        { status: 403 }
      );
    }

    const updateData: any = {};
    let contentChanged = false;

    // 1. Content field validations
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
      if (itemType === "MACHINE" || itemType === "SPARE_PART" || itemType === "NEW_INSTRUMENT") {
        updateData.itemType = itemType;
        contentChanged = true;
      }
    }

    if (quantity !== undefined) {
      const parsedQty = Math.max(1, parseInt(String(quantity), 10) || 1);
      updateData.quantity = parsedQty;
      contentChanged = true;
    }

    if (partNumber !== undefined) {
      updateData.partNumber = partNumber ? String(partNumber).trim().slice(0, 100) : null;
      contentChanged = true;
    }

    if (compatibleWith !== undefined) {
      updateData.compatibleWith = compatibleWith ? String(compatibleWith).trim().slice(0, 150) : null;
      contentChanged = true;
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      const parsedMin = Number(minPrice);
      const parsedMax = Number(maxPrice);
      if (
        isNaN(parsedMin) ||
        isNaN(parsedMax) ||
        !Number.isFinite(parsedMin) ||
        !Number.isFinite(parsedMax) ||
        parsedMin < 0 ||
        parsedMax < 0
      ) {
        return NextResponse.json(
          { error: "Pricing values must be valid non-negative numbers." },
          { status: 400 }
        );
      }
      if (parsedMin > parsedMax) {
        return NextResponse.json(
          { error: "Minimum price cannot be greater than maximum price." },
          { status: 400 }
        );
      }
      updateData.minPrice = parsedMin;
      updateData.maxPrice = parsedMax;
      contentChanged = true;
    }

    if (condition !== undefined) {
      updateData.condition = String(condition).slice(0, 100);
      contentChanged = true;
    }

    if (location !== undefined) {
      updateData.location = String(location).trim().slice(0, 100) || "India";
      contentChanged = true;
    }

    if (photos !== undefined) {
      if (Array.isArray(photos)) {
        if (photos.length > 10) {
          return NextResponse.json(
            { error: "A maximum of 10 photos can be attached per listing." },
            { status: 400 }
          );
        }
        updateData.photos = photos
          .filter(
            (p): p is string =>
              typeof p === "string" &&
              (p.startsWith("https://") || p.startsWith("data:image/") || p.startsWith("http://localhost"))
          )
          .slice(0, 10);
        contentChanged = true;
      }
    }

    // Status update (Available / Sold)
    if (status !== undefined) {
      if (status !== "AVAILABLE" && status !== "SOLD") {
        return NextResponse.json(
          { error: "Listing status must be Available or Sold." },
          { status: 400 }
        );
      }
      updateData.status = status;
    }

    // Admin can directly toggle approval
    if (isAdmin && typeof isApproved === "boolean") {
      updateData.isApproved = isApproved;
    } else if (!isAdmin && contentChanged) {
      // RULE: If a regular seller changes content, it MUST be re-approved by admin!
      updateData.isApproved = false;
    }

    const updated = await prisma.listing.update({
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
            title: "Listing Edits Submitted for Review",
            message: `Your changes to "${updated.title}" have been saved and are under admin review. Once approved, the updated listing will appear live on the marketplace.`,
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
              title: `Listing Edited: ${updated.title}`,
              message: `${userName} made changes to "${updated.title}". Please review and re-approve on the Admin Deal Desk.`,
              link: "/admin",
            })),
          });
        }
      } catch (notifErr) {
        console.error("Failed to create notifications for listing edit:", notifErr);
      }
    }

    // If an admin just approved the listing, notify the seller
    if (isAdmin && isApproved === true) {
      try {
        await prisma.notification.create({
          data: {
            userId: updated.sellerId,
            type: "ENTRY_APPROVED",
            title: "🎉 Listing Approved & Live!",
            message: `Your listing "${updated.title}" has been approved by admin and is now publicly live on the marketplace.`,
            link:
              updated.itemType === "SPARE_PART"
                ? "/spare-parts"
                : updated.itemType === "NEW_INSTRUMENT"
                ? "/new-instruments"
                : `/listings/${updated.id}`,
          },
        });
      } catch (notifErr) {
        console.error("Failed to create approval notification for listing:", notifErr);
      }
    }

    // Invalidate cached pages
    try {
      revalidatePath("/listings");
      revalidatePath("/spare-parts");
      revalidatePath("/new-instruments");
      revalidatePath("/");
      revalidatePath(`/listings/${id}`);
    } catch (e) {
      console.warn("Revalidation error:", e);
    }

    return NextResponse.json({
      message: contentChanged && !isAdmin
        ? "Listing updated successfully! Your changes are pending admin re-approval before appearing live."
        : "Listing updated successfully.",
      listing: updated,
      requiresReapproval: contentChanged && !isAdmin,
    });
  } catch (error: any) {
    console.error("Update listing error:", error);
    return NextResponse.json(
      { error: "Failed to update listing" },
      { status: 500 }
    );
  }
}

// DELETE /api/listings/[id] - STRICTLY RESTRICTED TO ADMIN ONLY
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check admin role
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (user?.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden: Only platform administrators can delete listings." },
        { status: 403 }
      );
    }

    const { id } = await params;

    await prisma.listing.delete({
      where: { id },
    });

    try {
      revalidatePath("/listings");
      revalidatePath("/spare-parts");
      revalidatePath("/new-instruments");
      revalidatePath("/");
      revalidatePath(`/listings/${id}`);
    } catch (e) {
      console.warn("Revalidation error:", e);
    }

    return NextResponse.json({
      message: "Listing successfully deleted by administrator.",
    });
  } catch (error: any) {
    console.error("Delete listing error:", error);
    return NextResponse.json(
      { error: "Failed to delete listing" },
      { status: 500 }
    );
  }
}
