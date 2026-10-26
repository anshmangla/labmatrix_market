import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { sendUserListingApprovedEmail } from "@/lib/resend";

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

    const [listings, total] = await Promise.all([
      prisma.listing.findMany({
        orderBy: { createdAt: "desc" },
        take: limit,
        skip,
        include: {
          seller: {
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
      prisma.listing.count(),
    ]);

    return NextResponse.json({
      listings,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error("Admin fetch listings error:", error);
    return NextResponse.json(
      { error: "Failed to fetch listings" },
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

    const existing = await prisma.listing.findUnique({
      where: { id },
      select: { isApproved: true },
    });

    const updateData: any = {};
    if (status) updateData.status = status;
    if (typeof isApproved === "boolean") updateData.isApproved = isApproved;

    const updated = await prisma.listing.update({
      where: { id },
      data: updateData,
      include: {
        seller: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Notify user if listing was just approved (and was not already approved)
    if (isApproved === true && !existing?.isApproved) {
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

      // Dispatch congratulatory email to user with live listing link
      if (updated.seller?.email) {
        sendUserListingApprovedEmail({
          userEmail: updated.seller.email,
          userName: updated.seller.name,
          listingId: updated.id,
          title: updated.title,
          itemType: updated.itemType,
          category: updated.category,
          minPrice: updated.minPrice,
          maxPrice: updated.maxPrice,
        }).catch((emailErr) => {
          console.error("[Admin Approval] Failed to dispatch user approval email:", emailErr);
        });
      }
    }

    try {
      revalidatePath("/listings");
      revalidatePath("/spare-parts");
      revalidatePath("/new-instruments");
      revalidatePath("/");
      revalidatePath(`/listings/${id}`);
    } catch (e) {
      console.warn("Revalidation error:", e);
    }

    return NextResponse.json({ listing: updated });
  } catch (error: any) {
    console.error("Admin update listing error:", error);
    return NextResponse.json(
      { error: "Failed to update listing" },
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
      return NextResponse.json({ error: "Listing ID is required" }, { status: 400 });
    }

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

    return NextResponse.json({ message: "Listing deleted successfully" });
  } catch (error: any) {
    console.error("Admin delete listing error:", error);
    return NextResponse.json(
      { error: "Failed to delete listing" },
      { status: 500 }
    );
  }
}
