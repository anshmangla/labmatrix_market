import React from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
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
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ListingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();

  const listing = await prisma.listing.findUnique({
    where: { id },
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
      status: true,
      isApproved: true,
      sellerId: true,
      createdAt: true,
      // CRITICAL PRIVACY: Seller name, phone, company, and email are strictly NOT selected!
    },
  });

  if (!listing) {
    notFound();
  }

  const isOwner = session?.user?.id === listing.sellerId;
  const isAdmin = (session?.user as any)?.role === "ADMIN";

  // If not approved, only owner or admin can preview it
  if (!listing.isApproved && !isOwner && !isAdmin) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb Navigation */}
        <div className="mb-6 flex items-center space-x-2 text-xs font-semibold text-slate-500">
          <Link href="/" className="hover:text-teal-600 transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link
            href="/listings"
            className="hover:text-teal-600 transition-colors"
          >
            Listings
          </Link>
          <span>/</span>
          <span className="text-slate-800 truncate max-w-xs">{listing.title}</span>
        </div>

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
                <span className="text-xs font-bold uppercase tracking-wider text-teal-600">
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
                  <span className="text-teal-700 bg-teal-50 px-2 py-0.5 rounded font-semibold">
                    {listing.condition}
                  </span>
                  <span>•</span>
                  <span className="flex items-center">
                    <Clock className="w-3.5 h-3.5 mr-1 text-slate-400" />
                    Listed on {new Date(listing.createdAt).toLocaleDateString()}
                  </span>
                </div>

                {listing.itemType === "SPARE_PART" && (
                  <div className="mt-4 p-3.5 bg-teal-50/70 rounded-xl border border-teal-200/80 flex flex-wrap gap-5 text-xs">
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
                  <FileText className="w-4 h-4 text-teal-600" />
                  <span>Technical Description & Details</span>
                </h2>
                <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-line bg-slate-50 p-5 rounded-xl border border-slate-100">
                  {listing.description}
                </div>
              </div>

              {/* Marketplace Assurance Box */}
              <div className="bg-slate-900 text-white rounded-xl p-5 flex items-start space-x-3.5 shadow-sm">
                <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-teal-400 uppercase tracking-wider">
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
              <span className="text-xs font-semibold text-slate-400 block mb-1">
                Approximate Price Expectation
              </span>
              <div className="text-2xl sm:text-3xl font-black text-slate-900">
                ₹{listing.minPrice.toLocaleString("en-IN")} - ₹
                {listing.maxPrice.toLocaleString("en-IN")}
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Prices negotiable subject to technical condition & included
                accessories.
              </p>

              <div className="mt-4 pt-4 border-t border-slate-100 space-y-2 text-xs text-slate-600">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-3.5 h-3.5 text-teal-600 flex-shrink-0" />
                  <span>Verified laboratory equipment listing</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-3.5 h-3.5 text-teal-600 flex-shrink-0" />
                  <span>On-site or video inspection coordinated</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-3.5 h-3.5 text-teal-600 flex-shrink-0" />
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
