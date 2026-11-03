import { NextResponse } from "next/server";
import { getAuthSession, getAuthSessionAndRead } from "@/lib/auth-session";
import { prisma } from "@/lib/prisma";
import { handleCorsOptions } from "@/lib/cors";

export async function OPTIONS() {
  return handleCorsOptions();
}

export async function GET(request: Request) {
  try {
    const result = await getAuthSessionAndRead(request, (userId) => Promise.all([
      prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 30,
      }),
      prisma.notification.count({
        where: { userId, isRead: false },
      }),
    ]));
    if (!result) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [notifications, unreadCount] = result.data;

    return NextResponse.json({ notifications, unreadCount });
  } catch (error: any) {
    console.error("Fetch notifications error:", error);
    return NextResponse.json(
      { error: "Failed to fetch notifications" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getAuthSession(request);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const { id, all } = body;

    if (all) {
      await prisma.notification.updateMany({
        where: { userId: session.user.id, isRead: false },
        data: { isRead: true },
      });
      return NextResponse.json({ success: true, message: "All notifications marked as read" });
    }

    if (id) {
      await prisma.notification.updateMany({
        where: { id, userId: session.user.id },
        data: { isRead: true },
      });
      return NextResponse.json({ success: true, message: "Notification marked as read" });
    }

    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  } catch (error: any) {
    console.error("Update notifications error:", error);
    return NextResponse.json(
      { error: "Failed to update notification" },
      { status: 500 }
    );
  }
}
