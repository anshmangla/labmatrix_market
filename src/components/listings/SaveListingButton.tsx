"use client";

import React from "react";
import { Heart } from "lucide-react";
import { useSavedListings } from "@/hooks/useSavedListings";

export default function SaveListingButton({
  listingId,
  className = "",
  showText = false,
}: {
  listingId: string;
  className?: string;
  showText?: boolean;
}) {
  const { isSaved, toggleSave, isLoaded } = useSavedListings();
  const saved = isLoaded ? isSaved(listingId) : false;

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleSave(listingId);
      }}
      title={saved ? "Remove from saved" : "Save listing"}
      aria-label={saved ? "Remove from saved" : "Save listing"}
      className={`inline-flex items-center justify-center transition-transform active:scale-90 ${className}`}
    >
      <Heart
        className={`w-5 h-5 transition-colors ${
          saved
            ? "fill-rose-500 text-rose-500"
            : "text-slate-400 hover:text-rose-500"
        }`}
      />
      {showText && (
        <span
          className={`ml-1.5 text-xs font-semibold ${
            saved ? "text-rose-600" : "text-slate-600"
          }`}
        >
          {saved ? "Saved" : "Save"}
        </span>
      )}
    </button>
  );
}
