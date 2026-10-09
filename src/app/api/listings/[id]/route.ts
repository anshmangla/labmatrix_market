import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const listing = await prisma.listing.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        description: true,
        category: true,
        minPrice: true,
        maxPrice: true,
        condition: true,
        location: true,
        photos: true,
        status: true,
        createdAt: true,
        // CONFIDENTIALITY RULE: Seller phone, email, and name are omitted!
      },
    });

    if (!listing) {
      return NextResponse.json(
        { error: "Listing not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ listing });
  } catch (error: any) {
    console.error("Fetch listing by id error:", error);
    return NextResponse.json(
      { error: "Failed to fetch listing details" },
      { status: 500 }
    );
  }
}
