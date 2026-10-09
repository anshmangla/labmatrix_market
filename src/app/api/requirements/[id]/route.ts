import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const requirement = await prisma.requirement.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        description: true,
        category: true,
        status: true,
        createdAt: true,
        // STRICT CONFIDENTIALITY: Buyer details are never selected for public viewing
      },
    });

    if (!requirement) {
      return NextResponse.json(
        { error: "Requirement not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ requirement });
  } catch (error: any) {
    console.error("Fetch requirement by id error:", error);
    return NextResponse.json(
      { error: "Failed to fetch requirement details" },
      { status: 500 }
    );
  }
}
