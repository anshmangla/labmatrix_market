"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Search,
  Filter,
  PlusCircle,
  ShieldCheck,
  Tag,
  MapPin,
  Sparkles,
  IndianRupee,
  Award,
  ArrowRight,
  SlidersHorizontal,
} from "lucide-react";
import { getOptimizedImageUrl, IMAGE_PRESETS } from "@/lib/images";
import { Listing } from "./ListingsClient";

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
  { label: "Under ₹5 Lakh", min: "", max: "500000" },
  { label: "₹5L - ₹15 Lakh", min: "500000", max: "1500000" },
  { label: "₹15L - ₹30 Lakh", min: "1500000", max: "3000000" },
  { label: "₹30 Lakh+", min: "3000000", max: "" },
];

const STATUS_OPTIONS: { label: string; value: "ALL" | "AVAILABLE" | "SOLD" }[] = [
  { label: "All Items", value: "ALL" },
  { label: "Available / In Stock", value: "AVAILABLE" },
  { label: "Sold Out", value: "SOLD" },
];

export default function NewInstrumentsClient({
  initialListings = [],
}: {
  initialListings?: Listing[];
}) {
  const searchParams = useSearchParams();
  const urlCategory = searchParams.get("category");
  const urlQuery = searchParams.get("query");
  const urlStatus = searchParams.get("status");

  const [listings, setListings] = useState<Listing[]>(initialListings);
  const [loading, setLoading] = useState(initialListings.length === 0);
  const [search, setSearch] = useState(urlQuery || "");
  const [selectedCategory, setSelectedCategory] = useState(
    urlCategory && CATEGORIES.includes(urlCategory) ? urlCategory : "ALL"
  );
  const [selectedStatus, setSelectedStatus] = useState<"ALL" | "AVAILABLE" | "SOLD">(
    urlStatus === "AVAILABLE" || urlStatus === "SOLD" ? urlStatus : "ALL"
  );
  const [selectedPriceTier, setSelectedPriceTier] = useState(0);
  const [hasUserInteracted, setHasUserInteracted] = useState(Boolean(urlStatus));

  // Sync state if searchParams change in the URL
  useEffect(() => {
    const cat = searchParams.get("category");
    if (cat && CATEGORIES.includes(cat)) {
      setSelectedCategory(cat);
      setHasUserInteracted(true);
    } else if (!cat && selectedCategory !== "ALL") {
      setSelectedCategory("ALL");
      setHasUserInteracted(true);
    }

    const stat = searchParams.get("status");
    if (stat === "AVAILABLE" || stat === "SOLD") {
      setSelectedStatus(stat);
      setHasUserInteracted(true);
    } else if (!stat && selectedStatus !== "ALL") {
      setSelectedStatus("ALL");
      setHasUserInteracted(true);
    }

    const q = searchParams.get("query");
    if (q !== null && q !== search) {
      setSearch(q);
      setHasUserInteracted(true);
    }
  }, [searchParams]);

  useEffect(() => {
    if (!hasUserInteracted && initialListings.length > 0) {
      return;
    }
    fetchListings();
  }, [selectedCategory, selectedPriceTier, selectedStatus]);

  const fetchListings = async () => {
    setLoading(true);
    try {
      let url = `/api/listings?itemType=NEW_INSTRUMENT&`;
      if (selectedCategory !== "ALL") {
        url += `category=${encodeURIComponent(selectedCategory)}&`;
      }
      if (selectedStatus !== "ALL") {
        url += `status=${encodeURIComponent(selectedStatus)}&`;
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
      console.error("Fetch new instruments error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setHasUserInteracted(true);
    fetchListings();
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-emerald-950 via-teal-900 to-slate-900 rounded-3xl p-8 sm:p-10 text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center space-x-2 bg-emerald-500/20 border border-emerald-400/30 px-3.5 py-1 rounded-full text-xs font-bold text-emerald-300 shadow-xs">
              <Award className="w-3.5 h-3.5 text-emerald-400" />
              <span>Direct Manufacturer & Authorized Distributor Hub</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Brand New Laboratory Instruments
            </h1>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
              Source brand new, factory-sealed analytical machines with full OEM warranty,
              official IQ/OQ validation protocols, and comprehensive installation support.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                href="/listings/create?type=new_instrument"
                className="inline-flex items-center space-x-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-xs sm:text-sm transition-all shadow-md"
              >
                <PlusCircle className="w-4 h-4 text-slate-950" />
                <span>List Brand New Instrument</span>
              </Link>
              <Link
                href="/requests/create?type=new_instrument"
                className="inline-flex items-center space-x-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 font-semibold px-4 py-2.5 rounded-xl text-xs sm:text-sm transition-all"
              >
                <span>Request Custom Quote →</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white p-4 rounded-2xl shadow-xs border border-slate-200 space-y-4">
          <form onSubmit={handleSearchSubmit} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                placeholder="Search brand new HPLC, GC-MS, Spectroscopy, Karl Fischer, Autoclaves..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white"
              />
            </div>
            <button
              type="submit"
              className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-semibold rounded-xl transition-colors"
            >
              Search
            </button>
          </form>

          {/* Category Chips */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center pr-2 flex-shrink-0">
              <Filter className="w-3.5 h-3.5 mr-1 text-emerald-600" /> Category:
            </span>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => {
                  setSelectedCategory(cat);
                  setHasUserInteracted(true);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? "bg-emerald-700 text-white shadow-xs"
                    : "bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-600"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Availability / Status Chips */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-1 pt-1 border-t border-slate-100 scrollbar-none">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center pr-2 flex-shrink-0">
              <SlidersHorizontal className="w-3.5 h-3.5 mr-1 text-emerald-600" /> Status:
            </span>
            {STATUS_OPTIONS.map((opt) => {
              const isSelected = selectedStatus === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    setSelectedStatus(opt.value);
                    setHasUserInteracted(true);
                  }}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                    isSelected
                      ? opt.value === "AVAILABLE"
                        ? "bg-emerald-600 text-white shadow-xs"
                        : opt.value === "SOLD"
                        ? "bg-rose-600 text-white shadow-xs"
                        : "bg-slate-900 text-white shadow-xs"
                      : "bg-slate-100 hover:bg-slate-200 text-slate-600"
                  }`}
                >
                  {opt.value === "AVAILABLE" && (
                    <span
                      className={`w-2 h-2 rounded-full ${
                        isSelected ? "bg-white" : "bg-emerald-500"
                      }`}
                    />
                  )}
                  {opt.value === "SOLD" && (
                    <span
                      className={`w-2 h-2 rounded-full ${
                        isSelected ? "bg-white" : "bg-rose-500"
                      }`}
                    />
                  )}
                  <span>{opt.label}</span>
                </button>
              );
            })}
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
                onClick={() => {
                  setSelectedPriceTier(idx);
                  setHasUserInteracted(true);
                }}
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
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">
              No brand new instruments found
            </h3>
            <p className="text-sm text-slate-500 mt-1">
              Be the first OEM or authorized distributor to showcase brand new equipment in this category.
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory("ALL");
                  setSelectedPriceTier(0);
                  setSearch("");
                  setHasUserInteracted(true);
                }}
                className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Reset All Filters
              </button>
              <Link
                href="/listings/create?type=new_instrument"
                className="inline-flex items-center space-x-2 px-4 py-2 bg-emerald-600 text-white hover:bg-emerald-700 font-bold rounded-xl text-xs shadow-xs"
              >
                <PlusCircle className="w-4 h-4" />
                <span>List Brand New Instrument</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((item, idx) => (
              <Link
                key={item.id}
                href={`/listings/${item.id}`}
                className="group bg-white rounded-2xl border border-slate-200 hover:border-emerald-500 shadow-xs hover:shadow-lg transition-all flex flex-col overflow-hidden cursor-pointer"
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
                      className={`w-full h-full object-cover group-hover:scale-105 transition-all duration-300 ${
                        item.status === "SOLD" ? "grayscale-[40%] contrast-[0.95] opacity-90" : ""
                      }`}
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 bg-slate-100">
                      <Tag className="w-8 h-8 mb-2" />
                      <span className="text-xs">No photos provided</span>
                    </div>
                  )}

                  {/* Badges (Top Left) */}
                  <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 items-center">
                    <span className="bg-emerald-800/90 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md">
                      Brand New
                    </span>
                    <span className="bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md">
                      {item.category}
                    </span>
                    {item.quantity && item.quantity > 1 ? (
                      <span className="bg-amber-500/90 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs">
                        Qty: {item.quantity}
                      </span>
                    ) : null}
                  </div>

                  {/* Status Pill Badge (Top Right) */}
                  {item.status === "SOLD" && (
                    <div className="absolute top-3 right-3 z-10">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider shadow-md border border-white/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                        Sold Out
                      </span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="font-bold text-slate-900 group-hover:text-emerald-700 text-base leading-snug line-clamp-2">
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-2 mt-1.5 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 space-y-2">
                    {/* Price Range & Inquire CTA */}
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                          {item.status === "SOLD" ? "Price Realized (Sold)" : "Price / Quote"}
                        </span>
                        <span className={`text-base font-extrabold ${item.status === "SOLD" ? "text-slate-600" : "text-emerald-800"}`}>
                          ₹{item.minPrice.toLocaleString("en-IN")}
                          {item.maxPrice > item.minPrice && (
                            <span className="text-xs text-slate-400 font-medium ml-1">
                              - ₹{item.maxPrice.toLocaleString("en-IN")}
                            </span>
                          )}
                        </span>
                      </div>

                      <div className="flex items-center space-x-1.5">
                        {item.status === "SOLD" ? (
                          <span className="text-xs font-bold text-amber-800 bg-amber-50 group-hover:bg-amber-100/90 border border-amber-200/90 px-3 py-1.5 rounded-xl transition-all flex items-center space-x-1.5 shadow-2xs">
                            <span>Request Similar</span>
                            <ArrowRight className="w-3 h-3 text-amber-700 group-hover:translate-x-0.5 transition-transform" />
                          </span>
                        ) : (
                          <span className="text-xs font-bold text-emerald-700 group-hover:text-emerald-800 bg-emerald-50 group-hover:bg-emerald-100/70 px-3 py-1.5 rounded-xl transition-colors flex items-center space-x-1">
                            <span>Request Quote</span>
                            <ArrowRight className="w-3 h-3" />
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
                      <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                        OEM Warranty Included
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
