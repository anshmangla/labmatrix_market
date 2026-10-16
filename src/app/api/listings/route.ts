import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rate-limit";

// GET /api/listings - Get all listings with optional filtering and pagination
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const itemType = searchParams.get("itemType");
    const query = searchParams.get("query");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");

    // Pagination parameters (default 30 per page, capped at 50 to prevent DoS)
    const page = Math.max(1, parseInt(searchParams.get("page") || "1") || 1);
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "30") || 30));
    const skip = (page - 1) * limit;

    const statusParam = searchParams.get("status");

    const where: any = {
      isApproved: true,
    };

    if (statusParam && statusParam !== "ALL") {
      where.status = statusParam;
    } else {
      where.status = { in: ["AVAILABLE", "SOLD"] };
    }

    if (itemType && itemType !== "ALL") {
      where.itemType = itemType;
    }

    if (category && category !== "ALL") {
      where.category = category;
    }

    if (query) {
      where.OR = [
        { title: { contains: query, mode: "insensitive" } },
        { description: { contains: query, mode: "insensitive" } },
        { partNumber: { contains: query, mode: "insensitive" } },
        { compatibleWith: { contains: query, mode: "insensitive" } },
      ];
    }

    if (minPrice || maxPrice) {
      where.minPrice = {};
      if (minPrice) where.minPrice.gte = parseFloat(minPrice);
      if (maxPrice) where.maxPrice = { lte: parseFloat(maxPrice) };
    }

    const [listings, total] = await Promise.all([
      prisma.listing.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: limit,
        skip,
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
          createdAt: true,
          // NOTICE: Seller name, phone number, and email are NEVER returned to the client!
        },
      }),
      prisma.listing.count({ where }),
    ]);

    return NextResponse.json(
      {
        listings,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
        },
      }
    );
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

    // Rate limit: Max 20 listings per hour per user
    const rateLimit = checkRateLimit(`listing:${session.user.id}`, 20, 60 * 60 * 1000);
    if (!rateLimit.success) {
      return NextResponse.json(
        { error: "Listing creation limit reached. Please wait before creating more listings." },
        {
          status: 429,
          headers: { "Retry-After": rateLimit.resetSeconds.toString() },
        }
      );
    }

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
      phoneNumber,
      companyName,
    } = body;

    if (!title || !description || !category || minPrice === undefined || maxPrice === undefined) {
      return NextResponse.json(
        { error: "Title, description, category, and price range are required." },
        { status: 400 }
      );
    }

    // 1. Text length validation
    const trimmedTitle = String(title).trim();
    const trimmedDesc = String(description).trim();
    const trimmedCategory = String(category).trim();

    if (trimmedTitle.length < 3 || trimmedTitle.length > 150) {
      return NextResponse.json(
        { error: "Title must be between 3 and 150 characters." },
        { status: 400 }
      );
    }

    if (trimmedDesc.length < 10 || trimmedDesc.length > 5000) {
      return NextResponse.json(
        { error: "Description must be between 10 and 5,000 characters." },
        { status: 400 }
      );
    }

    // 2. Numerical price range validation
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

    const parsedQuantity = quantity !== undefined ? Math.max(1, parseInt(String(quantity), 10) || 1) : 1;

    // 3. Photo array sanitization and limit
    let sanitizedPhotos: string[] = [];
    if (Array.isArray(photos)) {
      if (photos.length > 10) {
        return NextResponse.json(
          { error: "A maximum of 10 photos can be attached per listing." },
          { status: 400 }
        );
      }
      sanitizedPhotos = photos
        .filter((p): p is string => 
          typeof p === "string" && 
          (p.startsWith("https://") || p.startsWith("data:image/") || p.startsWith("http://localhost"))
        )
        .slice(0, 10);
    }

    // Check user's current contact info
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { phoneNumber: true, companyName: true },
    });

    // If user doesn't have phone number on file yet, it must be provided with this post
    const finalPhone = currentUser?.phoneNumber || (typeof phoneNumber === "string" ? phoneNumber.trim() : "");
    const finalCompany = currentUser?.companyName || (typeof companyName === "string" ? companyName.trim() : "");

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

    if (finalPhone.length > 30) {
      return NextResponse.json(
        { error: "Phone number is too long." },
        { status: 400 }
      );
    }

    // Update user profile if phone or company were newly provided
    if (phoneNumber || companyName) {
      await prisma.user.update({
        where: { id: session.user.id },
        data: {
          phoneNumber: finalPhone,
          companyName: finalCompany ? finalCompany.slice(0, 100) : null,
        },
      });
    }

    // Create the listing
    const resolvedItemType =
      itemType || (trimmedCategory === "Spare Parts & Consumables" ? "SPARE_PART" : "MACHINE");

    const listing = await prisma.listing.create({
      data: {
        title: trimmedTitle,
        description: trimmedDesc,
        category: trimmedCategory.slice(0, 100),
        itemType: resolvedItemType,
        partNumber: partNumber && typeof partNumber === "string" ? partNumber.trim().slice(0, 100) : null,
        compatibleWith: compatibleWith && typeof compatibleWith === "string" ? compatibleWith.trim().slice(0, 150) : null,
        minPrice: parsedMin,
        maxPrice: parsedMax,
        condition: condition && typeof condition === "string" ? condition.slice(0, 100) : "Used - Good",
        location: location && typeof location === "string" ? location.trim().slice(0, 100) : "India",
        photos: sanitizedPhotos,
        quantity: parsedQuantity,
        sellerId: session.user.id,
      },
    });

    // Create an in-app notification for the user
    try {
      const itemLabel =
        resolvedItemType === "SPARE_PART"
          ? "spare part"
          : resolvedItemType === "NEW_INSTRUMENT"
          ? "new instrument"
          : "machine";

      await prisma.notification.create({
        data: {
          userId: session.user.id,
          type: "ENTRY_PENDING",
          title: "Entry Submitted for Approval",
          message: `Your ${itemLabel} listing "${listing.title}" is under admin review. Once approved, it will be published on the marketplace.`,
          link: "/dashboard",
        },
      });
    } catch (notifErr) {
      console.error("Failed to create pending notification for listing:", notifErr);
    }

    return NextResponse.json(
      {
        message:
          resolvedItemType === "SPARE_PART"
            ? "Spare part listing submitted successfully! It will be reviewed by the admin before appearing on the site."
            : resolvedItemType === "NEW_INSTRUMENT"
            ? "New instrument listing submitted successfully! It will be reviewed by the admin before appearing on the site."
            : "Machine listing submitted successfully! It will be reviewed by the admin before appearing on the site.",
        listingId: listing.id,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Create listing error:", error);
    return NextResponse.json(
      { error: "Failed to create listing. Please verify your inputs and try again." },
      { status: 500 }
    );
  }
}
