import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { sendAccountDeletionEmail } from "@/lib/resend";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized. Please sign in." }, { status: 401 });
    }

    const ip = getClientIp(request);
    // Rate limit: max 5 deletion attempts per 15 minutes per IP
    const rateLimit = checkRateLimit(`delete_account_ip:${ip}`, 5, 15 * 60 * 1000);
    if (!rateLimit.success) {
      return NextResponse.json(
        { error: "Too many attempts. Please try again later." },
        { status: 429 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const { password, confirmation } = body;

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) {
      return NextResponse.json({ error: "User account not found." }, { status: 404 });
    }

    // 1. Verification check: Password if credentials user, or confirmation string "DELETE" if OAuth
    if (user.password) {
      if (!password || typeof password !== "string") {
        return NextResponse.json(
          { error: "Please enter your account password to confirm account deletion." },
          { status: 400 }
        );
      }
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return NextResponse.json(
          { error: "Incorrect password. Deletion cancelled for your security." },
          { status: 400 }
        );
      }
    } else {
      // User registered via Google OAuth without password
      if (
        !confirmation ||
        typeof confirmation !== "string" ||
        confirmation.trim().toUpperCase() !== "DELETE"
      ) {
        return NextResponse.json(
          { error: "Please type DELETE to confirm account deactivation." },
          { status: 400 }
        );
      }
    }

    const originalEmail = user.email;
    const archivedEmail = `deleted_${user.id}_${Date.now()}@archived.labmatrixindia.com`;

    // 2. Anonymize user record and remove PII
    await prisma.user.update({
      where: { id: user.id },
      data: {
        name: "Deleted User",
        email: archivedEmail,
        phoneNumber: null,
        companyName: null,
        password: null,
        image: null,
        role: "USER",
      },
    });

    // 3. Archive user's equipment listings (mark as unapproved and SOLD so they are removed from public view)
    await prisma.listing.updateMany({
      where: { sellerId: user.id },
      data: {
        status: "SOLD",
        isApproved: false,
      },
    });

    // 4. Archive user's buyer requirements (mark as CLOSED and unapproved)
    await prisma.requirement.updateMany({
      where: { buyerId: user.id },
      data: {
        status: "CLOSED",
        isApproved: false,
      },
    });

    // 5. Invalidate all sessions, OAuth accounts, and notifications
    await Promise.all([
      prisma.session.deleteMany({ where: { userId: user.id } }),
      prisma.account.deleteMany({ where: { userId: user.id } }),
      prisma.notification.deleteMany({ where: { userId: user.id } }),
      prisma.verificationToken.deleteMany({
        where: {
          identifier: { in: [originalEmail, `reset:${originalEmail}`] },
        },
      }),
    ]);

    // 6. Send courtesy deletion email notice to user's original inbox
    try {
      await sendAccountDeletionEmail({
        email: originalEmail,
        name: user.name,
      });
    } catch (emailErr) {
      console.warn("Could not send deletion confirmation email:", emailErr);
    }

    return NextResponse.json({
      success: true,
      message: "Your account has been deactivated and your personal data removed.",
    });
  } catch (error: any) {
    console.error("Account deletion error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred while deleting your account." },
      { status: 500 }
    );
  }
}
