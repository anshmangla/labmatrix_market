import React, { Suspense } from "react";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import NewInstrumentsClient from "@/components/listings/NewInstrumentsClient";
import { Listing } from "@/components/listings/ListingsClient";

export const metadata: Metadata = {
  title: "Brand New Instruments | Authorized OEM Analytical Lab Machinery",
  description:
    "Source factory-new analytical instruments with full manufacturer warranty and IQ/OQ validation protocols from authorized distributors alongside our certified refurbished range.",
  alternates: {
    canonical: "/new-instruments",
  },
  keywords: [
    "brand new analytical instruments India",
    "OEM laboratory equipment India",
    "new vs refurbished lab equipment",
    "analytical instruments manufacturer warranty",
    "laboratory instruments suppliers Delhi",
    "HPLC GC-MS new instruments",
  ],
};

export default async function NewInstrumentsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const category = typeof params.category === "string" ? params.category : undefined;
  const query = typeof params.query === "string" ? params.query : undefined;

  let initialListings: Listing[] = [];
  try {
    const where: any = {
      isApproved: true,
      status: { in: ["AVAILABLE", "SOLD"] },
      itemType: "NEW_INSTRUMENT",
    };

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

    const rows = await prisma.listing.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 30,
      select: {
        id: true,
        title: true,
        description: true,
        category: true,
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

    initialListings = rows.map((item) => ({
      ...item,
      condition: item.condition ?? "New",
      location: item.location ?? "India",
      createdAt: item.createdAt.toISOString(),
    }));
  } catch (error) {
    console.error("Error pre-fetching initial new instruments:", error);
  }

  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" />
          </div>
        </div>
      }
    >
      <NewInstrumentsClient initialListings={initialListings} />
    </Suspense>
  );
}
