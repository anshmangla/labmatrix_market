"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  FileQuestion,
  Search,
  Filter,
  PlusCircle,
  ShieldCheck,
  Clock,
  ArrowRight,
  Send,
  Building,
  Wrench,
} from "lucide-react";
import LoadMoreButton from "@/components/listings/LoadMoreButton";

interface Requirement {
  id: string;
  title: string;
  description: string;
  category: string;
  itemType?: string;
  partNumber?: string | null;
  compatibleWith?: string | null;
  status: string;
  createdAt: string;
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
  "Spare Parts & Consumables",
  "Other Lab Equipment",
];


const PAGE_SIZE = 30;

/** Appends items that aren't already in the list (pages can shift while new items are posted). */
function appendUnique<T extends { id: string }>(prev: T[], next: T[]): T[] {
  const seen = new Set(prev.map((item) => item.id));
  return [...prev, ...next.filter((item) => !seen.has(item.id))];
}

function RequestsContent() {
  const searchParams = useSearchParams();
  const urlCategory = searchParams.get("category");
  const urlQuery = searchParams.get("query");
  const urlType = searchParams.get("type");

  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(urlQuery || "");
  const [selectedCategory, setSelectedCategory] = useState(
    urlCategory && CATEGORIES.includes(urlCategory) ? urlCategory : "ALL"
  );
  const [selectedItemType, setSelectedItemType] = useState<"ALL" | "MACHINE" | "SPARE_PART">(
    urlType === "SPARE_PART" || urlType === "MACHINE" ? urlType : "ALL"
  );

  // Sync state if searchParams change in the URL
  useEffect(() => {
    const cat = searchParams.get("category");
    if (cat && CATEGORIES.includes(cat)) {
      setSelectedCategory(cat);
    } else if (!cat) {
      setSelectedCategory("ALL");
    }

    const t = searchParams.get("type");
    if (t === "SPARE_PART" || t === "MACHINE") {
      setSelectedItemType(t);
    } else if (!t) {
      setSelectedItemType("ALL");
    }

    const q = searchParams.get("query");
    if (q !== null) {
      setSearch(q);
    }
  }, [searchParams]);

  useEffect(() => {
    fetchRequirements();
  }, [selectedCategory, selectedItemType]);

  const buildRequirementsUrl = () => {
    let url = `/api/requirements?limit=${PAGE_SIZE}&`;
    if (selectedItemType !== "ALL") {
      url += `itemType=${encodeURIComponent(selectedItemType)}&`;
    }
    if (selectedCategory !== "ALL") {
      url += `category=${encodeURIComponent(selectedCategory)}&`;
    }
    if (search.trim()) {
      url += `query=${encodeURIComponent(search.trim())}&`;
    }
    return url;
  };

  const fetchRequirements = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${buildRequirementsUrl()}page=1`);
      const data = await res.json();
      if (data?.requirements) {
        setRequirements(data.requirements);
        setPage(1);
        setHasMore(1 < (data.pagination?.totalPages ?? 1));
      }
    } catch (err) {
      console.error("Fetch requirements error:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadMoreRequirements = async () => {
    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      const res = await fetch(`${buildRequirementsUrl()}page=${nextPage}`);
      const data = await res.json();
      if (data?.requirements) {
        setRequirements((prev) => appendUnique(prev, data.requirements));
        setPage(nextPage);
        setHasMore(nextPage < (data.pagination?.totalPages ?? nextPage));
      }
    } catch (err) {
      console.error("Load more error:", err);
    } finally {
      setLoadingMore(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchRequirements();
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center space-x-1.5 text-xs font-bold text-brand-blue-700 bg-brand-blue-50 border border-brand-blue-100/50 px-2.5 py-1 rounded-full mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Active Laboratory Procurement Requests</span>
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900">
              Buyer Equipment Requirements
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Laboratories actively looking for analytical instruments and replacement spare parts. Have a
              matching unit? Submit your quotation proposal directly.
            </p>
          </div>

          <Link
            href="/requests/create"
            className="inline-flex items-center space-x-2 px-5 py-3 rounded-xl bg-brand-gold hover:bg-brand-gold-500 text-brand-blue-950 font-bold text-sm shadow-sm transition-all self-start md:self-auto"
          >
            <PlusCircle className="w-4 h-4 text-brand-blue-900" />
            <span>Post Equipment Wanted</span>
          </Link>
        </div>

        {/* Search & Filter */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-xs border border-slate-200 mb-8 space-y-4">
          <form onSubmit={handleSearchSubmit} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                placeholder="Search desired instruments or parts (HPLC, GC-MS, Amplifier Board, FTIR)..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue focus:bg-white"
              />
            </div>
            <button
              type="submit"
              className="px-5 py-2.5 bg-brand-blue hover:bg-brand-blue-500 text-white text-sm font-semibold rounded-xl transition-colors shadow-xs"
            >
              Search
            </button>
          </form>

          {/* Sourcing Type Segmented Filter */}
          <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 pb-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider pr-1">
              Filter by:
            </span>
            <button
              type="button"
              onClick={() => setSelectedItemType("ALL")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedItemType === "ALL"
                  ? "bg-brand-blue text-white shadow-xs"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-700"
              }`}
            >
              All Requests
            </button>
            <button
              type="button"
              onClick={() => setSelectedItemType("MACHINE")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedItemType === "MACHINE"
                  ? "bg-brand-blue text-white shadow-xs"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-700"
              }`}
            >
              Instruments & Systems
            </button>
            <button
              type="button"
              onClick={() => setSelectedItemType("SPARE_PART")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
                selectedItemType === "SPARE_PART"
                  ? "bg-brand-blue text-white shadow-xs"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-700"
              }`}
            >
              <Wrench className="w-3.5 h-3.5" />
              <span>Spare Parts & Consumables</span>
            </button>
          </div>

          {/* Category Chips */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center pr-2">
              <Filter className="w-3.5 h-3.5 mr-1" /> Category:
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
        </div>

        {/* Feed */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border border-slate-200 p-6 space-y-3 animate-pulse"
              >
                <div className="h-4 bg-slate-200 rounded w-1/4" />
                <div className="h-5 bg-slate-200 rounded w-3/4" />
                <div className="h-12 bg-slate-100 rounded w-full" />
              </div>
            ))}
          </div>
        ) : requirements.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-lg mx-auto my-12">
            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400 mb-4">
              <FileQuestion className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">
              No equipment requirements found
            </h3>
            <p className="text-sm text-slate-500 mt-1">
              Be the first to post a machine or spare part requirement on the marketplace.
            </p>
            <Link
              href="/requests/create"
              className="mt-6 inline-flex items-center space-x-2 px-4 py-2 bg-brand-gold hover:bg-brand-gold-500 text-brand-blue-950 rounded-xl text-xs font-bold shadow-xs transition-colors"
            >
              <PlusCircle className="w-4 h-4 text-brand-blue-900" />
              <span>Post First Requirement</span>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {requirements.map((req) => (
              <div
                key={req.id}
                className="bg-white rounded-2xl border border-slate-200 hover:border-brand-blue-300 p-6 shadow-xs hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                <div className="space-y-2.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="bg-brand-blue-50 text-brand-blue-700 border border-brand-blue-100/60 text-xs font-bold px-2.5 py-0.5 rounded-md">
                      {req.category}
                    </span>
                    {req.itemType === "SPARE_PART" ? (
                      <span className="bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold px-2 py-0.5 rounded-md flex items-center space-x-1">
                        <Wrench className="w-3 h-3 text-amber-700" />
                        <span>Spare Part</span>
                      </span>
                    ) : (
                      <span className="bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold px-2 py-0.5 rounded-md">
                        Instrument
                      </span>
                    )}
                    <span className="text-slate-400 text-xs">•</span>
                    <span className="text-slate-500 text-xs flex items-center">
                      <Clock className="w-3.5 h-3.5 mr-1" />
                      Posted on {new Date(req.createdAt).toLocaleDateString()}
                    </span>
                    <span className="text-slate-400 text-xs">•</span>
                    <span className="bg-slate-100 text-slate-700 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded flex items-center space-x-1">
                      <ShieldCheck className="w-3 h-3 text-brand-blue" />
                      <span>Admin Protected Buyer</span>
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900">
                    {req.title}
                  </h3>

                  {(req.partNumber || req.compatibleWith) && (
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      {req.partNumber && (
                        <span className="font-mono bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200 text-[11px]">
                          Part #: {req.partNumber}
                        </span>
                      )}
                      {req.compatibleWith && (
                        <span className="text-slate-600">
                          Fits: <strong className="text-slate-800">{req.compatibleWith}</strong>
                        </span>
                      )}
                    </div>
                  )}

                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                    {req.description}
                  </p>
                </div>

                <div className="flex-shrink-0 flex items-center">
                  <Link
                    href={`/requests/${req.id}`}
                    className="inline-flex items-center space-x-1.5 px-4 py-2.5 bg-brand-blue hover:bg-brand-blue-500 text-white rounded-xl text-xs font-bold transition-colors shadow-xs"
                  >
                    <span>View & Fulfill Request</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && requirements.length > 0 && (
          <LoadMoreButton hasMore={hasMore} loading={loadingMore} onClick={loadMoreRequirements} />
        )}
      </div>
    </div>
  );
}

export default function BrowseRequestsPage() {
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
      <RequestsContent />
    </Suspense>
  );
}
