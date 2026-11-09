import React, { cache } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { cachedPublicRead, PUBLIC_LISTINGS_TAG } from "@/lib/public-cache";
import PhotoGallery from "@/components/listings/PhotoGallery";
import DocumentList from "@/components/listings/DocumentList";
import InquiryBox from "@/components/inquiries/InquiryBox";
import SaveListingButton from "@/components/listings/SaveListingButton";
import ShareListingButton from "@/components/listings/ShareListingButton";
import MobileListingActionBar from "@/components/listings/MobileListingActionBar";
import {
  MapPin,
  Clock,
  ShieldCheck,
  CheckCircle,
  FileText,
  BadgeAlert,
  ArrowRight,
  Pencil,
  Copy,
  Boxes,
} from "lucide-react";
import { getOptimizedImageUrl } from "@/lib/images";
import { toJsonLd } from "@/lib/json-ld";
import { formatPrice, formatDate } from "@/lib/formatters";

export const dynamic = "force-dynamic";

// Cached across requests (shared cache) and within one request (React cache);
// owner/admin visibility checks still run per request on the result
const getListing = cache(async (id: string) => {
  return cachedPublicRead(PUBLIC_LISTINGS_TAG, ["listing", id], () =>
    prisma.listing.findUnique({
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
        documents: true,
        location: true,
        quantity: true,
        status: true,
        isApproved: true,
        sellerId: true,
        createdAt: true,
      },
    })
  );
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
      title: "Listing Not Found | Labmatrix Marketplace",
      description: "The requested equipment listing is no longer available or has been removed.",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const isSpare = listing.itemType === "SPARE_PART";
  const title = isSpare
    ? `${listing.title}${listing.partNumber ? ` (Part #${listing.partNumber})` : ""} | Refurbished & Replacement Spares India`
    : `${listing.title} | Refurbished & Pre-Owned ${listing.category} in ${listing.location || "India"}`;

  const desc = isSpare
    ? `Buy certified refurbished and pre-owned ${listing.title} in ${listing.location || "India"}.${listing.compatibleWith ? ` Compatible with ${listing.compatibleWith}.` : ""}${listing.partNumber ? ` Part Number: ${listing.partNumber}.` : ""} Condition: ${listing.condition || "Used"}. Expected Price: ${formatPrice(listing.minPrice, listing.maxPrice)}. Contact Labmatrix for prompt delivery.`
    : `Buy certified refurbished and pre-owned ${listing.title} in ${listing.location || "India"}. Category: ${listing.category}. Condition: ${listing.condition || "Used"}. Expected Price: ${formatPrice(listing.minPrice, listing.maxPrice)}. Contact Labmatrix for inspection, testing, and quotations.`;

  const image =
    listing.photos && listing.photos.length > 0
      ? getOptimizedImageUrl(listing.photos[0], { width: 1200, height: 630, crop: "fill" })
      : "/logo.png";

  const keywords = [
    listing.title,
    `refurbished ${listing.title}`,
    `used ${listing.title}`,
    listing.category,
    `refurbished ${listing.category}`,
    listing.partNumber ? `part ${listing.partNumber}` : null,
    listing.partNumber,
    listing.compatibleWith ? `compatible with ${listing.compatibleWith}` : null,
    listing.compatibleWith,
    isSpare ? "refurbished lab spare parts India" : "refurbished analytical instruments India",
    isSpare ? "analytical instrument spare parts India" : "used lab equipment India",
    listing.location,
    "refurbished analytical instruments",
    "pre-owned scientific machinery",
    "Labmatrix marketplace",
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
  const session = await auth();
  const listing = await getListing(id);

  if (!listing) {
    notFound();
  }

  const isOwner = session?.user?.id === listing.sellerId;
  const isAdmin = session?.user?.role === "ADMIN";

  // If unapproved, only owner or admin can preview it
  if (!listing.isApproved && !isOwner && !isAdmin) {
    notFound();
  }

  const isSpare = listing.itemType === "SPARE_PART";
  const catalogHref =
    listing.itemType === "NEW_INSTRUMENT"
      ? "/new-instruments"
      : listing.itemType === "SPARE_PART"
      ? "/spare-parts"
      : "/listings";

  const catalogName =
    listing.itemType === "NEW_INSTRUMENT"
      ? "Brand new"
      : listing.itemType === "SPARE_PART"
      ? "Spare parts"
      : "Pre-owned";

  const productJsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Product",
        "@id": `https://surplus.labmatrixindia.com/listings/${listing.id}#product`,
        name: listing.title,
        description: listing.description,
        category: listing.category,
        image: listing.photos && listing.photos.length > 0 ? listing.photos : undefined,
        itemCondition:
          listing.condition?.toLowerCase().includes("new")
            ? "https://schema.org/NewCondition"
            : listing.condition?.toLowerCase().includes("refurbished")
            ? "https://schema.org/RefurbishedCondition"
            : "https://schema.org/UsedCondition",
        sku: listing.partNumber || listing.id,
        brand: {
          "@type": "Brand",
          name: listing.title.split(" ")[0] || "Analytical",
        },
        offers: listing.minPrice && listing.minPrice > 0
          ? {
              "@type": "AggregateOffer",
              priceCurrency: "INR",
              lowPrice: listing.minPrice,
              highPrice: listing.maxPrice && listing.maxPrice > 0 ? listing.maxPrice : listing.minPrice,
              offerCount: listing.quantity || 1,
              availability:
                listing.status === "SOLD"
                  ? "https://schema.org/OutOfStock"
                  : "https://schema.org/InStock",
              seller: {
                "@type": "Organization",
                name: "Labmatrix Verified Seller Network",
                url: "https://surplus.labmatrixindia.com",
              },
            }
          : {
              "@type": "Offer",
              priceCurrency: "INR",
              availability:
                listing.status === "SOLD"
                  ? "https://schema.org/OutOfStock"
                  : "https://schema.org/InStock",
              seller: {
                "@type": "Organization",
                name: "Labmatrix Verified Seller Network",
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
            name: "Marketplace",
            item: "https://surplus.labmatrixindia.com/listings",
          },
          {
            "@type": "ListItem",
            position: 3,
            name: catalogName,
            item: `https://surplus.labmatrixindia.com${catalogHref}`,
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
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8 pb-24 lg:pb-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: toJsonLd(productJsonLd) }}
      />
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb Navigation */}
        <div className="mb-6 flex items-center space-x-2 text-xs font-semibold text-slate-500 overflow-x-auto whitespace-nowrap">
          <Link href="/" className="hover:text-brand-blue transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link href="/listings" className="hover:text-brand-blue transition-colors">
            Marketplace
          </Link>
          <span>/</span>
          <Link href={catalogHref} className="hover:text-brand-blue transition-colors">
            {catalogName}
          </Link>
          <span>/</span>
          <Link
            href={`${catalogHref}?category=${encodeURIComponent(listing.category)}`}
            className="hover:text-brand-blue transition-colors"
          >
            {listing.category}
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
                This listing is currently under admin review and is not visible to the public. You will receive an on-site notification as soon as it is approved.
              </p>
            </div>
          </div>
        )}

        {/* SOLD Banner with Direct Sourcing Request Action */}
        {listing.status === "SOLD" && (
          <div className="mb-6 p-4 sm:p-5 rounded-2xl bg-amber-50/90 border border-amber-200/80 text-amber-950 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
            <div className="flex items-start space-x-3">
              <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center flex-shrink-0 mt-0.5">
                <BadgeAlert className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-black uppercase tracking-wider bg-slate-900 text-white px-2 py-0.5 rounded-md">
                    Item Sold Out
                  </span>
                  <span className="text-xs font-bold text-amber-900">• Looking for this model?</span>
                </div>
                <p className="text-xs text-amber-800 mt-1 max-w-2xl leading-relaxed">
                  This specific unit has been sold. However, Labmatrix actively sources certified refurbished &amp; pre-owned{" "}
                  <strong>{listing.title}</strong> across India. Submit an inquiry or post a sourcing request to get notified when equivalent stock arrives.
                </p>
              </div>
            </div>
            <Link
              href={`/requests/create?title=${encodeURIComponent(listing.title)}&category=${encodeURIComponent(listing.category)}`}
              className="inline-flex items-center justify-center space-x-1.5 px-4 py-2.5 rounded-xl bg-brand-blue text-white hover:bg-brand-blue-700 text-xs font-bold shadow-xs transition-all whitespace-nowrap self-start sm:self-auto"
            >
              <span>Post Sourcing Request</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}

        {/* Main Content Layout: Two-Column Decision Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column (7 Cols on lg, 8 on xl): Photos & Specifications */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-6">
            {/* Gallery */}
            <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-xs border border-slate-200">
              <PhotoGallery
                photos={listing.photos}
                documents={listing.documents}
                title={listing.title}
              />
            </div>

            {/* Specifications Card */}
            <div className="bg-white rounded-2xl p-6 sm:p-7 shadow-xs border border-slate-200">
              <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center space-x-2">
                <Boxes className="w-4 h-4 text-brand-blue" />
                <span>Instrument Specifications</span>
              </h2>

              <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100 text-sm">
                <div className="grid grid-cols-3 p-3.5 bg-slate-50/50">
                  <span className="text-slate-500 font-medium">Condition</span>
                  <span className="col-span-2 font-bold text-slate-900">{listing.condition || "Used"}</span>
                </div>
                <div className="grid grid-cols-3 p-3.5 bg-white">
                  <span className="text-slate-500 font-medium">Quantity</span>
                  <span className="col-span-2 font-bold text-slate-900">{listing.quantity || 1} available</span>
                </div>
                <div className="grid grid-cols-3 p-3.5 bg-slate-50/50">
                  <span className="text-slate-500 font-medium">Location</span>
                  <span className="col-span-2 font-bold text-slate-900">{listing.location || "India"}</span>
                </div>
                <div className="grid grid-cols-3 p-3.5 bg-white">
                  <span className="text-slate-500 font-medium">Listed Date</span>
                  <span className="col-span-2 font-bold text-slate-900">{formatDate(listing.createdAt)}</span>
                </div>
                {isSpare && listing.partNumber && (
                  <div className="grid grid-cols-3 p-3.5 bg-slate-50/50">
                    <span className="text-slate-500 font-medium">Part Number</span>
                    <span className="col-span-2 font-mono font-bold text-brand-blue bg-brand-blue-50/80 px-2 py-0.5 rounded w-fit text-xs">
                      {listing.partNumber}
                    </span>
                  </div>
                )}
                {isSpare && listing.compatibleWith && (
                  <div className="grid grid-cols-3 p-3.5 bg-white">
                    <span className="text-slate-500 font-medium">Compatible With</span>
                    <span className="col-span-2 font-bold text-slate-900">{listing.compatibleWith}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Description Card */}
            <div className="bg-white rounded-2xl p-6 sm:p-7 shadow-xs border border-slate-200 space-y-3">
              <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                <FileText className="w-4 h-4 text-brand-blue" />
                <span>Technical Description & Details</span>
              </h2>
              <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-line bg-slate-50 p-5 rounded-xl border border-slate-100">
                {listing.description}
              </div>
            </div>

            {/* Attached Documents & Manuals */}
            <DocumentList
              documents={listing.documents}
              listingTitle={listing.title}
            />
          </div>

          {/* Right Column (5 Cols on lg, 4 on xl): Sticky Decision & Inquiry Panel */}
          <div className="lg:col-span-5 xl:col-span-4 lg:sticky lg:top-24 space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-md space-y-4">
              {/* Category & Action Icons */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-brand-blue bg-brand-blue-50 px-2.5 py-1 rounded-lg border border-brand-blue-100">
                  {listing.category}
                </span>
                <div className="flex items-center space-x-1">
                  <ShareListingButton title={listing.title} />
                  <SaveListingButton
                    listingId={listing.id}
                    className="p-2 rounded-xl hover:bg-slate-100"
                  />
                </div>
              </div>

              {/* Title */}
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 leading-snug">
                {listing.title}
              </h1>

              {/* Price Block */}
              <div className="pt-3 border-t border-slate-100">
                <span className="text-xs font-semibold text-slate-400 block mb-0.5">
                  {listing.status === "SOLD" ? "Last Asking Price" : "Expected Price"}
                </span>
                <div className="text-2xl sm:text-3xl font-black text-brand-blue">
                  {formatPrice(listing.minPrice, listing.maxPrice)}
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  {listing.status === "SOLD"
                    ? "Unit is sold. Inquire below to request incoming or equivalent units."
                    : "Prices negotiable subject to technical condition & accessories."}
                </p>
                {listing.quantity && listing.quantity > 1 ? (
                  <div className="mt-2 text-xs font-semibold text-slate-700 flex items-center space-x-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span>
                      Stock: <strong>{listing.quantity} units</strong> available
                    </span>
                  </div>
                ) : null}
              </div>

              {/* Inquiry Form */}
              <div className="pt-2">
                <InquiryBox
                  listingId={listing.id}
                  itemTitle={listing.title}
                  isSold={listing.status === "SOLD"}
                />
              </div>
            </div>

            {/* Single Trust Strip */}
            <div className="bg-slate-100/90 text-slate-700 rounded-xl p-4 text-xs leading-relaxed border border-slate-200 flex items-start space-x-2.5">
              <ShieldCheck className="w-4 h-4 text-brand-blue flex-shrink-0 mt-0.5" />
              <span>
                <strong>Verified by Labmatrix.</strong> Contact details are never shown publicly; our Deal Desk coordinates verification, inspection, and escrow handover.
              </span>
            </div>
          </div>
        </div>

        {/* Mobile Sticky Action Bar */}
        <MobileListingActionBar
          listingId={listing.id}
          minPrice={listing.minPrice}
          maxPrice={listing.maxPrice}
          isSold={listing.status === "SOLD"}
        />
      </div>
    </div>
  );
}
