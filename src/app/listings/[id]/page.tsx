import React, { cache } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import PhotoGallery from "@/components/listings/PhotoGallery";
import InquiryBox from "@/components/inquiries/InquiryBox";
import {
  MapPin,
  Clock,
  ShieldCheck,
  CheckCircle,
  FileText,
  BadgeAlert,
  Layers,
  PhoneOff,
  Pencil,
  Copy,
} from "lucide-react";
import { getOptimizedImageUrl } from "@/lib/images";

export const dynamic = "force-dynamic";

const getListing = cache(async (id: string) => {
  return prisma.listing.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      description: true,
      category: true,
      itemType: true,
      partNumber: true,
      compatibleWith: true,
      condition: true,
      minPrice: true,
      maxPrice: true,
      photos: true,
      location: true,
      quantity: true,
      status: true,
      isApproved: true,
      sellerId: true,
      createdAt: true,
    },
  });
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const listing = await getListing(id);

  if (!listing || !listing.isApproved) {
    return {
      title: "Equipment Listing",
      description: "Pre-owned laboratory analytical instrument on LabMatrix.",
    };
  }

  const isSpare = listing.itemType === "SPARE_PART";
  const title = isSpare
    ? `${listing.title}${listing.partNumber ? ` (Part #${listing.partNumber})` : ""} | Spare Parts India`
    : `${listing.title} | Pre-Owned ${listing.category} in ${listing.location || "India"}`;

  const desc = isSpare
    ? `Buy verified pre-owned ${listing.title} in ${listing.location || "India"}.${listing.compatibleWith ? ` Compatible with ${listing.compatibleWith}.` : ""}${listing.partNumber ? ` Part Number: ${listing.partNumber}.` : ""} Condition: ${listing.condition || "Used"}. Expected Price: ₹${listing.minPrice.toLocaleString("en-IN")} - ₹${listing.maxPrice.toLocaleString("en-IN")}. Contact LabMatrix for prompt delivery.`
    : `Buy verified pre-owned ${listing.title} in ${listing.location || "India"}. Category: ${listing.category}. Condition: ${listing.condition || "Used"}. Approx Price: ₹${listing.minPrice.toLocaleString("en-IN")} - ₹${listing.maxPrice.toLocaleString("en-IN")}. Contact LabMatrix for inspection and quotations.`;

  const image =
    listing.photos && listing.photos.length > 0
      ? getOptimizedImageUrl(listing.photos[0], { width: 1200, height: 630, crop: "fill" })
      : "/logo.png";

  const keywords = [
    listing.title,
    listing.category,
    listing.partNumber,
    listing.compatibleWith,
    isSpare ? "analytical instrument spare parts India" : "used lab equipment India",
    listing.location,
    "refurbished analytical instruments",
    "LabMatrix marketplace",
  ].filter(Boolean) as string[];

  return {
    title,
    description: desc,
    keywords,
    alternates: {
      canonical: `/listings/${id}`,
    },
    openGraph: {
      title,
      description: desc,
      url: `/listings/${id}`,
      type: "website",
      images: [
        {
          url: image,
          alt: listing.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: desc,
      images: [image],
    },
  };
}

export default async function ListingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [listing, session] = await Promise.all([
    getListing(id),
    auth(),
  ]);

  if (!listing) {
    notFound();
  }

  const isOwner = session?.user?.id === listing.sellerId;
  const isAdmin = (session?.user as any)?.role === "ADMIN";

  // If not approved, only owner or admin can preview it
  if (!listing.isApproved && !isOwner && !isAdmin) {
    notFound();
  }

  const knownBrands = [
    "PerkinElmer",
    "Perkin Elmer",
    "Agilent",
    "Waters",
    "Shimadzu",
    "Thermo Fisher",
    "Thermo",
    "Bruker",
    "Metrohm",
    "Sartorius",
    "Mettler Toledo",
    "Hitachi",
  ];
  const matchedBrand =
    knownBrands.find((b) =>
      listing.title.toLowerCase().includes(b.toLowerCase())
    ) || "LabMatrix";

  const productJsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Product",
        "@id": `https://surplus.labmatrixindia.com/listings/${listing.id}#product`,
        name: listing.title,
        description: listing.description.slice(0, 300),
        category: listing.category,
        sku: listing.id,
        ...(listing.partNumber ? { mpn: listing.partNumber } : {}),
        brand: {
          "@type": "Brand",
          name: matchedBrand,
        },
        image:
          listing.photos && listing.photos.length > 0
            ? listing.photos
            : ["https://surplus.labmatrixindia.com/logo.png"],
        itemCondition: listing.condition?.toLowerCase().includes("refurbished")
          ? "https://schema.org/RefurbishedCondition"
          : listing.condition?.toLowerCase().includes("brand new")
          ? "https://schema.org/NewCondition"
          : "https://schema.org/UsedCondition",
        offers: {
          "@type": "AggregateOffer",
          priceCurrency: "INR",
          lowPrice: listing.minPrice,
          highPrice: listing.maxPrice,
          offerCount: "1",
          priceValidUntil: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0],
          availability: "https://schema.org/InStock",
          seller: {
            "@type": "Organization",
            name: "LabMatrix Instrument India Pvt Ltd",
            url: "https://surplus.labmatrixindia.com",
          },
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: "https://surplus.labmatrixindia.com",
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Equipment",
            item: "https://surplus.labmatrixindia.com/listings",
          },
          {
            "@type": "ListItem",
            position: 3,
            name: listing.category,
            item: `https://surplus.labmatrixindia.com/listings?category=${encodeURIComponent(listing.category)}`,
          },
          {
            "@type": "ListItem",
            position: 4,
            name: listing.title,
            item: `https://surplus.labmatrixindia.com/listings/${listing.id}`,
          },
        ],
      },
    ],
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb Navigation */}
        <div className="mb-6 flex items-center space-x-2 text-xs font-semibold text-slate-500">
          <Link href="/" className="hover:text-brand-blue transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link
            href="/listings"
            className="hover:text-brand-blue transition-colors"
          >
            Listings
          </Link>
          <span>/</span>
          <span className="text-slate-800 truncate max-w-xs">{listing.title}</span>
        </div>

        {/* Owner / Admin Management Bar */}
        {(isOwner || isAdmin) && (
          <div className="mb-6 p-4 rounded-2xl bg-white border border-brand-blue-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-brand-blue animate-pulse" />
              <span className="text-xs font-bold text-slate-800">
                {isAdmin ? "Administrator Controls Active" : "You are the owner of this listing"}
              </span>
              <span className="text-slate-300">•</span>
              <span
                className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                  listing.isApproved
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : "bg-amber-50 text-amber-800 border border-amber-200"
                }`}
              >
                {listing.isApproved ? "Approved & Live" : "Pending Admin Approval"}
              </span>
            </div>
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <Link
                href={`/listings/create?duplicate=${listing.id}`}
                className="inline-flex items-center justify-center space-x-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl shadow-xs transition-colors"
              >
                <Copy className="w-3.5 h-3.5 text-slate-600" />
                <span>Duplicate</span>
              </Link>
              <Link
                href={`/listings/${listing.id}/edit`}
                className="inline-flex items-center justify-center space-x-1.5 px-4 py-2 bg-brand-gold hover:bg-brand-gold-500 text-brand-blue-950 font-bold text-xs rounded-xl shadow-xs transition-colors"
              >
                <Pencil className="w-3.5 h-3.5 text-brand-blue-950" />
                <span>Edit Listing</span>
              </Link>
            </div>
          </div>
        )}

        {/* Pending Approval Banner for Owner/Admin */}
        {!listing.isApproved && (
          <div className="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start space-x-3 shadow-xs">
            <Clock className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold uppercase tracking-wider bg-amber-200/60 text-amber-900 px-2 py-0.5 rounded">
                  Private Owner Preview
                </span>
                <span className="text-xs font-bold text-amber-800">• Pending Admin Approval</span>
              </div>
              <p className="text-xs text-amber-800 mt-1">
                This listing is currently under admin review and is not visible to the public. You will receive an on-site notification (bell icon) as soon as it is approved.
              </p>
            </div>
          </div>
        )}

        {/* SOLD Banner */}
        {listing.status === "SOLD" && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 flex items-start space-x-3 shadow-xs">
            <BadgeAlert className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-black uppercase tracking-wider bg-rose-600 text-white px-2.5 py-0.5 rounded">
                  SOLD OUT
                </span>
                <span className="text-xs font-bold text-rose-800">• This item is marked as SOLD</span>
              </div>
              <p className="text-xs text-rose-700 mt-1">
                This equipment is no longer available. You can still submit an inquiry below to ask for equivalent instruments or join the priority waiting list for incoming inventory.
              </p>
            </div>
          </div>
        )}

        {/* Main Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column (2 Cols): Photos & Specifications */}
          <div className="lg:col-span-2 space-y-6">
            {/* Gallery */}
            <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-xs border border-slate-200">
              <PhotoGallery photos={listing.photos} title={listing.title} />
            </div>

            {/* Description & Technical Specs */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-xs border border-slate-200 space-y-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-brand-blue">
                  {listing.category}
                </span>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
                  {listing.title}
                </h1>
                <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-slate-500">
                  <span className="flex items-center">
                    <MapPin className="w-3.5 h-3.5 mr-1 text-slate-400" />
                    {listing.location || "India"}
                  </span>
                  <span>•</span>
                  <span className="text-brand-blue bg-brand-blue-50 px-2 py-0.5 rounded font-semibold">
                    {listing.condition}
                  </span>
                  <span>•</span>
                  <span className="text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded font-bold">
                    Qty: {listing.quantity || 1} available
                  </span>
                  {listing.status === "SOLD" && (
                    <>
                      <span>•</span>
                      <span className="bg-rose-100 text-rose-700 border border-rose-200 px-2 py-0.5 rounded font-black text-xs uppercase">
                        SOLD
                      </span>
                    </>
                  )}
                  <span>•</span>
                  <span className="flex items-center">
                    <Clock className="w-3.5 h-3.5 mr-1 text-slate-400" />
                    Listed on {new Date(listing.createdAt).toLocaleDateString()}
                  </span>
                </div>

                {listing.itemType === "SPARE_PART" && (
                  <div className="mt-4 p-3.5 bg-brand-blue-50/70 rounded-xl border border-brand-blue-200/80 flex flex-wrap gap-5 text-xs">
                    {listing.compatibleWith && (
                      <div>
                        <span className="text-slate-400 block font-bold text-[10px] uppercase">
                          Compatible Instrument / Model
                        </span>
                        <span className="font-bold text-slate-900 text-sm">{listing.compatibleWith}</span>
                      </div>
                    )}
                    {listing.partNumber && (
                      <div>
                        <span className="text-slate-400 block font-bold text-[10px] uppercase">
                          Part / Catalog #
                        </span>
                        <span className="font-bold text-slate-900 font-mono text-sm">{listing.partNumber}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="border-t border-slate-100 pt-6">
                <h2 className="text-base font-bold text-slate-900 mb-3 flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-brand-blue" />
                  <span>Technical Description & Details</span>
                </h2>
                <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-line bg-slate-50 p-5 rounded-xl border border-slate-100">
                  {listing.description}
                </div>
              </div>

              {/* Marketplace Assurance Box */}
              <div className="bg-brand-blue-950 text-white rounded-xl p-5 flex items-start space-x-3.5 shadow-sm border border-brand-blue-800">
                <div className="w-8 h-8 rounded-lg bg-brand-gold/20 text-brand-gold flex items-center justify-center flex-shrink-0 mt-0.5">
                  <ShieldCheck className="w-4 h-4 text-brand-gold" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-brand-gold uppercase tracking-wider">
                    Verified Equipment Listing
                  </h4>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    Instrument specifications and maintenance logs are verified through our platform.
                    Submit an inquiry below to ask technical questions, request additional photos, or submit a quotation.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column (1 Col): Price & Inquiry Box */}
          <div className="space-y-6">
            {/* Price Box */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
              {listing.status === "SOLD" && (
                <div className="inline-block px-2.5 py-1 rounded-md text-xs font-black uppercase tracking-wider bg-rose-100 text-rose-700 border border-rose-200 mb-3">
                  Status: SOLD OUT
                </div>
              )}
              <span className="text-xs font-semibold text-slate-400 block mb-1">
                {listing.status === "SOLD" ? "Recorded Price Range" : "Approximate Price Expectation"}
              </span>
              <div className="text-2xl sm:text-3xl font-black text-brand-blue">
                ₹{listing.minPrice.toLocaleString("en-IN")} - ₹
                {listing.maxPrice.toLocaleString("en-IN")}
              </div>
              {listing.quantity && listing.quantity > 1 ? (
                <div className="mt-1 text-xs font-semibold text-slate-700 flex items-center space-x-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span>
                    Stock: <strong>{listing.quantity} units</strong> available
                  </span>
                </div>
              ) : null}
              <p className="text-[11px] text-slate-500 mt-1">
                Prices negotiable subject to technical condition & included
                accessories.
              </p>

              <div className="mt-4 pt-4 border-t border-slate-100 space-y-2 text-xs text-slate-600">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-3.5 h-3.5 text-brand-gold-600 flex-shrink-0" />
                  <span>Verified laboratory equipment listing</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-3.5 h-3.5 text-brand-gold-600 flex-shrink-0" />
                  <span>On-site or video inspection coordinated</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-3.5 h-3.5 text-brand-gold-600 flex-shrink-0" />
                  <span>Complete escrow & handover assistance</span>
                </div>
              </div>
            </div>

            {/* Inquiry Form */}
            <InquiryBox listingId={listing.id} itemTitle={listing.title} />
          </div>
        </div>
      </div>
    </div>
  );
}
