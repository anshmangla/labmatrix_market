import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [listings, requirements] = await Promise.all([
      prisma.listing.findMany({
        where: { sellerId: session.user.id },
        orderBy: { createdAt: "desc" },
      }),
      prisma.requirement.findMany({
        where: { buyerId: session.user.id },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    return NextResponse.json({ listings, requirements });
  } catch (error: any) {
    console.error("Fetch my items error:", error);
    return NextResponse.json(
      { error: "Failed to fetch user items" },
      { status: 500 }
    );
  }
}
