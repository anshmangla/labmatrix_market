import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify admin role
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const [totalUsers, totalListings, totalRequirements, newInquiries, totalInquiries] =
      await Promise.all([
        prisma.user.count(),
        prisma.listing.count(),
        prisma.requirement.count(),
        prisma.inquiry.count({ where: { status: "NEW" } }),
        prisma.inquiry.count(),
      ]);

    return NextResponse.json({
      stats: {
        totalUsers,
        totalListings,
        totalRequirements,
        newInquiries,
        totalInquiries,
      },
    });
  } catch (error: any) {
    console.error("Admin stats error:", error);
    return NextResponse.json(
      { error: "Failed to fetch admin stats" },
      { status: 500 }
    );
  }
}
