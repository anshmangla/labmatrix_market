import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rate-limit";

// GET /api/requirements - List all open machine requirements with pagination
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const itemType = searchParams.get("itemType");
    const query = searchParams.get("query");

    // Pagination parameters (default 30 per page, capped at 50 to prevent DoS)
    const page = Math.max(1, parseInt(searchParams.get("page") || "1") || 1);
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "30") || 30));
    const skip = (page - 1) * limit;

    const where: any = {
      isApproved: true,
      status: "OPEN",
    };

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

    const [requirements, total] = await Promise.all([
      prisma.requirement.findMany({
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
          status: true,
          createdAt: true,
          // STRICT PRIVACY: Buyer name, phone number, and email are NEVER exposed to the public!
        },
      }),
      prisma.requirement.count({ where }),
    ]);

    return NextResponse.json(
      {
        requirements,
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
    console.error("Fetch requirements error:", error);
    return NextResponse.json(
      { error: "Failed to fetch equipment requirements" },
      { status: 500 }
    );
  }
}

// POST /api/requirements - Submit a new equipment request
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized. Please sign in to post a requirement." },
        { status: 401 }
      );
    }

    // Rate limit: Max 20 requirements per hour per user
    const rateLimit = checkRateLimit(`requirement:${session.user.id}`, 20, 60 * 60 * 1000);
    if (!rateLimit.success) {
      return NextResponse.json(
        { error: "Requirement creation limit reached. Please wait before posting more requirements." },
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
      phoneNumber,
      companyName,
    } = body;

    if (!title || !description || !category) {
      return NextResponse.json(
        { error: "Title, category, and specifications description are required." },
        { status: 400 }
      );
    }

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

    // Check user contact info
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { phoneNumber: true, companyName: true },
    });

    const finalPhone = currentUser?.phoneNumber || (typeof phoneNumber === "string" ? phoneNumber.trim() : "");
    const finalCompany = currentUser?.companyName || (typeof companyName === "string" ? companyName.trim() : "");

    if (!finalPhone) {
      return NextResponse.json(
        {
          error:
            "Mobile number is required to post a requirement. This is only visible to the admin.",
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

    // Update user contact info if newly provided
    if (phoneNumber || companyName) {
      await prisma.user.update({
        where: { id: session.user.id },
        data: {
          phoneNumber: finalPhone,
          companyName: finalCompany ? finalCompany.slice(0, 100) : null,
        },
      });
    }

    const resolvedItemType =
      itemType || (trimmedCategory === "Spare Parts & Consumables" ? "SPARE_PART" : "MACHINE");

    const requirement = await prisma.requirement.create({
      data: {
        title: trimmedTitle,
        description: trimmedDesc,
        category: trimmedCategory.slice(0, 100),
        itemType: resolvedItemType,
        partNumber: partNumber && typeof partNumber === "string" ? partNumber.trim().slice(0, 100) : null,
        compatibleWith: compatibleWith && typeof compatibleWith === "string" ? compatibleWith.trim().slice(0, 150) : null,
        buyerId: session.user.id,
        status: "OPEN",
      },
    });

    // Create an in-app notification for the user
    try {
      await prisma.notification.create({
        data: {
          userId: session.user.id,
          type: "ENTRY_PENDING",
          title: "Request Submitted for Approval",
          message: `Your ${resolvedItemType === "SPARE_PART" ? "spare part" : "equipment"} request "${requirement.title}" is under admin review. Once approved, it will be published on the marketplace.`,
          link: "/dashboard",
        },
      });
    } catch (notifErr) {
      console.error("Failed to create pending notification for requirement:", notifErr);
    }

    return NextResponse.json(
      {
        message:
          resolvedItemType === "SPARE_PART"
            ? "Spare part request submitted successfully! It will be reviewed by the admin before appearing on the site."
            : "Equipment requirement submitted successfully! It will be reviewed by the admin before appearing on the site.",
        requirementId: requirement.id,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Create requirement error:", error);
    return NextResponse.json(
      { error: "Failed to post requirement. Please verify your inputs and try again." },
      { status: 500 }
    );
  }
}
