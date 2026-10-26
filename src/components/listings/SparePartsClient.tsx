"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Wrench,
  Search,
  PlusCircle,
  FileQuestion,
  ShieldCheck,
  Tag,
  ArrowRight,
  ExternalLink,
  Layers,
  CheckCircle2,
  Package,
  Cpu,
} from "lucide-react";
import { getOptimizedImageUrl, IMAGE_PRESETS } from "@/lib/images";

export interface SpareListing {
  id: string;
  title: string;
  description: string;
  category: string;
  itemType: string;
  partNumber?: string;
  compatibleWith?: string;
  minPrice: number;
  maxPrice: number;
  condition: string;
  location: string;
  photos: string[];
  quantity?: number;
  createdAt: string;
  status: string;
}

export interface SpareRequirement {
  id: string;
  title: string;
  description: string;
  category: string;
  itemType: string;
  partNumber?: string;
  compatibleWith?: string;
  status: string;
  createdAt: string;
}

const COMMON_PART_CATEGORIES = [
  "ALL",
  "HPLC & UHPLC",
  "GC & GC-MS",
  "UV-Vis & FTIR",
  "AAS",
  "ICP-OES & ICP-MS",
  "DSC-TGA & DMA",
  "Spare Parts & Consumables",
  "Other Lab Equipment",
];

export default function SparePartsClient({
  initialListings = [],
}: {
  initialListings?: SpareListing[];
}) {
  const searchParams = useSearchParams();
  const urlTab = searchParams.get("tab");
  const urlCategory = searchParams.get("category");
  const urlQuery = searchParams.get("query");

  const [activeTab, setActiveTab] = useState<"available" | "wanted">(
    urlTab === "wanted" ? "wanted" : "available"
  );
  const [listings, setListings] = useState<SpareListing[]>(initialListings);
  const [requirements, setRequirements] = useState<SpareRequirement[]>([]);
  const [loading, setLoading] = useState(initialListings.length === 0);
  const [search, setSearch] = useState(urlQuery || "");
  const [selectedCategory, setSelectedCategory] = useState(
    urlCategory && COMMON_PART_CATEGORIES.includes(urlCategory) ? urlCategory : "ALL"
  );
  const [hasUserInteracted, setHasUserInteracted] = useState(
    Boolean(urlCategory || urlQuery || urlTab)
  );

  useEffect(() => {
    if (!hasUserInteracted) {
      setListings(initialListings);
    }
  }, [initialListings, hasUserInteracted]);

  useEffect(() => {
    if (!hasUserInteracted && initialListings.length > 0 && activeTab === "available") {
      return;
    }
    loadData();
  }, [activeTab, selectedCategory]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === "available") {
        let url = `/api/listings?itemType=SPARE_PART&`;
        if (selectedCategory !== "ALL") {
          url += `category=${encodeURIComponent(selectedCategory)}&`;
        }
        if (search.trim()) {
          url += `query=${encodeURIComponent(search.trim())}&`;
        }
        const res = await fetch(url);
        const data = await res.json();
        if (data?.listings) setListings(data.listings);
      } else {
        let url = `/api/requirements?itemType=SPARE_PART&`;
        if (selectedCategory !== "ALL") {
          url += `category=${encodeURIComponent(selectedCategory)}&`;
        }
        if (search.trim()) {
          url += `query=${encodeURIComponent(search.trim())}&`;
        }
        const res = await fetch(url);
        const data = await res.json();
        if (data?.requirements) setRequirements(data.requirements);
      }
    } catch (err) {
      console.error("Failed to load spare parts data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setHasUserInteracted(true);
    loadData();
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Top Hero Banner */}
        <div className="bg-gradient-to-r from-brand-blue-950 via-brand-blue-900 to-slate-900 rounded-3xl p-8 sm:p-10 text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center space-x-2 bg-brand-gold/15 border border-brand-gold/40 px-3.5 py-1 rounded-full text-xs font-bold text-brand-gold shadow-xs">
              <ShieldCheck className="w-3.5 h-3.5 text-brand-gold" />
              <span>Verified Spare Parts & Lab Consumables Hub</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Refurbished &amp; Surplus Laboratory Spare Parts
            </h1>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
              Source certified refurbished boards, OEM lamps, HPLC/GC columns, seal kits, valves, detector boards, and
              surplus consumables for Waters, Agilent, Shimadzu, PerkinElmer, and Thermo Fisher.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                href="/requests/create?type=spare_part"
                className="inline-flex items-center space-x-2 bg-brand-gold text-brand-blue hover:bg-brand-gold-300 font-bold px-4 py-2.5 rounded-xl text-xs sm:text-sm transition-all shadow-md"
              >
                <FileQuestion className="w-4 h-4 text-brand-blue" />
                <span>Request a Spare Part</span>
              </Link>

              <Link
                href="/listings/create?type=spare_part"
                className="inline-flex items-center space-x-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 font-semibold px-4 py-2.5 rounded-xl text-xs sm:text-sm transition-all"
              >
                <PlusCircle className="w-4 h-4 text-brand-gold" />
                <span>List Surplus Parts</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Tab Switcher & Search Bar */}
        <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Tabs */}
            <div className="flex space-x-2 bg-slate-100 p-1.5 rounded-xl">
              <button
                type="button"
                onClick={() => {
                  setActiveTab("available");
                  setHasUserInteracted(true);
                }}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "available"
                    ? "bg-brand-blue text-white shadow-xs"
                    : "text-slate-600 hover:text-brand-blue"
                }`}
              >
                Available for Purchase ({listings.length})
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab("wanted");
                  setHasUserInteracted(true);
                }}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "wanted"
                    ? "bg-brand-blue text-white shadow-xs"
                    : "text-slate-600 hover:text-brand-blue"
                }`}
              >
                Parts Wanted by Labs ({requirements.length})
              </button>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2">
              <Link
                href={
                  activeTab === "available"
                    ? "/listings/create?type=spare_part"
                    : "/requests/create?type=spare_part"
                }
                className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-brand-gold text-brand-blue hover:bg-brand-gold-300 text-xs font-bold rounded-xl transition-all shadow-xs"
              >
                <PlusCircle className="w-3.5 h-3.5 text-brand-blue" />
                <span>
                  {activeTab === "available" ? "+ List a Spare Part" : "+ Post Part Request"}
                </span>
              </Link>
            </div>
          </div>

          {/* Search Form */}
          <form onSubmit={handleSearchSubmit} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                placeholder="Search refurbished part name, catalog #, instrument model (Agilent 1100, Waters 2695, lamp, column)..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-blue focus:bg-white"
              />
            </div>
            <button
              type="submit"
              className="px-5 py-2.5 bg-brand-blue hover:bg-brand-blue-500 text-white text-xs sm:text-sm font-semibold rounded-xl transition-colors cursor-pointer"
            >
              Search
            </button>
          </form>

          {/* Category Chips */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none text-xs">
            <span className="font-bold text-slate-400 uppercase tracking-wider flex-shrink-0">
              Filter:
            </span>
            {COMMON_PART_CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => {
                  setSelectedCategory(cat);
                  setHasUserInteracted(true);
                }}
                className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? "bg-brand-blue text-white shadow-xs"
                    : "bg-slate-100 hover:bg-brand-blue-50 hover:text-brand-blue text-slate-600"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Content Section */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-brand-blue border-t-transparent rounded-full animate-spin" />
          </div>
        ) : activeTab === "available" ? (
          // TAB 1: AVAILABLE SPARE PARTS LISTINGS
          <div>
            {listings.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
                <Wrench className="w-10 h-10 text-slate-400 mx-auto" />
                <h3 className="text-base font-bold text-slate-800">
                  No spare parts currently listed in this category
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Have surplus lamps, columns, valves, or boards in your laboratory inventory?
                  List them on LabMatrix and connect with laboratories looking for spares across India.
                </p>
                <div className="pt-2">
                  <Link
                    href="/listings/create?type=spare_part"
                    className="inline-flex items-center space-x-1.5 px-4 py-2 bg-brand-gold hover:bg-brand-gold-500 text-brand-blue-950 text-xs font-bold rounded-xl shadow-xs transition-colors"
                  >
                    <PlusCircle className="w-4 h-4 text-brand-blue-900" />
                    <span>List First Spare Part</span>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {listings.map((item, idx) => (
                  <Link
                    key={item.id}
                    href={`/listings/${item.id}`}
                    className="group bg-white rounded-2xl border border-slate-200 hover:border-brand-blue p-5 shadow-xs hover:shadow-lg transition-all flex flex-col justify-between space-y-4 cursor-pointer"
                  >
                    <div className="space-y-3">
                      {/* Photos Thumbnail if available */}
                      {item.photos && item.photos.length > 0 ? (
                        <div className="w-full h-44 rounded-xl overflow-hidden bg-slate-100 border border-slate-100 relative">
                          <img
                            src={getOptimizedImageUrl(item.photos[0], IMAGE_PRESETS.CARD)}
                            alt={item.title}
                            width={600}
                            height={350}
                            loading={idx < 3 ? "eager" : "lazy"}
                            fetchPriority={idx === 0 ? "high" : "auto"}
                            decoding="async"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          {item.status === "SOLD" && (
                            <div className="absolute inset-0 bg-slate-950/35 backdrop-blur-[1px] flex items-center justify-center">
                              <span className="bg-rose-600 text-white text-xs font-black uppercase tracking-widest px-3 py-1 rounded-md shadow-md border border-white/40 transform -rotate-3">
                                SOLD
                              </span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="w-full h-28 rounded-xl bg-brand-blue-50/50 border border-brand-blue-100 flex items-center justify-center text-brand-blue relative">
                          <Wrench className="w-8 h-8 opacity-60" />
                          {item.status === "SOLD" && (
                            <div className="absolute inset-0 bg-slate-950/35 rounded-xl flex items-center justify-center">
                              <span className="bg-rose-600 text-white text-xs font-black uppercase tracking-widest px-3 py-1 rounded-md shadow-md">
                                SOLD
                              </span>
                            </div>
                          )}
                        </div>
                      )}

                      <div className="flex flex-wrap items-center gap-1.5 text-xs">
                        <span className="font-bold text-brand-blue-700 bg-brand-blue-50 px-2 py-0.5 rounded text-[11px]">
                          {item.category}
                        </span>
                        {item.condition && (
                          <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px] font-semibold">
                            {item.condition}
                          </span>
                        )}
                        {item.quantity && item.quantity > 1 ? (
                          <span className="bg-amber-100 text-amber-800 border border-amber-200 px-2 py-0.5 rounded text-[10px] font-bold">
                            Qty: {item.quantity}
                          </span>
                        ) : null}
                      </div>

                      <h3 className="font-bold text-slate-900 group-hover:text-brand-blue text-sm line-clamp-2 transition-colors">
                        {item.title}
                      </h3>

                      {item.partNumber && (
                        <div className="text-[11px] text-slate-500 font-mono bg-slate-50 px-2 py-0.5 rounded inline-block">
                          PN: {item.partNumber}
                        </div>
                      )}

                      {item.compatibleWith && (
                        <p className="text-xs text-slate-500 line-clamp-1">
                          Compatible: {item.compatibleWith}
                        </p>
                      )}
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-900 text-sm">
                        ₹{item.minPrice.toLocaleString("en-IN")}
                        {item.maxPrice > item.minPrice && (
                          <span className="text-slate-500 font-normal text-xs ml-1">
                            - ₹{item.maxPrice.toLocaleString("en-IN")}
                          </span>
                        )}
                      </span>

                      {item.status === "SOLD" ? (
                        <span className="text-[11px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-lg">
                          Sold Out
                        </span>
                      ) : (
                        <span className="font-semibold text-brand-blue group-hover:underline flex items-center space-x-1">
                          <span>Inquire</span>
                          <ExternalLink className="w-3 h-3" />
                        </span>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        ) : (
          // TAB 2: WANTED SPARE PARTS REQUIREMENTS
          <div>
            {requirements.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
                <FileQuestion className="w-10 h-10 text-slate-400 mx-auto" />
                <h3 className="text-base font-bold text-slate-800">
                  No open spare part sourcing requests in this category
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Searching for an obsolete, out-of-production, or urgent replacement part?
                  Post a wanted requirement to notify testing labs and suppliers nationwide.
                </p>
                <div className="pt-2">
                  <Link
                    href="/requests/create?type=spare_part"
                    className="inline-flex items-center space-x-1.5 px-4 py-2 bg-brand-gold hover:bg-brand-gold-500 text-brand-blue-950 text-xs font-bold rounded-xl shadow-xs transition-colors"
                  >
                    <PlusCircle className="w-4 h-4 text-brand-blue-900" />
                    <span>Post Part Wanted</span>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {requirements.map((req) => (
                  <Link
                    key={req.id}
                    href={`/requests/${req.id}`}
                    className="bg-white rounded-2xl border border-slate-200 hover:border-brand-blue p-5 shadow-xs hover:shadow-lg transition-all flex flex-col justify-between space-y-4 cursor-pointer"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-brand-blue-700 bg-brand-blue-50 px-2 py-0.5 rounded text-[11px]">
                          {req.category}
                        </span>
                        <span className="bg-amber-100 text-amber-800 font-semibold px-2 py-0.5 rounded text-[10px]">
                          Wanted by Buyer
                        </span>
                      </div>

                      <h3 className="font-bold text-slate-900 text-sm line-clamp-2">
                        {req.title}
                      </h3>

                      {req.partNumber && (
                        <div className="text-[11px] text-slate-500 font-mono bg-slate-50 px-2 py-0.5 rounded inline-block">
                          PN: {req.partNumber}
                        </div>
                      )}

                      {req.compatibleWith && (
                        <p className="text-xs text-slate-500 line-clamp-1">
                          Compatible: {req.compatibleWith}
                        </p>
                      )}

                      <p className="text-xs text-slate-600 line-clamp-2">
                        {req.description}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-slate-400 text-[11px]">
                        Posted {new Date(req.createdAt).toLocaleDateString()}
                      </span>
                      <span className="font-bold text-brand-blue flex items-center space-x-1 group-hover:underline">
                        <span>Submit Offer</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
