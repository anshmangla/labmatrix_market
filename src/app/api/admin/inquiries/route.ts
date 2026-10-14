import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
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
      return NextResponse.json({ error: "Forbidden: Admin only" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1") || 1);
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "50") || 50));
    const skip = (page - 1) * limit;

    const [inquiries, total] = await Promise.all([
      prisma.inquiry.findMany({
        orderBy: { createdAt: "desc" },
        take: limit,
        skip,
      include: {
        inquirer: {
          select: {
            id: true,
            name: true,
            email: true,
            phoneNumber: true,
            companyName: true,
          },
        },
        listing: {
          select: {
            id: true,
            title: true,
            category: true,
            minPrice: true,
            maxPrice: true,
            seller: {
              select: {
                id: true,
                name: true,
                email: true,
                phoneNumber: true,
                companyName: true,
              },
            },
          },
        },
        requirement: {
          select: {
            id: true,
            title: true,
            category: true,
            buyer: {
              select: {
                id: true,
                name: true,
                email: true,
                phoneNumber: true,
                companyName: true,
              },
            },
          },
        },
      },
    }),
    prisma.inquiry.count(),
  ]);

    return NextResponse.json({
      inquiries,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error("Admin inquiries error:", error);
    return NextResponse.json(
      { error: "Failed to fetch inquiries" },
      { status: 500 }
    );
  }
}
