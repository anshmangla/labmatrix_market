import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = "https://surplus.labmatrixindia.com";

  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          "/listings",
          "/listings/*",
          "/spare-parts",
          "/new-instruments",
          "/requests",
          "/requests/*",
          "/contact",
          "/privacy",
          "/terms",
          "/_next/*",
          "/_next/static/*",
          "/_next/image*",
          "/icon.png",
          "/favicon.png",
          "/logo.png",
        ],
        disallow: [
          "/admin",
          "/admin/*",
          "/dashboard",
          "/dashboard/*",
          "/listings/create",
          "/listings/*/edit",
          "/requests/create",
          "/requests/*/edit",
          "/api/*",
          "/auth/*",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
