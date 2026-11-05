"use client";

import React from "react";
import SaveListingButton from "@/components/listings/SaveListingButton";
import { formatPrice } from "@/lib/formatters";
import { Send } from "lucide-react";

export default function MobileListingActionBar({
  listingId,
  minPrice,
  maxPrice,
  isSold = false,
}: {
  listingId: string;
  minPrice: number;
  maxPrice: number;
  isSold?: boolean;
}) {
  const handleScrollToInquiry = () => {
    const el = document.getElementById("inquiry-form");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      const textarea = el.querySelector("textarea");
      if (textarea) {
        setTimeout(() => textarea.focus(), 400);
      }
    }
  };

  return (
    <aside
      aria-label="Action bar"
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-4 py-3 shadow-[0_-8px_20px_rgba(0,0,0,0.06)]"
    >
      <div className="max-w-md mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center space-x-2.5">
          <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center">
            <SaveListingButton listingId={listingId} />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block leading-none mb-0.5">
              {isSold ? "Last asking price" : "Expected price"}
            </span>
            <span className="text-sm font-black text-brand-blue block leading-none">
              {formatPrice(minPrice, maxPrice)}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleScrollToInquiry}
          className="flex-1 max-w-[200px] py-2.5 px-4 bg-brand-blue hover:bg-brand-blue-500 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center space-x-1.5"
        >
          <Send className="w-3.5 h-3.5 text-brand-gold" />
          <span>{isSold ? "Request Similar" : "Request quote"}</span>
        </button>
      </div>
    </aside>
  );
}
