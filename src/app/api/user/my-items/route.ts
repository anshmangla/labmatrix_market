import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth-session";
import { prisma } from "@/lib/prisma";
import { handleCorsOptions, corsHeaders } from "@/lib/cors";

export async function OPTIONS() {
  return handleCorsOptions();
}

export async function GET(request: Request) {
  try {
    const session = await getAuthSession(request);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: corsHeaders() });
    }

    const [listings, requirements] = await Promise.all([
      prisma.listing.findMany({
        where: { sellerId: session.user.id },
        orderBy: { createdAt: "desc" },
        take: 100,
      }),
      prisma.requirement.findMany({
        where: { buyerId: session.user.id },
        orderBy: { createdAt: "desc" },
        take: 100,
      }),
    ]);

    return NextResponse.json(
      { listings, requirements },
      { status: 200, headers: corsHeaders() }
    );
  } catch (error: any) {
    console.error("Fetch my items error:", error);
    return NextResponse.json(
      { error: "Failed to fetch user items" },
      { status: 500, headers: corsHeaders() }
    );
  }
}
