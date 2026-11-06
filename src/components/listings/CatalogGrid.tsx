"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
  Search,
  SlidersHorizontal,
  X,
  Tag,
  MapPin,
  Check,
  ChevronDown,
  ChevronUp,
  ArrowUpDown,
  PlusCircle,
  Clock,
  Heart,
  Boxes,
  FileText,
} from "lucide-react";
import { getOptimizedImageUrl, IMAGE_PRESETS } from "@/lib/images";
import { formatPrice } from "@/lib/formatters";
import SaveListingButton from "@/components/listings/SaveListingButton";
import { useSavedListings } from "@/hooks/useSavedListings";

export interface CatalogListing {
  id: string;
  title: string;
  description: string;
  category: string;
  itemType?: string;
  partNumber?: string | null;
  compatibleWith?: string | null;
  minPrice: number;
  maxPrice: number;
  condition: string;
  location: string;
  photos: string[];
  documents?: string[];
  quantity?: number;
  createdAt: string;
  status: string;
}

export const CATALOG_CATEGORIES = [
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

export const BUDGET_TIERS = [
  { id: "any", label: "Any budget", min: null, max: null },
  { id: "under-3l", label: "Under ₹3 L", min: 0, max: 300000 },
  { id: "3l-8l", label: "₹3–8 L", min: 300000, max: 800000 },
  { id: "8l-20l", label: "₹8–20 L", min: 800000, max: 2000000 },
  { id: "above-20l", label: "₹20 L+", min: 2000000, max: null },
];

export default function CatalogGrid({
  initialListings,
  itemType = "MACHINE",
  pageTitle,
  pageSubtitle,
}: {
  initialListings: CatalogListing[];
  itemType?: "ALL" | "MACHINE" | "NEW_INSTRUMENT" | "SPARE_PART";
  pageTitle: string;
  pageSubtitle?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { savedIds, isSaved } = useSavedListings();

  const urlCategory = searchParams.get("category");
  const urlQuery = searchParams.get("query") || "";
  const urlStatus = searchParams.get("status");
  const urlBudget = searchParams.get("budget") || "any";
  const urlSort = searchParams.get("sort") || "newest";

  // Filter States
  const [search, setSearch] = useState(urlQuery);
  const [selectedCategory, setSelectedCategory] = useState(
    urlCategory && CATALOG_CATEGORIES.includes(urlCategory) ? urlCategory : "ALL"
  );
  const [availableOnly, setAvailableOnly] = useState(
    urlStatus ? urlStatus === "AVAILABLE" : true
  );
  const [selectedBudget, setSelectedBudget] = useState(urlBudget);
  const [selectedSort, setSelectedSort] = useState(urlSort);
  const [showSavedOnly, setShowSavedOnly] = useState(false);

  // UI States
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Sync state if URL changes externally (e.g. Back/Forward)
  useEffect(() => {
    const cat = searchParams.get("category");
    setSelectedCategory(cat && CATALOG_CATEGORIES.includes(cat) ? cat : "ALL");

    const q = searchParams.get("query");
    setSearch(q || "");

    const st = searchParams.get("status");
    setAvailableOnly(st ? st === "AVAILABLE" : true);

    const b = searchParams.get("budget");
    setSelectedBudget(b || "any");

    const s = searchParams.get("sort");
    setSelectedSort(s || "newest");
  }, [searchParams]);

  // Update URL helper (preserves Back/Forward history and makes filtered pages shareable)
  const updateUrl = (overrides: {
    category?: string;
    query?: string;
    availableOnly?: boolean;
    budget?: string;
    sort?: string;
  }) => {
    const cat = overrides.category !== undefined ? overrides.category : selectedCategory;
    const q = overrides.query !== undefined ? overrides.query : search;
    const avail = overrides.availableOnly !== undefined ? overrides.availableOnly : availableOnly;
    const bud = overrides.budget !== undefined ? overrides.budget : selectedBudget;
    const srt = overrides.sort !== undefined ? overrides.sort : selectedSort;

    const params = new URLSearchParams();
    if (cat && cat !== "ALL") params.set("category", cat);
    if (q && q.trim()) params.set("query", q.trim());
    if (!avail) params.set("status", "ALL");
    if (bud && bud !== "any") params.set("budget", bud);
    if (srt && srt !== "newest") params.set("sort", srt);

    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat);
    updateUrl({ category: cat });
  };

  const handleAvailableToggle = () => {
    const next = !availableOnly;
    setAvailableOnly(next);
    updateUrl({ availableOnly: next });
  };

  const handleBudgetChange = (budgetId: string) => {
    setSelectedBudget(budgetId);
    updateUrl({ budget: budgetId });
  };

  const handleSortChange = (sortVal: string) => {
    setSelectedSort(sortVal);
    updateUrl({ sort: sortVal });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateUrl({ query: search });
  };

  const resetAllFilters = () => {
    setSearch("");
    setSelectedCategory("ALL");
    setAvailableOnly(true);
    setSelectedBudget("any");
    setSelectedSort("newest");
    setShowSavedOnly(false);
    router.replace(pathname, { scroll: false });
  };

  // Active filters count
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (selectedCategory !== "ALL") count++;
    if (!availableOnly) count++;
    if (selectedBudget !== "any") count++;
    if (search.trim()) count++;
    if (showSavedOnly) count++;
    return count;
  }, [selectedCategory, availableOnly, selectedBudget, search, showSavedOnly]);

  // Client-side filtering & sorting on the loaded inventory
  const filteredListings = useMemo(() => {
    let result = [...initialListings];

    // 1. Saved Items Filter
    if (showSavedOnly) {
      result = result.filter((item) => isSaved(item.id));
    }

    // 2. Availability Filter
    if (availableOnly) {
      result = result.filter((item) => item.status === "AVAILABLE");
    }

    // 3. Category Filter
    if (selectedCategory !== "ALL") {
      result = result.filter((item) => item.category === selectedCategory);
    }

    // 4. Budget Range Filter
    if (selectedBudget !== "any") {
      const tier = BUDGET_TIERS.find((t) => t.id === selectedBudget);
      if (tier) {
        if (tier.min !== null) {
          result = result.filter((item) => item.maxPrice >= tier.min!);
        }
        if (tier.max !== null) {
          result = result.filter((item) => item.minPrice <= tier.max!);
        }
      }
    }

    // 5. Query Search Filter
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(
        (item) =>
          item.title?.toLowerCase().includes(q) ||
          item.description?.toLowerCase().includes(q) ||
          item.partNumber?.toLowerCase().includes(q) ||
          item.compatibleWith?.toLowerCase().includes(q) ||
          item.category?.toLowerCase().includes(q) ||
          item.location?.toLowerCase().includes(q)
      );
    }

    // 6. Sorting
    if (selectedSort === "price_asc") {
      result.sort((a, b) => a.minPrice - b.minPrice);
    } else if (selectedSort === "price_desc") {
      result.sort((a, b) => b.maxPrice - a.maxPrice);
    } else {
      // Default: Newest
      result.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }

    return result;
  }, [
    initialListings,
    showSavedOnly,
    availableOnly,
    selectedCategory,
    selectedBudget,
    search,
    selectedSort,
    isSaved,
  ]);

  const displayedCategories = showAllCategories
    ? CATALOG_CATEGORIES
    : CATALOG_CATEGORIES.slice(0, 6);

  // Tabs for switching catalog views
  const isAllTab = pathname === "/listings" && itemType === "ALL";
  const isPreOwnedTab = pathname === "/listings" && itemType === "MACHINE";
  const isBrandNewTab = pathname === "/new-instruments";
  const isSparesTab = pathname === "/spare-parts";

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[1440px] mx-auto space-y-6">
        {/* Marketplace Sub-Navigation Tabs (Matching Mobile App Catalog Tabs) */}
        <div className="border-b border-slate-200 bg-white -mt-8 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 pt-4 mb-6 shadow-2xs">
          <div className="max-w-[1440px] mx-auto flex items-center justify-between">
            <nav className="flex space-x-1 sm:space-x-3 overflow-x-auto no-scrollbar text-sm font-semibold">
              <Link
                href="/listings"
                className={`pb-3.5 px-3 border-b-2 transition-colors whitespace-nowrap ${
                  isPreOwnedTab
                    ? "border-brand-blue text-brand-blue font-bold"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                Pre-Owned
              </Link>
              <Link
                href="/new-instruments"
                className={`pb-3.5 px-3 border-b-2 transition-colors whitespace-nowrap ${
                  isBrandNewTab
                    ? "border-brand-blue text-brand-blue font-bold"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                Brand New
              </Link>
              <Link
                href="/spare-parts"
                className={`pb-3.5 px-3 border-b-2 transition-colors whitespace-nowrap ${
                  isSparesTab
                    ? "border-brand-blue text-brand-blue font-bold"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                Spare Parts
              </Link>
            </nav>

            <Link
              href="/listings/create"
              className="hidden sm:inline-flex items-center space-x-1.5 px-3.5 py-1.5 bg-brand-gold hover:bg-brand-gold-500 text-brand-blue-950 font-bold text-xs rounded-xl shadow-xs transition-colors mb-2"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>+ List Equipment</span>
            </Link>
          </div>
        </div>

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {pageTitle}
            </h1>
            <p className="text-sm text-slate-500 mt-1 max-w-2xl">
              {pageSubtitle ||
                "Verified analytical instruments and genuine laboratory spare parts across India."}
            </p>
          </div>

          {/* Quick Stats or Direct Sourcing Action */}
          <div className="flex items-center space-x-3">
            <Link
              href="/requests"
              className="text-xs font-semibold text-brand-blue hover:underline whitespace-nowrap"
            >
              Looking for equipment? View buyer requests →
            </Link>
          </div>
        </div>

        {/* Main Grid: Sticky Sidebar + Listings Stream */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Desktop Left Sidebar (3 cols on lg, 2.5 on xl) */}
          <aside className="hidden lg:block lg:col-span-3 space-y-6 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs sticky top-24">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-1.5">
                <SlidersHorizontal className="w-3.5 h-3.5 text-brand-blue" />
                <span>Filters</span>
              </span>
              {activeFiltersCount > 0 && (
                <button
                  type="button"
                  onClick={resetAllFilters}
                  className="text-xs font-semibold text-brand-blue hover:underline"
                >
                  Clear all
                </button>
              )}
            </div>

            {/* Saved Items Quick Filter */}
            <div>
              <button
                type="button"
                onClick={() => setShowSavedOnly((prev) => !prev)}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-bold border transition-colors ${
                  showSavedOnly
                    ? "bg-rose-50 border-rose-200 text-rose-700"
                    : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                }`}
              >
                <span className="flex items-center space-x-2">
                  <Heart
                    className={`w-4 h-4 ${
                      showSavedOnly ? "fill-rose-500 text-rose-500" : "text-slate-400"
                    }`}
                  />
                  <span>Saved Items</span>
                </span>
                <span className="text-[11px] font-semibold bg-white px-2 py-0.5 rounded-md border border-slate-200">
                  {savedIds.length}
                </span>
              </button>
            </div>

            {/* Availability Filter */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <span className="text-xs font-bold text-slate-800 block">Availability</span>
              <label className="flex items-center space-x-2.5 text-xs font-medium text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={availableOnly}
                  onChange={handleAvailableToggle}
                  className="w-4 h-4 rounded text-brand-blue focus:ring-brand-blue"
                />
                <span>Available / In Stock only</span>
              </label>
            </div>

            {/* Categories Vertical Checklist */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <span className="text-xs font-bold text-slate-800 block">Category</span>
              <div className="space-y-1">
                <button
                  type="button"
                  onClick={() => handleCategoryChange("ALL")}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-colors flex items-center justify-between ${
                    selectedCategory === "ALL"
                      ? "bg-brand-blue-50 text-brand-blue font-bold"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <span>All Categories</span>
                  {selectedCategory === "ALL" && <Check className="w-3.5 h-3.5 text-brand-blue" />}
                </button>

                {displayedCategories.map((cat) => {
                  const isActive = selectedCategory === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => handleCategoryChange(cat)}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-colors flex items-center justify-between ${
                        isActive
                          ? "bg-brand-blue-50 text-brand-blue font-bold"
                          : "text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      <span className="truncate mr-2">{cat}</span>
                      {isActive && <Check className="w-3.5 h-3.5 text-brand-blue flex-shrink-0" />}
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={() => setShowAllCategories((prev) => !prev)}
                className="text-xs font-bold text-brand-blue hover:underline pt-1 flex items-center space-x-1"
              >
                <span>
                  {showAllCategories
                    ? "Show fewer"
                    : `+ ${CATALOG_CATEGORIES.length - 6} more`}
                </span>
                {showAllCategories ? (
                  <ChevronUp className="w-3 h-3" />
                ) : (
                  <ChevronDown className="w-3 h-3" />
                )}
              </button>
            </div>

            {/* Budget Range Filter */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <span className="text-xs font-bold text-slate-800 block">Budget Range</span>
              <div className="space-y-1.5">
                {BUDGET_TIERS.map((tier) => {
                  const isChecked = selectedBudget === tier.id;
                  return (
                    <label
                      key={tier.id}
                      className="flex items-center space-x-2.5 text-xs font-medium text-slate-700 cursor-pointer"
                    >
                      <input
                        type="radio"
                        name="budgetTierDesktop"
                        checked={isChecked}
                        onChange={() => handleBudgetChange(tier.id)}
                        className="w-3.5 h-3.5 text-brand-blue focus:ring-brand-blue"
                      />
                      <span>{tier.label}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          </aside>

          {/* Right Area: Controls & Listings Grid (9 cols on lg, 9.5 on xl) */}
          <main className="lg:col-span-9 space-y-4">
            {/* Search, Filter Trigger & Sort Bar */}
            <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
              {/* Search Form */}
              <form onSubmit={handleSearchSubmit} className="flex-1 min-w-[220px]">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search model, manufacturer, part no..."
                    className="w-full pl-9 pr-8 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-blue bg-slate-50/50"
                  />
                  {search && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearch("");
                        updateUrl({ query: "" });
                      }}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </form>

              {/* Mobile Filter Sheet Trigger */}
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(true)}
                className="lg:hidden inline-flex items-center space-x-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-bold text-slate-700 transition-colors"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-brand-blue" />
                <span>Filters</span>
                {activeFiltersCount > 0 && (
                  <span className="w-5 h-5 rounded-full bg-brand-blue text-white text-[10px] flex items-center justify-center font-bold">
                    {activeFiltersCount}
                  </span>
                )}
              </button>

              {/* Live Count & Sort Dropdown */}
              <div className="flex items-center space-x-3 w-full sm:w-auto justify-between sm:justify-end">
                <span className="text-xs text-slate-500 font-medium">
                  <strong className="text-slate-900 font-bold">{filteredListings.length}</strong>{" "}
                  instruments
                </span>

                <div className="flex items-center space-x-1.5 text-xs">
                  <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                  <select
                    value={selectedSort}
                    onChange={(e) => handleSortChange(e.target.value)}
                    className="bg-transparent font-bold text-slate-700 border-none focus:ring-0 text-xs py-1 cursor-pointer"
                  >
                    <option value="newest">Newest Listed</option>
                    <option value="price_asc">Price: Low to High</option>
                    <option value="price_desc">Price: High to Low</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Active Filter Chips */}
            {activeFiltersCount > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap text-xs pt-1">
                {selectedCategory !== "ALL" && (
                  <span className="inline-flex items-center space-x-1 px-2.5 py-1 bg-brand-blue-50 text-brand-blue font-bold rounded-lg border border-brand-blue-200">
                    <span>{selectedCategory}</span>
                    <button
                      type="button"
                      onClick={() => handleCategoryChange("ALL")}
                      className="hover:text-brand-blue-800"
                    >
                      <X className="w-3 h-3 ml-0.5" />
                    </button>
                  </span>
                )}
                {!availableOnly && (
                  <span className="inline-flex items-center space-x-1 px-2.5 py-1 bg-slate-100 text-slate-700 font-bold rounded-lg border border-slate-300">
                    <span>Showing All (incl. Sold)</span>
                    <button
                      type="button"
                      onClick={handleAvailableToggle}
                      className="hover:text-slate-900"
                    >
                      <X className="w-3 h-3 ml-0.5" />
                    </button>
                  </span>
                )}
                {selectedBudget !== "any" && (
                  <span className="inline-flex items-center space-x-1 px-2.5 py-1 bg-slate-100 text-slate-700 font-bold rounded-lg border border-slate-300">
                    <span>{BUDGET_TIERS.find((b) => b.id === selectedBudget)?.label}</span>
                    <button
                      type="button"
                      onClick={() => handleBudgetChange("any")}
                      className="hover:text-slate-900"
                    >
                      <X className="w-3 h-3 ml-0.5" />
                    </button>
                  </span>
                )}
                {showSavedOnly && (
                  <span className="inline-flex items-center space-x-1 px-2.5 py-1 bg-rose-50 text-rose-700 font-bold rounded-lg border border-rose-200">
                    <span>Saved Items Only</span>
                    <button
                      type="button"
                      onClick={() => setShowSavedOnly(false)}
                      className="hover:text-rose-900"
                    >
                      <X className="w-3 h-3 ml-0.5" />
                    </button>
                  </span>
                )}
                <button
                  type="button"
                  onClick={resetAllFilters}
                  className="text-xs text-brand-blue font-semibold hover:underline ml-1"
                >
                  Clear all
                </button>
              </div>
            )}

            {/* Listings Grid Feed */}
            {filteredListings.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-xs space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                  <Search className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900">No equipment found</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  No listings matched your active filter criteria. Try adjusting your search term or
                  resetting filters.
                </p>
                <div className="pt-2 flex justify-center gap-3">
                  <button
                    type="button"
                    onClick={resetAllFilters}
                    className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    Reset Filters
                  </button>
                  <Link
                    href="/requests/create"
                    className="px-4 py-2 bg-brand-gold hover:bg-brand-gold-500 text-brand-blue-950 rounded-xl text-xs font-bold shadow-xs transition-colors"
                  >
                    + Post Requirement
                  </Link>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
                {filteredListings.map((item, idx) => (
                  <Link
                    key={item.id}
                    href={`/listings/${item.id}`}
                    className="group bg-white rounded-2xl border border-slate-200 hover:border-brand-blue shadow-2xs hover:shadow-md transition-all flex flex-row sm:flex-col overflow-hidden p-2.5 sm:p-0 gap-3 sm:gap-0"
                  >
                    {/* Thumbnail Image Container */}
                    <div className="relative w-24 h-24 sm:w-full sm:h-auto sm:aspect-[4/3] flex-shrink-0 rounded-xl sm:rounded-none bg-slate-100 overflow-hidden">
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
                            item.status === "SOLD"
                              ? "grayscale-[40%] contrast-[0.95] opacity-90"
                              : ""
                          }`}
                        />
                      ) : item.documents && item.documents.length > 0 ? (
                        <div className="w-full h-full flex flex-col items-center justify-center p-2 sm:p-4 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 text-white text-center relative">
                          <div className="w-7 h-7 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center mb-1 sm:mb-2 shadow-xs group-hover:scale-105 transition-transform">
                            <FileText className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
                          </div>
                          <span className="text-[8.5px] sm:text-[10px] font-bold text-rose-400 uppercase tracking-wider bg-rose-950/80 px-1.5 py-0.5 rounded-full border border-rose-800/60 mb-0.5 sm:mb-1">
                            PDF
                          </span>
                          <span className="hidden sm:inline text-xs font-semibold text-slate-200 line-clamp-1 px-2">
                            {decodeURIComponent(item.documents[0].split("/").pop()?.split("?")[0] || "Datasheet.pdf")}
                          </span>
                        </div>
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 bg-slate-100">
                          <Tag className="w-5 h-5 sm:w-8 sm:h-8 mb-0.5 sm:mb-1" />
                          <span className="text-[9px] sm:text-[11px]">No photos</span>
                        </div>
                      )}

                      {/* Desktop Top Right Save Heart Button */}
                      <div className="hidden sm:flex absolute top-2.5 right-2.5 z-10 w-8 h-8 rounded-full bg-white/90 backdrop-blur-xs shadow-xs items-center justify-center hover:bg-white transition-colors">
                        <SaveListingButton listingId={item.id} />
                      </div>

                      {/* Badges Overlay */}
                      <div className="absolute bottom-1.5 left-1.5 sm:bottom-2.5 sm:left-2.5 flex flex-wrap gap-1 z-10">
                        {item.status === "SOLD" && (
                          <span className="bg-slate-900/90 text-white text-[9px] sm:text-[10px] font-black uppercase px-1.5 py-0.5 sm:px-2 sm:py-0.5 rounded shadow-xs">
                            Sold Out
                          </span>
                        )}
                        {item.quantity && item.quantity > 1 && (
                          <span className="bg-slate-900/80 text-white text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 sm:px-2 sm:py-0.5 rounded shadow-xs">
                            Qty {item.quantity}
                          </span>
                        )}
                        {item.documents && item.documents.length > 0 && (
                          <span className="hidden sm:flex bg-rose-900/90 text-rose-200 text-[10px] font-bold px-2 py-0.5 rounded shadow-xs items-center space-x-1 border border-rose-700/50">
                            <FileText className="w-3 h-3 text-rose-300" />
                            <span>PDF{item.documents.length > 1 ? ` (${item.documents.length})` : ""}</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="p-0 sm:p-4 flex-1 min-w-0 flex flex-col justify-between py-0.5 sm:py-4 sm:space-y-3">
                      <div>
                        {/* Category & Location */}
                        <div className="flex items-center gap-1.5 sm:justify-between text-[11px] text-slate-500 mb-1">
                          <span className="font-bold text-brand-blue truncate bg-blue-50 sm:bg-transparent px-1.5 py-0.5 sm:px-0 sm:py-0 rounded text-[10px] sm:text-[11px]">
                            {item.condition || item.category}
                          </span>

                          {item.documents && item.documents.length > 0 && (
                            <span className="sm:hidden bg-rose-50 border border-rose-200 text-rose-600 text-[9.5px] font-extrabold px-1.5 py-0.5 rounded flex items-center gap-1 flex-shrink-0">
                              <FileText className="w-2.5 h-2.5 text-rose-500" />
                              <span>PDF</span>
                            </span>
                          )}

                          <span className="hidden sm:flex truncate items-center">
                            <MapPin className="w-3 h-3 mr-0.5 text-slate-400" />
                            {item.location || "India"}
                          </span>
                        </div>

                        {/* Title */}
                        <h3 className="font-bold text-slate-900 group-hover:text-brand-blue text-xs sm:text-sm leading-snug line-clamp-2 transition-colors">
                          {item.title}
                        </h3>

                        {/* Mobile-only Location & Part Number Row */}
                        <div className="flex sm:hidden items-center text-[10.5px] text-slate-500 mt-1 truncate">
                          <MapPin className="w-2.5 h-2.5 mr-1 text-slate-400 flex-shrink-0" />
                          <span className="truncate">{item.location || item.category || "India"}</span>
                          {item.itemType === "SPARE_PART" && item.partNumber && (
                            <span className="ml-1.5 font-mono text-[9px] font-bold bg-slate-100 text-slate-700 px-1 py-0.2 rounded flex-shrink-0">
                              PN: {item.partNumber}
                            </span>
                          )}
                        </div>

                        {/* Desktop Spare Part Part Number Badge */}
                        {item.itemType === "SPARE_PART" && item.partNumber && (
                          <span className="hidden sm:inline-block mt-1 font-mono text-[10px] font-bold bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded">
                            PN: {item.partNumber}
                          </span>
                        )}
                      </div>

                      {/* Card Footer: Formatted Price */}
                      <div className="pt-1.5 sm:pt-2.5 sm:border-t sm:border-slate-100 flex items-center justify-between mt-auto">
                        <div className="flex items-baseline">
                          <span className="text-sm sm:text-base font-black text-brand-blue">
                            {formatPrice(item.minPrice, item.maxPrice)}
                          </span>
                          <span className="text-[10px] sm:text-[11px] text-slate-400 ml-1">
                            {item.status === "SOLD" ? "sold" : "expected"}
                          </span>
                        </div>

                        {/* Mobile Heart Save Button */}
                        <div className="sm:hidden flex items-center justify-center p-0.5">
                          <SaveListingButton listingId={item.id} />
                        </div>

                        <span className="hidden sm:inline text-[11px] font-semibold text-brand-blue group-hover:underline">
                          View details →
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Mobile Filters Slide-Over Drawer Modal */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileFiltersOpen(false)}
          />

          {/* Drawer Container */}
          <div className="relative ml-auto w-full max-w-xs bg-white h-full shadow-2xl p-6 flex flex-col justify-between overflow-y-auto">
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="text-sm font-bold text-slate-900 flex items-center space-x-1.5">
                  <SlidersHorizontal className="w-4 h-4 text-brand-blue" />
                  <span>Filter Catalog</span>
                </span>
                <button
                  type="button"
                  onClick={() => setMobileFiltersOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Saved Items */}
              <button
                type="button"
                onClick={() => setShowSavedOnly((prev) => !prev)}
                className={`w-full flex items-center justify-between p-3 rounded-xl text-xs font-bold border transition-colors ${
                  showSavedOnly
                    ? "bg-rose-50 border-rose-200 text-rose-700"
                    : "bg-slate-50 border-slate-200 text-slate-700"
                }`}
              >
                <span className="flex items-center space-x-2">
                  <Heart
                    className={`w-4 h-4 ${
                      showSavedOnly ? "fill-rose-500 text-rose-500" : "text-slate-400"
                    }`}
                  />
                  <span>Saved Items</span>
                </span>
                <span className="text-[11px] bg-white px-2 py-0.5 rounded-md border border-slate-200 font-semibold">
                  {savedIds.length}
                </span>
              </button>

              {/* Availability */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-900 block">Availability</span>
                <label className="flex items-center space-x-2.5 text-xs font-medium text-slate-700">
                  <input
                    type="checkbox"
                    checked={availableOnly}
                    onChange={handleAvailableToggle}
                    className="w-4 h-4 rounded text-brand-blue"
                  />
                  <span>Available / In Stock only</span>
                </label>
              </div>

              {/* Category */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-900 block">Category</span>
                <select
                  value={selectedCategory}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  className="w-full text-xs font-medium p-2.5 rounded-xl border border-slate-200 bg-white"
                >
                  <option value="ALL">All Categories</option>
                  {CATALOG_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Budget */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-900 block">Budget Range</span>
                <div className="space-y-2">
                  {BUDGET_TIERS.map((tier) => (
                    <label
                      key={tier.id}
                      className="flex items-center space-x-2.5 text-xs font-medium text-slate-700"
                    >
                      <input
                        type="radio"
                        name="budgetTierMobile"
                        checked={selectedBudget === tier.id}
                        onChange={() => handleBudgetChange(tier.id)}
                        className="w-3.5 h-3.5 text-brand-blue"
                      />
                      <span>{tier.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-6 border-t border-slate-100 flex gap-2">
              <button
                type="button"
                onClick={resetAllFilters}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(false)}
                className="flex-1 py-2.5 rounded-xl bg-brand-blue text-white text-xs font-bold shadow-xs"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
