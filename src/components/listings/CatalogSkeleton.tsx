import React from "react";

export default function CatalogSkeleton({
  title = "Loading Catalog...",
  subtitle = "Fetching verified laboratory equipment...",
}: {
  title?: string;
  subtitle?: string;
}) {
  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Skeleton */}
        <div className="mb-8">
          <div className="h-6 w-40 bg-slate-200/80 rounded-full animate-pulse mb-3" />
          <h1 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
            <span>{title}</span>
            <div className="w-5 h-5 border-2 border-brand-blue border-t-transparent rounded-full animate-spin" />
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">{subtitle}</p>
        </div>

        {/* Search & Filter Bar Skeleton */}
        <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200/80 mb-6">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 h-11 bg-slate-100 rounded-xl animate-pulse" />
            <div className="w-full md:w-48 h-11 bg-slate-100 rounded-xl animate-pulse" />
          </div>

          {/* Category Pills Skeleton */}
          <div className="flex items-center gap-2 mt-4 overflow-x-auto pb-1 scrollbar-none">
            {[60, 90, 80, 110, 70, 95, 85].map((w, idx) => (
              <div
                key={idx}
                className="h-8 rounded-full bg-slate-100 animate-pulse flex-shrink-0"
                style={{ width: `${w}px` }}
              />
            ))}
          </div>
        </div>

        {/* Grid of Card Skeletons */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs flex flex-col"
            >
              {/* Image Skeleton */}
              <div className="w-full aspect-[16/10] bg-slate-100 animate-pulse relative">
                <div className="absolute top-3 left-3 h-5 w-20 bg-slate-200/70 rounded-full" />
                <div className="absolute top-3 right-3 h-5 w-16 bg-slate-200/70 rounded-full" />
              </div>

              {/* Body Skeleton */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="h-5 bg-slate-100 rounded-md animate-pulse mb-2 w-4/5" />
                  <div className="h-4 bg-slate-100 rounded-md animate-pulse mb-3 w-3/5" />
                  <div className="h-3 bg-slate-100 rounded-md animate-pulse mb-2 w-full" />
                  <div className="h-3 bg-slate-100 rounded-md animate-pulse mb-4 w-2/3" />
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <div className="h-3 w-16 bg-slate-100 rounded animate-pulse mb-1.5" />
                    <div className="h-5 w-24 bg-slate-200 rounded animate-pulse" />
                  </div>
                  <div className="h-9 w-24 bg-slate-100 rounded-xl animate-pulse" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
