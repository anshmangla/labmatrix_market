"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
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

interface Listing {
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
  createdAt: string;
}

interface Requirement {
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
  "Spare Parts & Consumables",
  "Other Lab Equipment",
];

export default function SparePartsHubPage() {
  const [activeTab, setActiveTab] = useState<"available" | "wanted">("available");
  const [listings, setListings] = useState<Listing[]>([]);
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");

  useEffect(() => {
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
    loadData();
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Top Hero Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-teal-950 rounded-3xl p-8 sm:p-10 text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center space-x-2 bg-teal-500/20 border border-teal-500/30 px-3 py-1 rounded-full text-xs font-semibold text-teal-300">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Confidential Broker Desk • Verified Spares & Consumables</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Laboratory Spare Parts & Consumables
            </h1>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
              Source OEM lamps, HPLC/GC columns, seal kits, valves, detector boards, and
              surplus consumables for Waters, Agilent, Shimadzu, Thermo Fisher, and more.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                href="/requests/create?type=spare_part"
                className="inline-flex items-center space-x-2 bg-teal-600 hover:bg-teal-500 text-white font-bold px-4 py-2.5 rounded-xl text-xs sm:text-sm transition-all shadow-md"
              >
                <FileQuestion className="w-4 h-4" />
                <span>Request a Spare Part</span>
              </Link>

              <Link
                href="/listings/create?type=spare_part"
                className="inline-flex items-center space-x-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 font-semibold px-4 py-2.5 rounded-xl text-xs sm:text-sm transition-all"
              >
                <PlusCircle className="w-4 h-4 text-teal-400" />
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
                onClick={() => setActiveTab("available")}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "available"
                    ? "bg-white text-teal-700 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Available for Purchase ({listings.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("wanted")}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "wanted"
                    ? "bg-white text-teal-700 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
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
                className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl transition-colors shadow-xs"
              >
                <PlusCircle className="w-3.5 h-3.5" />
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
                placeholder="Search part name, catalog #, instrument model (Agilent 1100, Waters 2695, lamp, column)..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white"
              />
            </div>
            <button
              type="submit"
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-semibold rounded-xl transition-colors cursor-pointer"
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
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? "bg-teal-600 text-white shadow-xs"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-600"
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
            <div className="w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin" />
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
                  List them confidentially and connect with laboratories looking for spares.
                </p>
                <div className="pt-2">
                  <Link
                    href="/listings/create?type=spare_part"
                    className="inline-flex items-center space-x-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>List First Spare Part</span>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {listings.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-3">
                      {/* Photos Thumbnail if available */}
                      {item.photos && item.photos.length > 0 ? (
                        <div className="w-full h-44 rounded-xl overflow-hidden bg-slate-100 border border-slate-100">
                          <img
                            src={item.photos[0]}
                            alt={item.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-full h-28 rounded-xl bg-teal-50/50 border border-teal-100 flex items-center justify-center text-teal-600">
                          <Wrench className="w-8 h-8 opacity-60" />
                        </div>
                      )}

                      <div className="flex flex-wrap items-center gap-1.5 text-xs">
                        <span className="font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded text-[11px]">
                          {item.category}
                        </span>
                        {item.condition && (
                          <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px] font-semibold">
                            {item.condition}
                          </span>
                        )}
                      </div>

                      <div>
                        <h3 className="font-bold text-slate-900 text-sm sm:text-base leading-snug line-clamp-2">
                          {item.title}
                        </h3>
                        {item.compatibleWith && (
                          <p className="text-xs text-teal-800 font-semibold mt-1">
                            Fits: {item.compatibleWith}
                          </p>
                        )}
                        {item.partNumber && (
                          <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                            Part #: {item.partNumber}
                          </p>
                        )}
                        <p className="text-xs text-slate-500 mt-1.5 line-clamp-2">
                          {item.description}
                        </p>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-slate-400 block font-semibold">
                          Expected Price:
                        </span>
                        <span className="text-sm font-black text-slate-900">
                          ₹{item.minPrice.toLocaleString("en-IN")} - ₹
                          {item.maxPrice.toLocaleString("en-IN")}
                        </span>
                      </div>

                      <Link
                        href={`/listings/${item.id}`}
                        className="inline-flex items-center space-x-1 text-xs font-bold text-teal-600 hover:text-teal-700 hover:underline"
                      >
                        <span>View Details</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          // TAB 2: SPARE PARTS WANTED BY LABS (BUYER REQUESTS)
          <div>
            {requirements.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
                <FileQuestion className="w-10 h-10 text-slate-400 mx-auto" />
                <h3 className="text-base font-bold text-slate-800">
                  No spare part requests posted yet
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Looking for an urgent replacement lamp, detector, or board? Post your
                  spare part requirement and let our broker network source it for you.
                </p>
                <div className="pt-2">
                  <Link
                    href="/requests/create?type=spare_part"
                    className="inline-flex items-center space-x-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl"
                  >
                    <FileQuestion className="w-4 h-4" />
                    <span>Post First Part Request</span>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {requirements.map((req) => (
                  <div
                    key={req.id}
                    className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs hover:border-slate-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <span className="font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded text-[11px]">
                          {req.category}
                        </span>
                        <span className="text-slate-400">•</span>
                        <span className="text-slate-500 text-xs">
                          Posted on {new Date(req.createdAt).toLocaleDateString()}
                        </span>
                        <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-bold text-[10px]">
                          {req.status}
                        </span>
                      </div>

                      <h3 className="font-bold text-slate-900 text-base">
                        {req.title}
                      </h3>

                      {req.compatibleWith && (
                        <p className="text-xs text-teal-800 font-semibold">
                          Target Instrument: {req.compatibleWith}
                        </p>
                      )}

                      <p className="text-xs text-slate-600 line-clamp-2 max-w-2xl">
                        {req.description}
                      </p>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 flex-shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                      <Link
                        href={`/requests/${req.id}`}
                        className="inline-flex items-center space-x-1 px-3.5 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl transition-colors shadow-xs"
                      >
                        <span>Supply This Part</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
