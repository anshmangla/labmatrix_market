import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
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

    const inquiries = await prisma.inquiry.findMany({
      orderBy: { createdAt: "desc" },
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
    });

    return NextResponse.json({ inquiries });
  } catch (error: any) {
    console.error("Admin inquiries error:", error);
    return NextResponse.json(
      { error: "Failed to fetch inquiries" },
      { status: 500 }
    );
  }
}
