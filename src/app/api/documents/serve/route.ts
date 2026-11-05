import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get("url");
    const title = searchParams.get("title") || "Document";
    const isDownload =
      searchParams.get("download") === "1" ||
      searchParams.get("download") === "true";

    if (!url) {
      return NextResponse.json({ error: "Missing document URL" }, { status: 400 });
    }

    // Security check: Only allow fetching from Cloudinary or trusted domains
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url);
    } catch {
      return NextResponse.json({ error: "Invalid document URL" }, { status: 400 });
    }

    const allowedHosts = ["res.cloudinary.com", "cloudinary.com", "localhost"];
    if (!allowedHosts.some((host) => parsedUrl.hostname.endsWith(host))) {
      return NextResponse.json({ error: "Unauthorized document host" }, { status: 403 });
    }

    const res = await fetch(url);
    if (!res.ok) {
      return NextResponse.json(
        { error: `Failed to fetch document: ${res.statusText}` },
        { status: res.status }
      );
    }

    const arrayBuffer = await res.arrayBuffer();

    // Ensure filename ends with .pdf
    let sanitizedName = title
      .trim()
      .replace(/[^a-zA-Z0-9_\-\.\s]/g, "")
      .replace(/\s+/g, "_");
    if (!sanitizedName.toLowerCase().endsWith(".pdf")) {
      sanitizedName += ".pdf";
    }

    const headers = new Headers();
    headers.set("Content-Type", "application/pdf");
    headers.set(
      "Content-Disposition",
      `${isDownload ? "attachment" : "inline"}; filename="${sanitizedName}"`
    );
    headers.set("Cache-Control", "public, max-age=86400, s-maxage=86400");

    return new Response(arrayBuffer, {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error("Document serve error:", error);
    return NextResponse.json(
      { error: "Internal server error while serving document" },
      { status: 500 }
    );
  }
}
