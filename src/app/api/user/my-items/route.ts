import { NextResponse } from "next/server";
import { getAuthSessionAndRead } from "@/lib/auth-session";
import { prisma } from "@/lib/prisma";
import { handleCorsOptions, corsHeaders } from "@/lib/cors";

export async function OPTIONS() {
  return handleCorsOptions();
}

export async function GET(request: Request) {
  try {
    const result = await getAuthSessionAndRead(request, (userId) => Promise.all([
      prisma.listing.findMany({
        where: { sellerId: userId },
        orderBy: { createdAt: "desc" },
        take: 100,
      }),
      prisma.requirement.findMany({
        where: { buyerId: userId },
        orderBy: { createdAt: "desc" },
        take: 100,
      }),
    ]));
    if (!result) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: corsHeaders() });
    }

    const [listings, requirements] = result.data;

    return NextResponse.json(
      { listings, requirements },
      { status: 200, headers: corsHeaders() }
    );
  } catch (error) {
    console.error("Fetch my items error:", error);
    return NextResponse.json(
      { error: "Failed to fetch user items" },
      { status: 500, headers: corsHeaders() }
    );
  }
}
