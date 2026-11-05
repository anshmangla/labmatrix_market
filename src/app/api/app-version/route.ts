import { NextResponse } from "next/server";
import { handleCorsOptions, corsHeaders } from "@/lib/cors";

export const dynamic = "force-dynamic";

export async function OPTIONS() {
  return handleCorsOptions();
}

export async function GET() {
  const latestVersion = process.env.APP_LATEST_VERSION || "1.0.0";
  const minRequiredVersion = process.env.APP_MIN_REQUIRED_VERSION || "1.0.0";
  const forceUpdate = process.env.APP_FORCE_UPDATE === "true";
  const releaseNotes =
    process.env.APP_RELEASE_NOTES ||
    "In-app PDF document viewer, unified media carousel, and performance improvements.";

  const updateUrl = {
    android: "market://details?id=com.labmatrix.market",
    androidWeb: "https://play.google.com/store/apps/details?id=com.labmatrix.market",
    ios: "https://apps.apple.com/app/id6470000000",
  };

  return NextResponse.json(
    {
      latestVersion,
      minRequiredVersion,
      forceUpdate,
      releaseNotes,
      updateUrl,
    },
    {
      headers: {
        ...corsHeaders(),
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    }
  );
}
