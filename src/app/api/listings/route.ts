import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// GET /api/listings - Get all listings with optional filtering
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const query = searchParams.get("query");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");

    const where: any = {
      status: "AVAILABLE",
    };

    if (category && category !== "ALL") {
      where.category = category;
    }

    if (query) {
      where.OR = [
        { title: { contains: query, mode: "insensitive" } },
        { description: { contains: query, mode: "insensitive" } },
      ];
    }

    if (minPrice || maxPrice) {
      where.minPrice = {};
      if (minPrice) where.minPrice.gte = parseFloat(minPrice);
      if (maxPrice) where.maxPrice = { lte: parseFloat(maxPrice) };
    }

    const listings = await prisma.listing.findMany({
      where,
      orderBy: { createdAt: "desc" },
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
        // NOTICE: Seller name, phone number, and email are NEVER returned to the client!
      },
    });

    return NextResponse.json({ listings });
  } catch (error: any) {
    console.error("Fetch listings error:", error);
    return NextResponse.json(
      { error: "Failed to fetch listings" },
      { status: 500 }
    );
  }
}

// POST /api/listings - Add a new machine listing
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized. Please sign in to list a machine." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      title,
      description,
      category,
      minPrice,
      maxPrice,
      condition,
      location,
      photos,
      phoneNumber,
      companyName,
    } = body;

    if (!title || !description || !category || minPrice === undefined || maxPrice === undefined) {
      return NextResponse.json(
        { error: "Title, description, category, and price range are required." },
        { status: 400 }
      );
    }

    // Check user's current contact info
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { phoneNumber: true, companyName: true },
    });

    // If user doesn't have phone number on file yet, it must be provided with this post
    const finalPhone = currentUser?.phoneNumber || phoneNumber?.trim();
    const finalCompany = currentUser?.companyName || companyName?.trim();

    if (!finalPhone) {
      return NextResponse.json(
        {
          error:
            "Mobile number is required to list equipment. This remains private to the admin only.",
          requireContactInfo: true,
        },
        { status: 400 }
      );
    }

    // Update user profile if phone or company were newly provided
    if (phoneNumber || companyName) {
      await prisma.user.update({
        where: { id: session.user.id },
        data: {
          phoneNumber: finalPhone,
          companyName: finalCompany || null,
        },
      });
    }

    // Create the listing
    const listing = await prisma.listing.create({
      data: {
        title: title.trim(),
        description: description.trim(),
        category: category.trim(),
        minPrice: parseFloat(minPrice),
        maxPrice: parseFloat(maxPrice),
        condition: condition || "Used - Good",
        location: location?.trim() || "India",
        photos: Array.isArray(photos) ? photos : [],
        sellerId: session.user.id,
      },
    });

    return NextResponse.json(
      { message: "Machine listed successfully!", listingId: listing.id },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Create listing error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create listing" },
      { status: 500 }
    );
  }
}
