import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { handleCorsOptions, corsHeaders } from "@/lib/cors";

// Never prerendered or cached: each call must reach the database
export const dynamic = "force-dynamic";

export async function OPTIONS() {
  return handleCorsOptions();
}

/**
 * GET /api/health
 *
 * The mobile app calls this in the background on launch, when it returns to the foreground and
 * when the sign-in screen opens, so a sleeping Neon database starts waking before the user's real
 * request. Runs one trivial query; rate-limited per IP so it can't keep the database awake.
 */
export async function GET(request: Request) {
  const headers = { ...corsHeaders(), "Cache-Control": "no-store" };

  const limit = checkRateLimit(`health:${getClientIp(request)}`, 20, 60 * 1000);
  if (!limit.success) {
    return NextResponse.json({ ok: true, skipped: true }, { status: 429, headers });
  }

  const started = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({ ok: true, dbMs: Date.now() - started }, { headers });
  } catch (error) {
    console.warn("Health check could not reach the database:", error);
    return NextResponse.json({ ok: false }, { status: 503, headers });
  }
}
