import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized. Please sign in to send an inquiry." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { listingId, requirementId, message, phoneNumber } = body;

    if (!message?.trim()) {
      return NextResponse.json(
        { error: "Inquiry message is required." },
        { status: 400 }
      );
    }

    // Save phone number if provided and not yet on user record
    if (phoneNumber?.trim()) {
      await prisma.user.update({
        where: { id: session.user.id },
        data: { phoneNumber: phoneNumber.trim() },
      });
    }

    const inquiry = await prisma.inquiry.create({
      data: {
        inquirerId: session.user.id,
        listingId: listingId || null,
        requirementId: requirementId || null,
        message: message.trim(),
        status: "NEW",
      },
    });

    return NextResponse.json(
      { message: "Inquiry submitted to platform broker.", inquiryId: inquiry.id },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Create inquiry error:", error);
    return NextResponse.json(
      { error: "Failed to submit inquiry" },
      { status: 500 }
    );
  }
}
