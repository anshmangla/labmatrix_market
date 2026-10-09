import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const admin = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (admin?.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden: Admin only" }, { status: 403 });
    }

    const requirements = await prisma.requirement.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        buyer: {
          select: {
            id: true,
            name: true,
            email: true,
            phoneNumber: true,
            companyName: true,
          },
        },
        _count: {
          select: {
            inquiries: true,
          },
        },
      },
    });

    return NextResponse.json({ requirements });
  } catch (error: any) {
    console.error("Admin fetch requirements error:", error);
    return NextResponse.json(
      { error: "Failed to fetch requirements" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const admin = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (admin?.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden: Admin only" }, { status: 403 });
    }

    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json(
        { error: "ID and status are required" },
        { status: 400 }
      );
    }

    const updated = await prisma.requirement.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json({ requirement: updated });
  } catch (error: any) {
    console.error("Admin update requirement error:", error);
    return NextResponse.json(
      { error: "Failed to update requirement" },
      { status: 500 }
    );
  }
}
