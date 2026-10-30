"use client";

import React from "react";

/** "Load more" control shown under a catalog grid while further pages exist. */
export default function LoadMoreButton({
  hasMore,
  loading,
  onClick,
}: {
  hasMore: boolean;
  loading: boolean;
  onClick: () => void;
}) {
  if (!hasMore) return null;

  return (
    <div className="mt-8 flex justify-center">
      <button
        type="button"
        onClick={onClick}
        disabled={loading}
        className="inline-flex items-center space-x-2 px-6 py-2.5 border border-slate-300 bg-white hover:bg-slate-50 rounded-xl text-sm font-semibold text-slate-700 shadow-xs transition-colors disabled:opacity-60"
      >
        {loading && (
          <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-brand-blue" />
        )}
        <span>{loading ? "Loading..." : "Load more"}</span>
      </button>
    </div>
  );
}
