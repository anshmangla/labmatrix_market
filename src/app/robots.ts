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
          "/icon.png",
          "/favicon.png",
          "/logo.png",
        ],
        disallow: [
          "/admin",
          "/admin/*",
          "/dashboard",
          "/dashboard/*",
          "/api/*",
          "/auth/*",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
