import { NextResponse } from "next/server";
import { getAuthSession, getAuthSessionAndRead } from "@/lib/auth-session";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rate-limit";
import { handleCorsOptions, corsHeaders } from "@/lib/cors";

export async function OPTIONS() {
  return handleCorsOptions();
}

// Linked listing/request fields shown with each inquiry. Loaded with a join in the same
// query (relationLoadStrategy "join") rather than a follow-up query per relation.
const inquiryInclude = {
  listing: {
    select: { id: true, title: true, itemType: true, minPrice: true, maxPrice: true },
  },
  requirement: {
    select: { id: true, title: true, itemType: true },
  },
} as const;

/** Inquiries the user received: on their listings or on their buyer requests. */
const receivedWhere = (userId: string) => ({
  OR: [
    { listing: { sellerId: userId } },
    { requirement: { buyerId: userId } },
  ],
});

/** Inquiries the user sent. */
const sentWhere = (userId: string) => ({ inquirerId: userId });

const MAX_PAGE_SIZE = 50;

/**
 * GET /api/inquiries
 *
 * Without parameters: every received and sent inquiry, as { received, sent } (unchanged contract).
 *
 * Paged: ?box=received|sent&limit=20&cursor=<last inquiry id from the previous page>
 * returns { inquiries, nextCursor } for that box, newest first. The first page (no cursor)
 * also includes counts: { received, sent } so both tab totals can be shown.
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const box = searchParams.get("box");

    if (box !== null) {
      if (box !== "received" && box !== "sent") {
        return NextResponse.json(
          { error: "box must be 'received' or 'sent'." },
          { status: 400, headers: corsHeaders() }
        );
      }
      const limit = Math.min(
        MAX_PAGE_SIZE,
        Math.max(1, parseInt(searchParams.get("limit") || "20", 10) || 20)
      );
      const cursor = searchParams.get("cursor") || undefined;

      const result = await getAuthSessionAndRead(request, (userId) => {
        const where = box === "received" ? receivedWhere(userId) : sentWhere(userId);
        return Promise.all([
          prisma.inquiry.findMany({
            where,
            orderBy: [{ createdAt: "desc" }, { id: "desc" }],
            // One extra row tells us whether another page exists
            take: limit + 1,
            ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
            include: inquiryInclude,
            relationLoadStrategy: "join",
          }),
          // Tab totals only on the first page
          cursor
            ? null
            : Promise.all([
                prisma.inquiry.count({ where: receivedWhere(userId) }),
                prisma.inquiry.count({ where: sentWhere(userId) }),
              ]),
        ]);
      });
      if (!result) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: corsHeaders() });
      }

      const [rows, counts] = result.data;
      const hasMore = rows.length > limit;
      const inquiries = hasMore ? rows.slice(0, limit) : rows;
      return NextResponse.json(
        {
          inquiries,
          nextCursor: hasMore ? inquiries[inquiries.length - 1].id : null,
          ...(counts ? { counts: { received: counts[0], sent: counts[1] } } : {}),
        },
        { headers: corsHeaders() }
      );
    }

    const result = await getAuthSessionAndRead(request, (userId) => Promise.all([
      prisma.inquiry.findMany({
        where: receivedWhere(userId),
        orderBy: { createdAt: "desc" },
        include: inquiryInclude,
        relationLoadStrategy: "join",
      }),
      prisma.inquiry.findMany({
        where: sentWhere(userId),
        orderBy: { createdAt: "desc" },
        include: inquiryInclude,
        relationLoadStrategy: "join",
      }),
    ]));
    if (!result) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [received, sent] = result.data;
    return NextResponse.json({ received, sent }, { headers: corsHeaders() });
  } catch (error: any) {
    console.error("Fetch inquiries error:", error);
    return NextResponse.json({ error: "Failed to fetch inquiries" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getAuthSession(request);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized. Please sign in to send an inquiry." },
        { status: 401 }
      );
    }

    // Rate limit: Max 15 inquiries per hour per user to prevent lead spamming
    const rateLimit = checkRateLimit(`inquiry:${session.user.id}`, 15, 60 * 60 * 1000);
    if (!rateLimit.success) {
      return NextResponse.json(
        { error: "Too many inquiries submitted. Please wait before sending more inquiries." },
        {
          status: 429,
          headers: { "Retry-After": rateLimit.resetSeconds.toString() },
        }
      );
    }

    const body = await request.json();
    const { listingId, requirementId, message, phoneNumber } = body;

    // 1. Target integrity: exactly one target must be provided
    if (!listingId && !requirementId) {
      return NextResponse.json(
        { error: "Inquiry must target a valid equipment listing or requirement." },
        { status: 400 }
      );
    }

    if (listingId && requirementId) {
      return NextResponse.json(
        { error: "Inquiry cannot target both a listing and a requirement simultaneously." },
        { status: 400 }
      );
    }

    // 2. Message length validation
    const trimmedMessage = typeof message === "string" ? message.trim() : "";
    if (trimmedMessage.length < 5 || trimmedMessage.length > 3000) {
      return NextResponse.json(
        { error: "Inquiry message must be between 5 and 3,000 characters." },
        { status: 400 }
      );
    }

    // 3. Verify target exists and is approved
    let targetListingTitle: string | null = null;
    let targetListingOwnerId: string | null = null;
    let targetReqOwnerId: string | null = null;
    let targetReqTitle: string | null = null;

    if (listingId) {
      const listing = await prisma.listing.findUnique({
        where: { id: listingId },
        select: { id: true, title: true, isApproved: true, sellerId: true },
      });

      if (!listing || !listing.isApproved) {
        return NextResponse.json(
          { error: "The targeted listing was not found or is currently not available for inquiries." },
          { status: 404 }
        );
      }
      targetListingTitle = listing.title;
      targetListingOwnerId = listing.sellerId;
    }

    if (requirementId) {
      const req = await prisma.requirement.findUnique({
        where: { id: requirementId },
        select: { id: true, title: true, isApproved: true, buyerId: true },
      });

      if (!req || !req.isApproved) {
        return NextResponse.json(
          { error: "The targeted requirement was not found or is currently not available for inquiries." },
          { status: 404 }
        );
      }
      targetReqTitle = req.title;
      targetReqOwnerId = req.buyerId;
    }

    // Save phone number if provided and not yet on user record
    if (phoneNumber && typeof phoneNumber === "string" && phoneNumber.trim()) {
      const cleanPhone = phoneNumber.trim().slice(0, 30);
      await prisma.user.update({
        where: { id: session.user.id },
        data: { phoneNumber: cleanPhone },
      });
    }

    const inquiry = await prisma.inquiry.create({
      data: {
        inquirerId: session.user.id,
        listingId: listingId || null,
        requirementId: requirementId || null,
        message: trimmedMessage,
        status: "NEW",
      },
    });

    // Notify the listing seller or requirement buyer that an inquiry was received
    try {
      const recipientId = targetListingOwnerId || targetReqOwnerId;
      const itemTitle = targetListingTitle || targetReqTitle;

      if (recipientId && recipientId !== session.user.id) {
        await prisma.notification.create({
          data: {
            userId: recipientId,
            type: "INQUIRY_RECEIVED",
            title: "New Equipment Inquiry Received",
            message: `A client submitted an inquiry regarding your ${targetListingTitle ? "listing" : "request"} "${itemTitle}".`,
            link: "/dashboard",
          },
        });
      }
    } catch (notifErr) {
      console.error("Failed to create inquiry notification:", notifErr);
    }

    return NextResponse.json(
      { message: "Inquiry submitted successfully.", inquiryId: inquiry.id },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Create inquiry error:", error);
    return NextResponse.json(
      { error: "Failed to submit inquiry. Please try again." },
      { status: 500 }
    );
  }
}
