import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// GET /api/requirements - List all open machine requirements
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const query = searchParams.get("query");

    const where: any = {
      status: "OPEN",
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

    const requirements = await prisma.requirement.findMany({
      where,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        description: true,
        category: true,
        status: true,
        createdAt: true,
        // STRICT PRIVACY: Buyer name, phone number, and email are NEVER exposed to the public!
      },
    });

    return NextResponse.json({ requirements });
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

    const body = await request.json();
    const { title, description, category, phoneNumber, companyName } = body;

    if (!title?.trim() || !description?.trim() || !category?.trim()) {
      return NextResponse.json(
        { error: "Title, category, and specifications description are required." },
        { status: 400 }
      );
    }

    // Check user contact info
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { phoneNumber: true, companyName: true },
    });

    const finalPhone = currentUser?.phoneNumber || phoneNumber?.trim();
    const finalCompany = currentUser?.companyName || companyName?.trim();

    if (!finalPhone) {
      return NextResponse.json(
        {
          error:
            "Mobile number is required to post a requirement. This is only visible to the admin.",
        },
        { status: 400 }
      );
    }

    // Update user contact info if newly provided
    if (phoneNumber || companyName) {
      await prisma.user.update({
        where: { id: session.user.id },
        data: {
          phoneNumber: finalPhone,
          companyName: finalCompany || null,
        },
      });
    }

    const requirement = await prisma.requirement.create({
      data: {
        title: title.trim(),
        description: description.trim(),
        category: category.trim(),
        buyerId: session.user.id,
        status: "OPEN",
      },
    });

    return NextResponse.json(
      {
        message: "Equipment requirement posted successfully!",
        requirementId: requirement.id,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Create requirement error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to post requirement" },
      { status: 500 }
    );
  }
}
