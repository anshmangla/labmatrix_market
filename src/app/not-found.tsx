import Link from "next/link";
import { ArrowLeft, Search, PackageX } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Item or Page Not Found (404) | Labmatrix Marketplace",
  description:
    "The analytical instrument listing, procurement requirement, or page you requested could not be found or has been relocated.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function NotFound() {
  return (
    <div className="min-h-[65vh] flex items-center justify-center px-4 py-16 bg-slate-50">
      <div className="max-w-md w-full text-center bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
        <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
          <PackageX className="w-7 h-7" />
        </div>

        <span className="inline-block px-3 py-1 text-xs font-bold uppercase tracking-wider text-slate-500 bg-slate-100 rounded-full mb-3">
          Error 404
        </span>

        <h1 className="text-2xl font-bold text-slate-900 mb-2">Item or Page Not Found</h1>

        <p className="text-sm text-slate-600 mb-6 leading-relaxed">
          The equipment listing, sourcing requirement, or page you requested may have been sold, removed, or the link may be outdated.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/listings"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#033a7d] text-white text-sm font-semibold hover:bg-[#022959] transition-colors shadow-sm"
          >
            <Search className="w-4 h-4" />
            Browse Equipment
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-sm font-semibold hover:bg-slate-200 transition-colors border border-slate-200"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
