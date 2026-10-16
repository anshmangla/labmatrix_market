export interface ImageOptimizationOptions {
  width?: number;
  height?: number;
  crop?: "limit" | "fill" | "fit" | "scale" | "thumb";
  quality?: "auto" | "auto:best" | "auto:good" | "auto:eco" | "auto:low" | number;
  format?: "auto" | "webp" | "avif" | "jpg" | "png";
}

/**
 * Transforms a Cloudinary image URL on-the-fly to serve modern, compressed,
 * and responsive formats (WebP/AVIF) at the exact requested dimensions.
 * If the URL is not from Cloudinary or is invalid, returns the original URL as-is.
 */
export function getOptimizedImageUrl(
  url?: string | null,
  options: ImageOptimizationOptions = {}
): string {
  if (!url || typeof url !== "string") return "";

  // Only transform Cloudinary URLs
  if (!url.includes("res.cloudinary.com") || !url.includes("/image/upload/")) {
    return url;
  }

  const {
    width,
    height,
    crop = height ? "fill" : "limit",
    quality = "auto",
    format = "auto",
  } = options;

  // Build the transformation segment
  const transforms: string[] = [];
  if (format) transforms.push(`f_${format}`);
  if (quality) transforms.push(`q_${quality}`);
  if (width) transforms.push(`w_${width}`);
  if (height) transforms.push(`h_${height}`);
  if (crop && (width || height)) transforms.push(`c_${crop}`);

  const transformString = transforms.join(",");
  if (!transformString) return url;

  // Locate the upload marker
  const uploadMarker = "/image/upload/";
  const markerIdx = url.indexOf(uploadMarker);
  if (markerIdx === -1) return url;

  const prefix = url.slice(0, markerIdx + uploadMarker.length);
  const suffix = url.slice(markerIdx + uploadMarker.length);

  // Avoid injecting twice if the transform string is already present
  if (suffix.startsWith(`${transformString}/`)) {
    return url;
  }

  return `${prefix}${transformString}/${suffix}`;
}

/** Standard presets for consistent sizing across the marketplace */
export const IMAGE_PRESETS = {
  /** Listing card in catalog grids: 600px width limit, auto-webp/avif */
  CARD: { width: 600, quality: "auto", format: "auto" } as const,
  /** Full resolution hero image in PhotoGallery: 1200px width limit */
  GALLERY_HERO: { width: 1200, quality: "auto", format: "auto" } as const,
  /** Small square thumbnail in PhotoGallery: 160x160 filled */
  THUMBNAIL: { width: 160, height: 160, crop: "fill", quality: "auto", format: "auto" } as const,
};
