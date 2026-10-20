import React, { Suspense } from "react";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import SparePartsClient, { SpareListing } from "@/components/listings/SparePartsClient";

export const metadata: Metadata = {
  title: "Laboratory Spare Parts & Consumables Hub | Refurbished & Replacement Boards & Modules",
  description:
    "Source certified refurbished spare parts, OEM detector boards, power supplies, deuterium lamps, and chromatography consumables for Waters, Agilent, Shimadzu, and PerkinElmer across India.",
  alternates: {
    canonical: "/spare-parts",
  },
};

export default async function SparePartsHubPage() {
  let initialListings: SpareListing[] = [];
  try {
    const rows = await prisma.listing.findMany({
      where: {
        isApproved: true,
        status: { in: ["AVAILABLE", "SOLD"] },
        itemType: "SPARE_PART",
      },
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
