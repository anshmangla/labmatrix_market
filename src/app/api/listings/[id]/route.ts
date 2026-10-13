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
    const isAdmin = (session?.user as any)?.role === "ADMIN";

    if (!listing.isApproved && !isOwner && !isAdmin) {
      return NextResponse.json(
        { error: "This listing is currently pending admin review." },
        { status: 403 }
      );
    }

    // Strip sellerId before returning to public
    const { sellerId, ...publicListing } = listing;

    return NextResponse.json({ listing: publicListing });
  } catch (error: any) {
    console.error("Fetch listing by id error:", error);
    return NextResponse.json(
      { error: "Failed to fetch listing details" },
      { status: 500 }
    );
  }
}

// PATCH /api/listings/[id] - Allows sellers to update status (AVAILABLE / SOLD) and admins to manage
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

    const listing = await prisma.listing.findUnique({
      where: { id },
      select: { sellerId: true },
    });

    if (!listing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    const isOwner = listing.sellerId === session.user.id;
    const isAdmin = (session.user as any)?.role === "ADMIN";

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { error: "Forbidden: You cannot edit this listing." },
        { status: 403 }
      );
    }

    // Regular users can ONLY edit availability status between AVAILABLE and SOLD
    if (!isAdmin) {
      if (status !== "AVAILABLE" && status !== "SOLD") {
        return NextResponse.json(
          { error: "You can only set your listing status to Available or Sold." },
          { status: 400 }
        );
      }

      const updated = await prisma.listing.update({
        where: { id },
        data: { status },
      });

      return NextResponse.json({
        message: "Status updated successfully",
        listing: updated,
      });
    }

    // Admin can update status and approval
    const updateData: any = {};
    if (status) updateData.status = status;
    if (typeof isApproved === "boolean") updateData.isApproved = isApproved;

    const updated = await prisma.listing.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      message: "Listing updated by admin",
      listing: updated,
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
