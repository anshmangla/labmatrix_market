import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth-session";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const session = await getAuthSession(request);
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

    const [
      totalUsers,
      totalListings,
      totalRequirements,
      newInquiries,
      totalInquiries,
      pendingListings,
      pendingRequirements,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.listing.count(),
      prisma.requirement.count(),
      prisma.inquiry.count({ where: { status: "NEW" } }),
      prisma.inquiry.count(),
      prisma.listing.count({ where: { isApproved: false } }),
      prisma.requirement.count({ where: { isApproved: false } }),
    ]);

    return NextResponse.json({
      stats: {
        totalUsers,
        totalListings,
        totalRequirements,
        newInquiries,
        totalInquiries,
        pendingApprovals: pendingListings + pendingRequirements,
        pendingListings,
        pendingRequirements,
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
