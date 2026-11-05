import React, { Suspense } from "react";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import type { ListingStatus, Prisma } from "@/generated/prisma/client";
import { cachedPublicRead, PUBLIC_LISTINGS_TAG } from "@/lib/public-cache";
import CatalogGrid, { CatalogListing } from "@/components/listings/CatalogGrid";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Available Equipment | Refurbished & Pre-Owned Analytical Laboratory Instruments",
  description:
    "Browse verified refurbished and pre-owned analytical instruments: HPLC, GC-MS, UV-Vis, AAS, ICP, DSC-TGA across top brands like Agilent, Waters, Shimadzu, and PerkinElmer in India.",
  alternates: {
    canonical: "/listings",
  },
};

export default async function BrowseListingsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const category = typeof params.category === "string" ? params.category : undefined;
  const query = typeof params.query === "string" ? params.query : undefined;
  const statusParam = typeof params.status === "string" ? params.status : undefined;

  let initialListings: CatalogListing[] = [];
  try {
    const where: Prisma.ListingWhereInput = {
      isApproved: true,
      itemType: "MACHINE",
    };

    if (statusParam && statusParam !== "ALL") {
      // Unvalidated URL value: Prisma rejects anything that isn't a ListingStatus
      where.status = statusParam as ListingStatus;
    } else if (statusParam === "ALL") {
      where.status = { in: ["AVAILABLE", "SOLD"] };
    } else {
      where.status = "AVAILABLE";
    }

    if (category && category !== "ALL") {
      where.category = category;
    }

    if (query) {
      where.OR = [
        { title: { contains: query, mode: "insensitive" } },
        { description: { contains: query, mode: "insensitive" } },
        { partNumber: { contains: query, mode: "insensitive" } },
        { compatibleWith: { contains: query, mode: "insensitive" } },
      ];
    }

    const readRows = () =>
      prisma.listing.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: 30,
        select: {
          id: true,
          title: true,
          description: true,
          category: true,
          itemType: true,
          partNumber: true,
          compatibleWith: true,
          minPrice: true,
          maxPrice: true,
          condition: true,
          location: true,
          photos: true,
          quantity: true,
          createdAt: true,
          status: true,
        },
      });
    // Free-text searches aren't cached: each term would be its own, rarely reused entry
    const rows = query
      ? await readRows()
      : await cachedPublicRead(PUBLIC_LISTINGS_TAG, ["listings-page", category ?? "", statusParam ?? "AVAILABLE"], readRows);

    initialListings = rows.map((item) => ({
      ...item,
      condition: item.condition ?? "Used",
      location: item.location ?? "India",
      createdAt: item.createdAt.toISOString(),
    }));
  } catch (error) {
    console.error("Error pre-fetching initial listings:", error);
  }

  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
          <div className="max-w-[1440px] mx-auto flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-blue" />
          </div>
        </div>
      }
    >
      <CatalogGrid
        initialListings={initialListings}
        itemType="MACHINE"
        pageTitle="Pre-Owned Analytical Equipment"
        pageSubtitle="Certified pre-owned and refurbished analytical instruments from laboratories and pharma facilities across India."
      />
    </Suspense>
  );
}
