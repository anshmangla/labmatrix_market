import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://surplus.labmatrixindia.com";

  // 1. Static Primary Routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/listings`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/spare-parts`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/requests`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
  ];

  // 2. Dynamic Approved Machinery & Spare Part Listings
  let listingRoutes: MetadataRoute.Sitemap = [];
  try {
    const listings = await prisma.listing.findMany({
      where: {
        isApproved: true,
        status: "AVAILABLE",
      },
      select: {
        id: true,
        updatedAt: true,
      },
    });

    listingRoutes = listings.map((item) => ({
      url: `${baseUrl}/listings/${item.id}`,
      lastModified: item.updatedAt || new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    }));
  } catch (err) {
    console.warn("[Sitemap] Could not fetch listings for sitemap:", err);
  }

  // 3. Dynamic Approved Buyer Requirements
  let requestRoutes: MetadataRoute.Sitemap = [];
  try {
    const requests = await prisma.requirement.findMany({
      where: {
        isApproved: true,
        status: "OPEN",
      },
      select: {
        id: true,
        updatedAt: true,
      },
    });

    requestRoutes = requests.map((item) => ({
      url: `${baseUrl}/requests/${item.id}`,
      lastModified: item.updatedAt || new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    }));
  } catch (err) {
    console.warn("[Sitemap] Could not fetch requests for sitemap:", err);
  }

  return [...staticRoutes, ...listingRoutes, ...requestRoutes];
}
