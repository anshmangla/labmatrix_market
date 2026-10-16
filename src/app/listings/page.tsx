"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Search,
  Filter,
  PlusCircle,
  ShieldCheck,
  Tag,
  MapPin,
  Clock,
  ExternalLink,
  SlidersHorizontal,
  IndianRupee,
} from "lucide-react";
import { getOptimizedImageUrl, IMAGE_PRESETS } from "@/lib/images";

interface Listing {
  id: string;
  title: string;
  description: string;
  category: string;
  minPrice: number;
  maxPrice: number;
  condition: string;
  location: string;
  photos: string[];
  quantity?: number;
  createdAt: string;
  status: string;
}

const CATEGORIES = [
  "ALL",
  "HPLC & UHPLC",
  "GC & GC-MS",
  "UV-Vis & FTIR",
  "AAS",
  "ICP-OES & ICP-MS",
  "DSC-TGA & DMA",
  "Dissolution Testers",
  "Stability Chambers",
  "Particle Analyzers",
  "Centrifuges & Shakers",
  "Karl Fischer & Titrators",
  "Other Lab Equipment",
];

const PRICE_TIERS = [
  { label: "All Prices", min: "", max: "" },
  { label: "Under ₹3 Lakh", min: "", max: "300000" },
  { label: "₹3L - ₹8 Lakh", min: "300000", max: "800000" },
  { label: "₹8L - ₹20 Lakh", min: "800000", max: "2000000" },
  { label: "₹20 Lakh+", min: "2000000", max: "" },
];

function ListingsContent() {
  const searchParams = useSearchParams();
  const urlCategory = searchParams.get("category");
  const urlQuery = searchParams.get("query");

  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(urlQuery || "");
  const [selectedCategory, setSelectedCategory] = useState(
    urlCategory && CATEGORIES.includes(urlCategory) ? urlCategory : "ALL"
  );
  const [selectedPriceTier, setSelectedPriceTier] = useState(0);

  // Sync state if searchParams change in the URL
  useEffect(() => {
    const cat = searchParams.get("category");
    if (cat && CATEGORIES.includes(cat)) {
      setSelectedCategory(cat);
    } else if (!cat) {
      setSelectedCategory("ALL");
    }

    const q = searchParams.get("query");
    if (q !== null) {
      setSearch(q);
    }
  }, [searchParams]);

  useEffect(() => {
    fetchListings();
  }, [selectedCategory, selectedPriceTier]);

  const fetchListings = async () => {
    setLoading(true);
    try {
      let url = `/api/listings?itemType=MACHINE&`;
      if (selectedCategory !== "ALL") {
        url += `category=${encodeURIComponent(selectedCategory)}&`;
      }
      if (search.trim()) {
        url += `query=${encodeURIComponent(search.trim())}&`;
      }

      const tier = PRICE_TIERS[selectedPriceTier];
      if (tier.min) url += `minPrice=${tier.min}&`;
      if (tier.max) url += `maxPrice=${tier.max}&`;

      const res = await fetch(url);
      const data = await res.json();
      if (data?.listings) {
        setListings(data.listings);
      }
    } catch (err) {
      console.error("Fetch listings error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchListings();
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center space-x-1.5 text-xs font-bold text-brand-blue bg-brand-blue-50 border border-brand-blue-100 px-3 py-1 rounded-full mb-2">
              <ShieldCheck className="w-3.5 h-3.5 text-brand-gold-600" />
              <span>Verified Equipment Catalog • Direct Quotations</span>
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900">
              Browse Pre-Owned Equipment
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Verified analytical instruments available across pharmaceutical &
              chemical laboratories.
            </p>
          </div>

          <Link
            href="/listings/create"
            className="inline-flex items-center space-x-2 px-5 py-3 rounded-xl bg-brand-gold text-brand-blue hover:bg-brand-gold-300 font-bold text-sm shadow-md transition-all self-start md:self-auto"
          >
            <PlusCircle className="w-4 h-4 text-brand-blue" />
            <span>List a Machine</span>
          </Link>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white p-4 rounded-2xl shadow-xs border border-slate-200 mb-8 space-y-4">
          <form onSubmit={handleSearchSubmit} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                placeholder="Search models, brands (Waters, Agilent, Shimadzu, Thermo Fisher, Metrohm)..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-blue focus:bg-white"
              />
            </div>
            <button
              type="submit"
              className="px-5 py-2.5 bg-brand-blue hover:bg-brand-blue-500 text-white text-sm font-semibold rounded-xl transition-colors"
            >
              Search
            </button>
          </form>

          {/* Category Chips */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center pr-2 flex-shrink-0">
              <Filter className="w-3.5 h-3.5 mr-1 text-brand-blue" /> Category:
            </span>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? "bg-brand-blue text-white shadow-xs"
                    : "bg-slate-100 hover:bg-brand-blue-50 hover:text-brand-blue text-slate-600"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Price Range Chips */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-1 pt-1 border-t border-slate-100 scrollbar-none">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center pr-2 flex-shrink-0">
              <IndianRupee className="w-3.5 h-3.5 mr-1" /> Budget:
            </span>
            {PRICE_TIERS.map((tier, idx) => (
              <button
                key={tier.label}
                type="button"
                onClick={() => setSelectedPriceTier(idx)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedPriceTier === idx
                    ? "bg-slate-900 text-white shadow-xs"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-600"
                }`}
              >
                {tier.label}
              </button>
            ))}
          </div>
        </div>

        {/* Listings Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border border-slate-200 p-4 space-y-4 animate-pulse"
              >
                <div className="bg-slate-200 rounded-xl aspect-[4/3] w-full" />
                <div className="h-4 bg-slate-200 rounded w-3/4" />
                <div className="h-3 bg-slate-200 rounded w-1/2" />
                <div className="h-6 bg-slate-200 rounded w-1/3" />
              </div>
            ))}
          </div>
        ) : listings.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-lg mx-auto my-12">
            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400 mb-4">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">
              No equipment found
            </h3>
            <p className="text-sm text-slate-500 mt-1">
              No listings matched your filters. Try selecting &quot;All Prices&quot;
              or resetting the category.
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory("ALL");
                  setSelectedPriceTier(0);
                  setSearch("");
                }}
                className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Reset All Filters
              </button>
              <Link
                href="/listings/create"
                className="inline-flex items-center space-x-2 px-4 py-2 bg-brand-gold text-brand-blue hover:bg-brand-gold-300 font-bold rounded-xl text-xs shadow-xs"
              >
                <PlusCircle className="w-4 h-4 text-brand-blue" />
                <span>List a Machine</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((item, idx) => (
              <Link
                key={item.id}
                href={`/listings/${item.id}`}
                className="group bg-white rounded-2xl border border-slate-200 hover:border-brand-blue shadow-xs hover:shadow-lg transition-all flex flex-col overflow-hidden"
              >
                {/* Image */}
                <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden">
                  {item.photos && item.photos.length > 0 ? (
                    <img
                      src={getOptimizedImageUrl(item.photos[0], IMAGE_PRESETS.CARD)}
                      alt={item.title}
                      width={600}
                      height={450}
                      loading={idx < 3 ? "eager" : "lazy"}
                      fetchPriority={idx === 0 ? "high" : "auto"}
                      decoding="async"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 bg-slate-100">
                      <Tag className="w-8 h-8 mb-2" />
                      <span className="text-xs">No photos provided</span>
                    </div>
                  )}

                  {/* Badges */}
                  <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 items-center">
                    <span className="bg-brand-blue-900/85 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md">
                      {item.category}
                    </span>
                    {item.quantity && item.quantity > 1 ? (
                      <span className="bg-amber-500/90 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs">
                        Qty: {item.quantity}
                      </span>
                    ) : null}
                    {item.status === "SOLD" && (
                      <span className="bg-rose-600 text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md shadow-sm border border-rose-400">
                        SOLD
                      </span>
                    )}
                  </div>

                  {/* SOLD OUT Overlay */}
                  {item.status === "SOLD" && (
                    <div className="absolute inset-0 bg-slate-950/35 backdrop-blur-[1px] flex items-center justify-center">
                      <span className="bg-rose-600 text-white text-xs sm:text-sm font-black uppercase tracking-widest px-4 py-1 rounded-lg shadow-lg border border-white/40 transform -rotate-6">
                        SOLD OUT
                      </span>
                    </div>
                  )}

                  <div className="absolute bottom-3 right-3 bg-brand-blue/90 backdrop-blur-md text-white text-[10px] font-semibold px-2 py-0.5 rounded-md flex items-center space-x-1 border border-brand-gold/30">
                    <ShieldCheck className="w-3 h-3 text-brand-gold" />
                    <span>Verified Listing</span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-slate-900 text-base group-hover:text-brand-blue transition-colors line-clamp-2">
                      {item.title}
                    </h3>

                    <p className="text-xs text-slate-500 mt-2 line-clamp-2">
                      {item.description}
                    </p>
                  </div>

                  <div className="mt-4 pt-4 border-t border-slate-100 space-y-2">
                    {/* Price Range */}
                    <div className="flex items-baseline justify-between">
                      <span className="text-xs font-medium text-slate-400">
                        {item.status === "SOLD" ? "Sold Price Range:" : "Approx. Range:"}
                      </span>
                      <div className="flex items-center space-x-1.5">
                        <span className="text-base font-black text-brand-blue">
                          ₹{item.minPrice.toLocaleString("en-IN")} - ₹
                          {item.maxPrice.toLocaleString("en-IN")}
                        </span>
                        {item.status === "SOLD" && (
                          <span className="px-1.5 py-0.5 text-[10px] font-extrabold uppercase rounded bg-rose-100 text-rose-700 border border-rose-200">
                            SOLD
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Metadata */}
                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                      <span className="flex items-center">
                        <MapPin className="w-3 h-3 mr-1 text-slate-400" />
                        {item.location || "India"}
                      </span>
                      <span className="text-brand-blue font-semibold bg-brand-blue-50 px-2 py-0.5 rounded">
                        {item.condition}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function BrowseListingsPage() {
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
      <ListingsContent />
    </Suspense>
  );
}
