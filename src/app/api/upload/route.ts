import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth-session";
import cloudinary from "@/lib/cloudinary";
import { checkRateLimit } from "@/lib/rate-limit";
import { handleCorsOptions } from "@/lib/cors";

// Must match the mobile app's transformation strings exactly to be reused
const MOBILE_IMAGE_SIZES = [
  "f_webp,q_auto:good,w_600,c_limit", // card
  "f_webp,q_auto:best,w_1000,c_limit", // detail photo
  "f_webp,q_auto:good,w_160,h_160,c_fill", // thumbnail
  "f_webp,q_auto:best,w_1600,c_limit", // zoom
];

export async function OPTIONS() {
  return handleCorsOptions();
}

export async function POST(request: Request) {
  try {
    const session = await getAuthSession(request);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized. Please sign in to upload images." },
        { status: 401 }
      );
    }

    // Rate limit: Max 20 image uploads per hour per user
    const rateLimit = checkRateLimit(`upload:${session.user.id}`, 20, 60 * 60 * 1000);
    if (!rateLimit.success) {
      return NextResponse.json(
        { error: "Upload limit reached. Please wait before uploading more images." },
        {
          status: 429,
          headers: { "Retry-After": rateLimit.resetSeconds.toString() },
        }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const isPdf = file.type.toLowerCase() === "application/pdf";

    // 1. File size enforcement: Maximum 10 MB for PDFs, 5 MB for images
    const MAX_FILE_SIZE = isPdf ? 10 * 1024 * 1024 : 5 * 1024 * 1024;
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          error: isPdf
            ? "PDF exceeds 10MB size limit. Please upload a smaller document."
            : "File exceeds 5MB size limit. Please upload a smaller image.",
        },
        { status: 400 }
      );
    }

    // 2. Strict MIME type verification: Allow raster image formats and PDF documents
    const ALLOWED_MIME_TYPES = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/jpg",
      "application/pdf",
    ];
    if (!ALLOWED_MIME_TYPES.includes(file.type.toLowerCase())) {
      return NextResponse.json(
        { error: "Only JPEG, PNG, WEBP images and PDF documents are allowed." },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // If Cloudinary keys are configured, upload to Cloudinary
    if (
      process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
    ) {
      const uploadOptions: Record<string, any> = isPdf
        ? {
            folder: "labmatrix/documents",
            resource_type: "raw",
            format: "pdf",
          }
        : {
            folder: "labmatrix/machines",
            resource_type: "image",
            transformation: [{ quality: "auto", fetch_format: "auto" }],
            // Pre-generate the exact sizes the mobile app requests (src/lib/images.ts there:
            // card, detail, thumbnail, zoom) so the first viewer doesn't wait for Cloudinary to
            // create them. Async: the upload response doesn't wait for this.
            eager: MOBILE_IMAGE_SIZES.map((raw_transformation) => ({ raw_transformation })),
            eager_async: true,
          };

      const uploadResult = await new Promise<{ secure_url: string }>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          uploadOptions,
          (error, result) => {
            if (error || !result) {
              reject(error || new Error("Cloudinary upload failed"));
            } else {
              resolve(result);
            }
          }
        );
        uploadStream.end(buffer);
      });

      return NextResponse.json({
        url: uploadResult.secure_url,
        name: file.name,
        size: file.size,
        type: isPdf ? "pdf" : "image",
      });
    } else {
      // Fallback for development if keys aren't set yet: Base64 data URL
      const base64Data = `data:${file.type};base64,${buffer.toString("base64")}`;
      return NextResponse.json({
        url: base64Data,
        name: file.name,
        size: file.size,
        type: isPdf ? "pdf" : "image",
        warning: "Cloudinary credentials not yet configured. File stored as data URL for development.",
      });
    }
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload image. Please try again later." },
      { status: 500 }
    );
  }
}
