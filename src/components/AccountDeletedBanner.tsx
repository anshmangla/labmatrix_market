"use client";

import React, { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, X } from "lucide-react";

function BannerContent() {
  const searchParams = useSearchParams();
  const isDeleted = searchParams.get("account_deleted") === "true";
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isDeleted) {
      setVisible(true);
      // Clean up URL parameter cleanly without full reload
      const url = new URL(window.location.href);
      url.searchParams.delete("account_deleted");
      window.history.replaceState({}, "", url.pathname + (url.search || ""));
    }
  }, [isDeleted]);

  if (!visible) return null;

  return (
    <div className="bg-emerald-600 text-white px-4 py-3 shadow-md relative z-40 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-100" />
          <p className="text-xs sm:text-sm font-semibold">
            Your account has been deactivated and your personal credentials removed. Associated listings have been archived.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setVisible(false)}
          className="p-1 rounded-md text-emerald-100 hover:text-white hover:bg-emerald-700 transition-colors cursor-pointer"
          aria-label="Close notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export default function AccountDeletedBanner() {
  return (
    <Suspense fallback={null}>
      <BannerContent />
    </Suspense>
  );
}
