import React, { Suspense } from "react";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import type { ListingStatus, Prisma } from "@/generated/prisma/client";
import { cachedPublicRead, PUBLIC_LISTINGS_TAG } from "@/lib/public-cache";
import SparePartsClient, { SpareListing } from "@/components/listings/SparePartsClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Laboratory Spare Parts & Consumables Hub | Refurbished & Replacement Boards & Modules",
  description:
    "Source certified refurbished spare parts, OEM detector boards, power supplies, deuterium lamps, and chromatography consumables for Waters, Agilent, Shimadzu, and PerkinElmer across India.",
  alternates: {
    canonical: "/spare-parts",
  },
};

export default async function SparePartsHubPage({
  searchParams,
}: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = searchParams ? await searchParams : {};
  const category = typeof params?.category === "string" ? params.category : undefined;
  const query = typeof params?.query === "string" ? params.query : undefined;
  const statusParam = typeof params?.status === "string" ? params.status : undefined;

  let initialListings: SpareListing[] = [];
  try {
    const where: Prisma.ListingWhereInput = {
      isApproved: true,
      itemType: "SPARE_PART",
    };

    if (statusParam && statusParam !== "ALL") {
      // Unvalidated URL value: Prisma rejects anything that isn't a ListingStatus
      where.status = statusParam as ListingStatus;
    } else {
      where.status = { in: ["AVAILABLE", "SOLD"] };
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
      : await cachedPublicRead(PUBLIC_LISTINGS_TAG, ["spare-parts-page", category ?? "", statusParam ?? ""], readRows);

    initialListings = rows.map((r) => ({
      ...r,
      condition: r.condition ?? "Used",
      location: r.location ?? "India",
      partNumber: r.partNumber ?? undefined,
      compatibleWith: r.compatibleWith ?? undefined,
      createdAt: r.createdAt.toISOString(),
    }));
  } catch (error) {
    console.error("Error pre-fetching initial spare parts:", error);
  }

  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-blue" />
          </div>
        </div>
      }
    >
      <SparePartsClient initialListings={initialListings} />
    </Suspense>
  );
}
