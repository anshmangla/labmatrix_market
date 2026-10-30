import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendContactEmail } from "@/lib/resend";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}

export async function POST(req: NextRequest) {
  try {
    // Rate limit: Max 5 contact submissions per 10 minutes per IP (each sends two emails)
    const ip = getClientIp(req);
    const rateLimit = checkRateLimit(`contact:${ip}`, 5, 10 * 60 * 1000);
    if (!rateLimit.success) {
      return NextResponse.json(
        { error: "Too many inquiries from this network. Please try again in a few minutes or call +91 7303040804." },
        {
          status: 429,
          headers: { "Retry-After": rateLimit.resetSeconds.toString() },
        }
      );
    }

    // 1. Safely parse incoming payload body
    let body: any;
    try {
      const rawText = await req.text();
      if (!rawText || !rawText.trim()) {
        return NextResponse.json(
          { error: "Inquiry submission is empty. Please fill in the required fields." },
          { status: 400 }
        );
      }
      body = JSON.parse(rawText);
    } catch (parseErr: any) {
      console.warn("[Contact API] Malformed JSON received:", parseErr?.message);
      return NextResponse.json(
        { error: "Invalid data format received. Please refresh the page and try submitting again." },
        { status: 400 }
      );
    }

    const { name, email, phone, company, subject, message } = body;

    // 2. Validation
    if (!name || typeof name !== "string" || name.trim().length < 2) {
      return NextResponse.json(
        { error: "Please enter your full name." },
        { status: 400 }
      );
    }

    if (
      !email ||
      typeof email !== "string" ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
    ) {
      return NextResponse.json(
        { error: "Please provide a valid email address." },
        { status: 400 }
      );
    }

    if (!phone || typeof phone !== "string" || phone.trim().length < 6) {
      return NextResponse.json(
        { error: "Please provide a valid contact phone number." },
        { status: 400 }
      );
    }

    if (!subject || typeof subject !== "string" || subject.trim().length < 2) {
      return NextResponse.json(
        { error: "Please select an inquiry requirement subject." },
        { status: 400 }
      );
    }

    if (!message || typeof message !== "string" || message.trim().length < 10) {
      return NextResponse.json(
        { error: "Please describe your requirement (at least 10 characters)." },
        { status: 400 }
      );
    }

    if (
      name.trim().length > 100 ||
      email.trim().length > 254 ||
      phone.trim().length > 30 ||
      (company && String(company).trim().length > 150) ||
      subject.trim().length > 200 ||
      message.trim().length > 5000
    ) {
      return NextResponse.json(
        { error: "One or more fields are too long. Please shorten your message and try again." },
        { status: 400 }
      );
    }

    const cleanPayload = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      company: company ? String(company).trim() : undefined,
      subject: subject.trim(),
      message: message.trim(),
    };

    // 3. Dispatch email via Resend
    const emailResult = await sendContactEmail(cleanPayload);

    // 4. Notify platform administrators in background (non-blocking)
    prisma.user
      .findMany({
        where: { role: "ADMIN" },
        select: { id: true },
      })
      .then(async (admins) => {
        if (admins.length > 0) {
          await prisma.notification.createMany({
            data: admins.map((admin) => ({
              userId: admin.id,
              title: `New Website Inquiry: ${cleanPayload.subject}`,
              message: `${cleanPayload.name} (${cleanPayload.phone}) sent a message: "${cleanPayload.message.slice(0, 100)}..."`,
              type: "CONTACT_INQUIRY",
              link: "/admin",
            })),
          });
        }
      })
      .catch((dbErr) => {
        console.warn("[Contact API] Could not write admin notification:", dbErr?.message || dbErr);
      });

    return NextResponse.json(
      {
        success: true,
        message:
          "Thank you! Your inquiry has been dispatched to LabMatrix Instrument India. Our team will contact you shortly.",
        emailDelivered: emailResult.success,
      },
      {
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  } catch (error: any) {
    console.error("[Contact API Error]:", error);
    return NextResponse.json(
      { error: "Failed to process your message. Please try again or call +91 7303040804 directly." },
      { status: 500 }
    );
  }
}
