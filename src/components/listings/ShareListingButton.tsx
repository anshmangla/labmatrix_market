"use client";

import React, { useState } from "react";
import { Share2, Check } from "lucide-react";

export default function ShareListingButton({
  title,
  className = "",
}: {
  title: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share({
          title,
          text: `Check out this ${title} on Labmatrix`,
          url: window.location.href,
        });
        return;
      }
    } catch {
      // fallback to clipboard
    }

    try {
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      // ignore
    }
  };

  return (
    <button
      type="button"
      onClick={handleShare}
      title={copied ? "Link copied!" : "Share listing"}
      aria-label="Share listing"
      className={`inline-flex items-center justify-center p-2 rounded-xl text-slate-400 hover:text-brand-blue hover:bg-slate-100 transition-colors ${className}`}
    >
      {copied ? (
        <Check className="w-5 h-5 text-emerald-600" />
      ) : (
        <Share2 className="w-5 h-5" />
      )}
    </button>
  );
}
