import React from "react";
import Link from "next/link";
import type { Metadata } from "next";
import {
  Search,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Tag,
  FileQuestion,
  Cpu,
  FlaskConical,
  Gauge,
  Microscope,
  Flame,
  Sparkles,
  Thermometer,
  ChevronDown,
  MapPin,
  Clock,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { cachedPublicRead, PUBLIC_LISTINGS_TAG, PUBLIC_REQUIREMENTS_TAG } from "@/lib/public-cache";
import { formatPrice, formatRelativeTime } from "@/lib/formatters";
import { getOptimizedImageUrl, IMAGE_PRESETS } from "@/lib/images";
import SaveListingButton from "@/components/listings/SaveListingButton";
import { toJsonLd } from "@/lib/json-ld";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: {
    absolute: "Labmatrix Marketplace | Certified Pre-Owned Analytical Instruments & Spares",
  },
  description:
    "India's dedicated B2B marketplace to buy and sell certified refurbished & pre-owned analytical equipment: HPLC, GC-MS, UV-Vis, AAS, ICP-OES, and spare parts with verified technical inspection.",
  keywords: [
    "refurbished analytical instruments India",
    "refurbished HPLC machines",
    "refurbished GC-MS systems",
    "refurbished AAS spectrometer",
    "refurbished ICP-OES India",
    "refurbished laboratory equipment Delhi NCR",
    "pre-owned analytical instruments marketplace",
    "refurbished Waters Agilent Shimadzu PerkinElmer",
    "buy used pharma instruments",
    "refurbished lab instruments with warranty",
  ],
  alternates: {
    canonical: "/",
  },
};

export default async function Home() {
  let recentListings: Array<{
    id: string;
    title: string;
    category: string;
    minPrice: number | null;
    maxPrice: number | null;
    condition: string | null;
    location: string | null;
    photos: string[];
    createdAt: Date;
  }> = [];

  let recentRequests: Array<{
    id: string;
    title: string;
    description: string;
    category: string;
    partNumber: string | null;
    compatibleWith: string | null;
    createdAt: Date;
  }> = [];

  try {
    const fetchListings = () =>
      prisma.listing.findMany({
        where: {
          isApproved: true,
          status: "AVAILABLE",
        },
        orderBy: { createdAt: "desc" },
        take: 4,
        select: {
          id: true,
          title: true,
          category: true,
          minPrice: true,
          maxPrice: true,
          condition: true,
          location: true,
          photos: true,
          createdAt: true,
        },
      });

    const listings = await cachedPublicRead(
      PUBLIC_LISTINGS_TAG,
      ["home-recent-listings"],
      fetchListings
    );
    recentListings = listings || [];
  } catch (error) {
    console.error("Error fetching home recent listings:", error);
  }

  try {
    const fetchRequests = () =>
      prisma.requirement.findMany({
        where: {
          isApproved: true,
          status: "OPEN",
        },
        orderBy: { createdAt: "desc" },
        take: 3,
        select: {
          id: true,
          title: true,
          description: true,
          category: true,
          partNumber: true,
          compatibleWith: true,
          createdAt: true,
        },
      });

    const requests = await cachedPublicRead(
      PUBLIC_REQUIREMENTS_TAG,
      ["home-recent-requests"],
      fetchRequests
    );
    recentRequests = requests || [];
  } catch (error) {
    console.error("Error fetching home recent requests:", error);
  }

  const categories = [
    { name: "HPLC & UHPLC", count: "Chromatography", icon: Gauge },
    { name: "GC & GC-MS", count: "Gas Systems", icon: FlaskConical },
    { name: "UV-Vis & FTIR", count: "Spectroscopy", icon: Microscope },
    { name: "AAS", count: "Atomic Absorption", icon: Flame },
    { name: "ICP-OES & ICP-MS", count: "Plasma Spectroscopy", icon: Sparkles },
    { name: "DSC-TGA & DMA", count: "Thermal Analysis", icon: Thermometer },
    { name: "Spare Parts & Modules", count: "Replacement Components", icon: Cpu },
    { name: "Dissolution Testers", count: "Pharma Testing", icon: Microscope },
  ];

  const faqs = [
    {
      question: "What types of analytical instruments and spare parts can I trade on Labmatrix?",
      answer:
        "Labmatrix specializes in certified refurbished, pre-owned, and new analytical equipment including HPLC, UHPLC, GC, GC-MS, ICP-OES, ICP-MS, AAS, UV-Vis, FTIR, DSC-TGA, and genuine replacement spare parts such as PPC modules, power supplies, deuterium lamps, and boards from manufacturers like PerkinElmer, Agilent, Waters, and Shimadzu.",
    },
    {
      question: "How does Labmatrix ensure equipment quality and refurbished verification?",
      answer:
        "Every refurbished and pre-owned listing submitted to Labmatrix undergoes technical verification before appearing publicly. We cross-verify specifications, serial numbers, module configurations, refurbishment status, and operational history. On-site or video technical inspections can be arranged prior to final transaction closing.",
    },
    {
      question: "Can I find hard-to-source or refurbished spare parts for older instruments?",
      answer:
        "Yes. In our dedicated Spare Parts hub (/spare-parts), laboratories and service engineers can source tested working surplus, refurbished boards, replacement power supplies, and OEM modules. If you cannot find a specific part, you can post a wanted requirement to notify suppliers nationwide.",
    },
    {
      question: "How is buyer and seller confidentiality maintained?",
      answer:
        "To protect your laboratory from spam and unsolicited outreach, personal contact details (phone numbers and emails) remain completely confidential. Communications and offers are facilitated securely through your dashboard and coordinated via our technical Deal Desk.",
    },
    {
      question: "How do I list surplus laboratory instruments for sale?",
      answer:
        "Simply sign in with your email or Google account, click '+ List equipment', select whether you are listing a complete machine or a spare part, provide instrument specifications with photos and expected price range, and submit. Once verified by our administration team, your listing will be published live.",
    },
  ];

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* 1. Cleaned-Up Hero Section */}
      <section className="relative bg-brand-blue-950 text-white pt-14 pb-20 px-4 sm:px-6 lg:px-8 border-b border-brand-blue-900">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center space-x-2 bg-brand-gold/15 border border-brand-gold/40 px-3.5 py-1 rounded-full text-xs font-bold text-brand-gold shadow-xs">
            <ShieldCheck className="w-3.5 h-3.5 text-brand-gold" />
            <span>Verified B2B Marketplace • Laboratory Instruments & Spares</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
            Buy & Sell Certified Pre-Owned <br className="hidden sm:inline" />
            <span className="text-brand-gold">
              Analytical Instruments & Spares
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
            India&apos;s dedicated B2B equipment marketplace connecting pharmaceutical labs, research institutes,
            and service engineers with verified specifications, transparent pricing, and direct quotes.
          </p>

          {/* Prominent Search Bar Form */}
          <form action="/listings" method="GET" className="max-w-2xl mx-auto pt-2">
            <div className="bg-white p-1.5 sm:p-2 rounded-2xl shadow-xl flex items-center gap-2 border border-slate-200">
              <div className="flex-1 flex items-center px-3 text-slate-700 min-w-0">
                <Search className="w-4 h-4 text-slate-400 mr-2.5 flex-shrink-0" />
                <input
                  name="query"
                  type="text"
                  placeholder="Search HPLC, GC-MS, Agilent, Waters, part no..."
                  className="w-full bg-transparent border-none focus:outline-none text-xs sm:text-sm text-slate-900 placeholder-slate-400"
                />
              </div>
              <button
                type="submit"
                className="bg-brand-blue hover:bg-brand-blue-500 text-white font-bold text-xs sm:text-sm px-4 sm:px-6 py-2.5 rounded-xl transition-all shadow-xs flex items-center space-x-1.5 flex-shrink-0"
              >
                <span>Find Machines</span>
                <ArrowRight className="w-3.5 h-3.5 text-brand-gold" />
              </button>
            </div>
          </form>

          {/* Quick Action CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              href="/listings/create"
              prefetch={false}
              className="inline-flex items-center space-x-1.5 bg-brand-gold text-brand-blue-950 hover:bg-brand-gold-500 font-bold px-4 py-2 rounded-xl text-xs sm:text-sm transition-all shadow-xs"
            >
              <Tag className="w-3.5 h-3.5 text-brand-blue-950" />
              <span>+ List equipment</span>
            </Link>

            <Link
              href="/requests/create"
              prefetch={false}
              className="inline-flex items-center space-x-1.5 bg-white/10 hover:bg-white/15 border border-white/20 text-white font-semibold px-4 py-2 rounded-xl text-xs sm:text-sm transition-all"
            >
              <FileQuestion className="w-3.5 h-3.5 text-brand-gold" />
              <span>Post requirement</span>
            </Link>

            <Link
              href="/requests"
              className="inline-flex items-center space-x-1 text-slate-300 hover:text-white font-semibold px-3 py-2 text-xs sm:text-sm transition-colors"
            >
              <span>View Buyer Requests →</span>
            </Link>
          </div>

          {/* Single Trust Checkmark Strip */}
          <div className="flex flex-wrap items-center justify-center gap-y-2 gap-x-5 text-[11px] sm:text-xs text-slate-300 font-medium pt-3 border-t border-brand-blue-900/60">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-brand-gold flex-shrink-0" />
              <span>Admin-verified equipment</span>
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-brand-gold flex-shrink-0" />
              <span>Contact details kept private</span>
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-brand-gold flex-shrink-0" />
              <span>On-site or video inspection</span>
            </span>
          </div>
        </div>
      </section>

      {/* 2. Recently Listed Equipment (Live Inventory Above the Fold) */}
      {recentListings.length > 0 && (
        <section className="py-12 sm:py-16 bg-white border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-8 gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-brand-blue">
                  Verified Inventory
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
                  Recently Listed Equipment
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Certified pre-owned and refurbished analytical instruments inspected for technical performance.
                </p>
              </div>
              <Link
                href="/listings"
                className="inline-flex items-center space-x-1 text-xs sm:text-sm font-bold text-brand-blue hover:text-brand-blue-500 transition-colors whitespace-nowrap"
              >
                <span>View all inventory</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {recentListings.map((item) => (
                <Link
                  key={item.id}
                  href={`/listings/${item.id}`}
                  className="group bg-white rounded-2xl border border-slate-200 hover:border-brand-blue shadow-2xs hover:shadow-md transition-all flex flex-col overflow-hidden"
                >
                  {/* Thumbnail Image Container */}
                  <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden">
                    {item.photos && item.photos.length > 0 ? (
                      <img
                        src={getOptimizedImageUrl(item.photos[0], IMAGE_PRESETS.CARD)}
                        alt={item.title}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 bg-slate-100">
                        <Tag className="w-8 h-8 mb-1" />
                        <span className="text-[11px]">No photos provided</span>
                      </div>
                    )}

                    {/* Top Right Save Heart Button */}
                    <div className="absolute top-2.5 right-2.5 z-10 w-8 h-8 rounded-full bg-white/90 backdrop-blur-xs shadow-xs flex items-center justify-center hover:bg-white transition-colors">
                      <SaveListingButton listingId={item.id} />
                    </div>

                    {/* Condition Badge */}
                    <div className="absolute bottom-2.5 left-2.5">
                      <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-white/95 text-slate-800 shadow-xs backdrop-blur-xs">
                        {item.condition || "Pre-Owned"}
                      </span>
                    </div>
                  </div>

                  {/* Listing Details */}
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <p className="text-[11px] font-semibold text-brand-blue uppercase tracking-wider truncate">
                        {item.category}
                      </p>
                      <h3 className="font-bold text-slate-900 text-sm mt-1 line-clamp-2 group-hover:text-brand-blue transition-colors">
                        {item.title}
                      </h3>
                    </div>

                    <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-slate-400 block font-medium">Estimated Price</span>
                        <span className="text-sm font-black text-brand-blue">
                          {formatPrice(item.minPrice, item.maxPrice)}
                        </span>
                      </div>
                      {item.location && (
                        <span className="text-[11px] text-slate-500 flex items-center gap-0.5 max-w-[120px] truncate">
                          <MapPin className="w-3 h-3 text-slate-400 flex-shrink-0" />
                          <span className="truncate">{item.location}</span>
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 3. Laboratories Are Looking For (Active Demand Board) */}
      {recentRequests.length > 0 && (
        <section className="py-12 sm:py-16 bg-slate-50 border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-8 gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-brand-blue">
                  Active Demand
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
                  Laboratories Are Looking For
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Verified buyer sourcing requirements. Match an idle machine or spare part from your lab.
                </p>
              </div>
              <Link
                href="/requests"
                className="inline-flex items-center space-x-1 text-xs sm:text-sm font-bold text-brand-blue hover:text-brand-blue-500 transition-colors whitespace-nowrap"
              >
                <span>All buyer requests</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {recentRequests.map((req) => (
                <Link
                  key={req.id}
                  href={`/requests/${req.id}`}
                  className="group bg-white rounded-2xl border border-slate-200 hover:border-brand-blue shadow-2xs hover:shadow-md transition-all p-5 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between text-[11px] mb-2">
                      <span className="font-bold text-brand-blue bg-blue-50 px-2 py-0.5 rounded-md">
                        {req.category}
                      </span>
                      <span className="text-slate-400 flex items-center gap-1 font-medium">
                        <Clock className="w-3 h-3" />
                        <span>{formatRelativeTime(req.createdAt)}</span>
                      </span>
                    </div>

                    <h3 className="font-bold text-slate-900 text-sm group-hover:text-brand-blue transition-colors leading-snug line-clamp-2">
                      {req.title}
                    </h3>

                    {(req.partNumber || req.compatibleWith) && (
                      <div className="mt-1.5 flex flex-wrap gap-1 text-[11px] font-mono text-slate-600">
                        {req.partNumber && (
                          <span className="bg-slate-100 px-1.5 py-0.5 rounded">
                            PN: {req.partNumber}
                          </span>
                        )}
                        {req.compatibleWith && (
                          <span className="bg-slate-100 px-1.5 py-0.5 rounded truncate max-w-[200px]">
                            For {req.compatibleWith}
                          </span>
                        )}
                      </div>
                    )}

                    <p className="text-xs text-slate-600 mt-2.5 line-clamp-2 leading-relaxed font-normal">
                      {req.description}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-brand-blue group-hover:text-brand-blue-500 flex items-center gap-1">
                      <span>Offer a unit</span>
                      <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Labmatrix Verified
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 4. Instrument Categories Browser */}
      <section className="py-14 sm:py-16 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-brand-blue">
                Instrument Catalogs
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
                Explore Laboratory Machinery
              </h2>
            </div>
            <Link
              href="/listings"
              className="text-xs sm:text-sm font-bold text-brand-blue hover:text-brand-blue-500 transition-colors"
            >
              All 13 categories →
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map((cat, idx) => {
              const Icon = cat.icon;
              return (
                <Link
                  key={idx}
                  href={`/listings?category=${encodeURIComponent(cat.name)}`}
                  className="bg-slate-50/70 hover:bg-white p-5 rounded-2xl border border-slate-200 hover:border-brand-blue hover:shadow-md transition-all group flex flex-col justify-between"
                >
                  <div className="w-10 h-10 rounded-xl bg-white group-hover:bg-brand-blue flex items-center justify-center text-slate-700 group-hover:text-brand-gold transition-colors mb-4 shadow-2xs border border-slate-200/60">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm group-hover:text-brand-blue transition-colors">
                      {cat.name}
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {cat.count}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5. How It Works Section */}
      <section id="how-it-works" className="py-16 bg-slate-50 border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-blue">
              Simple & Transparent
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
              How It Works on Labmatrix
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-2">
              A streamlined, verified process to list surplus equipment, submit inquiries, and connect laboratories safely.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col">
              <div className="text-2xl font-black text-brand-blue mb-2">01</div>
              <h3 className="font-bold text-slate-900 text-base">
                List Equipment or Post Request
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                Add equipment specs, high-res photos, and approximate price range. Or post the machine or spare parts your laboratory needs.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col">
              <div className="text-2xl font-black text-brand-blue mb-2">02</div>
              <h3 className="font-bold text-slate-900 text-base">
                Send Inquiry / Request Quote
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                Submit questions or price proposals directly on any machine. Inquiries are handled promptly with verified specifications.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col">
              <div className="text-2xl font-black text-brand-blue mb-2">03</div>
              <h3 className="font-bold text-slate-900 text-base">
                Verified Handover & Inspection
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                Coordinate instrument inspections, calibration records verification, and secure logistics between laboratories.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Frequently Asked Questions (FAQ) Section with Collapsible Accordions & Schema */}
      <section className="py-16 bg-white">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: toJsonLd(faqJsonLd) }}
        />
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-blue">
              Common Questions
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
              Frequently Asked Questions
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1.5">
              Everything you need to know about buying, selling, and sourcing analytical instruments on Labmatrix.
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <details
                key={idx}
                className="group bg-slate-50/70 hover:bg-slate-50 rounded-2xl border border-slate-200/80 p-4 sm:p-5 transition-all open:bg-white open:shadow-xs"
              >
                <summary className="font-bold text-slate-900 text-sm sm:text-base cursor-pointer list-none flex items-center justify-between gap-4 select-none">
                  <span className="flex items-start gap-2.5">
                    <span className="text-brand-gold font-black select-none">Q.</span>
                    <span>{faq.question}</span>
                  </span>
                  <ChevronDown className="w-4 h-4 text-slate-400 group-open:rotate-180 transition-transform flex-shrink-0" />
                </summary>
                <p className="text-xs sm:text-sm text-slate-600 mt-3 leading-relaxed pl-6 border-t border-slate-100 pt-3">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
