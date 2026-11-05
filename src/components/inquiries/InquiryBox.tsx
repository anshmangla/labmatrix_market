"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  ShieldCheck,
  Send,
  CheckCircle2,
  AlertCircle,
  Lock,
  Phone,
} from "lucide-react";
import { errorMessage } from "@/lib/errors";

export default function InquiryBox({
  listingId,
  requirementId,
  itemTitle,
  isOfferToRequirement = false,
  isSold = false,
}: {
  listingId?: string;
  requirementId?: string;
  itemTitle: string;
  isOfferToRequirement?: boolean;
  isSold?: boolean;
}) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const draftKey = `labmatrix_draft_inquiry_${listingId || requirementId || "generic"}`;

  const defaultMessage = isOfferToRequirement
    ? `Hello, I have an available ${itemTitle} matching this requirement. Please get in touch with me to discuss specs and inspection.`
    : isSold
    ? `Hello, I saw that this ${itemTitle} was recently sold. I am looking for a similar or equivalent unit. Please let me know what options or incoming inventory are available.`
    : `Hello, I am interested in acquiring this ${itemTitle}. Please let me know the availability and inspection schedule.`;

  const [message, setMessage] = useState(defaultMessage);
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  // Restore drafted message & phone if previously typed before sign-in
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(draftKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.message) setMessage(parsed.message);
        if (parsed.phone) setPhone(parsed.phone);
      }
    } catch {
      // sessionStorage unavailable or restricted
    }
  }, [draftKey]);

  // Persist draft on edit
  useEffect(() => {
    try {
      if (message !== defaultMessage || phone) {
        sessionStorage.setItem(draftKey, JSON.stringify({ message, phone }));
      }
    } catch {
      // sessionStorage unavailable
    }
  }, [message, phone, draftKey, defaultMessage]);

  const handleInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user) return;

    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listingId: listingId || null,
          requirementId: requirementId || null,
          message,
          phoneNumber: phone,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit inquiry");
      }

      try {
        sessionStorage.removeItem(draftKey);
      } catch {
        // ignore
      }

      setSubmitted(true);
    } catch (err) {
      setError(errorMessage(err) || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-emerald-900">
        <div className="flex items-center space-x-2 text-emerald-700 font-bold mb-2">
          <CheckCircle2 className="w-5 h-5" />
          <span>
            {isOfferToRequirement
              ? "Offer Proposal Submitted"
              : "Inquiry Submitted Successfully"}
          </span>
        </div>
        <p className="text-xs text-emerald-800 leading-relaxed mb-4">
          Your inquiry has been logged securely. We will review the details and follow up promptly
          to facilitate next steps.
        </p>
        <Link
          href="/dashboard?tab=inquiries"
          className="inline-flex items-center space-x-1.5 text-xs font-bold text-brand-blue hover:text-brand-blue-700 hover:underline"
        >
          <span>Track in Dashboard → Inquiries</span>
          <span>↗</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-md p-6">
      <div className="flex items-center space-x-2 text-xs font-bold text-brand-blue bg-brand-blue-50 border border-brand-blue-100 px-3 py-1 rounded-md w-fit mb-3">
        <ShieldCheck className="w-4 h-4 text-brand-gold-600" />
        <span>
          {isOfferToRequirement
            ? "Submit Equipment Proposal"
            : isSold
            ? "Request Equivalent Unit"
            : "Direct Equipment Inquiry"}
        </span>
      </div>

      <h3 className="text-lg font-black text-slate-900">
        {isOfferToRequirement
          ? "Have matching equipment?"
          : isSold
          ? "Looking for a similar machine?"
          : "Interested in this equipment?"}
      </h3>
      <p className="text-xs text-slate-500 mt-1">
        {isOfferToRequirement
          ? "Submit your instrument specifications and price ask to coordinate with the buyer."
          : isSold
          ? "This specific unit is sold. Submit your specifications below and our engineering desk will locate equivalent units or incoming stock for you."
          : "Submit your questions, required specifications, or price proposal below."}
      </p>

      {error && (
        <div className="mt-4 rounded-xl bg-red-50 p-3 text-red-700 text-xs flex items-center space-x-2 border border-red-200">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {status === "unauthenticated" ? (
        <div className="mt-5 p-4 rounded-xl bg-slate-50 border border-slate-200 text-center">
          <Lock className="w-8 h-8 text-slate-400 mx-auto mb-2" />
          <p className="text-xs text-slate-600 font-medium">
            {isOfferToRequirement
              ? "Sign in to submit an offer for this requirement."
              : "Sign in to send an inquiry for this equipment."}
          </p>
          <Link
            href={`/auth/signin?callbackUrl=${encodeURIComponent(pathname || "/listings")}`}
            className="mt-3 inline-block px-4 py-2 bg-brand-blue hover:bg-brand-blue-500 text-white font-semibold text-xs rounded-xl transition-colors shadow-xs"
          >
            Sign In with Email or Google
          </Link>
        </div>
      ) : (
        <form onSubmit={handleInquiry} className="mt-4 space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Your Inquiry Message
            </label>
            <textarea
              rows={3}
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full p-2.5 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-brand-blue focus:border-brand-blue"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Your Contact Phone Number (Private)
            </label>
            <div className="relative">
              <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
              <input
                type="tel"
                placeholder="+91 98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-brand-blue focus:border-brand-blue"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-brand-blue hover:bg-brand-blue-500 text-white font-bold rounded-xl text-xs shadow-md transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5 text-brand-gold" />
            <span>
              {loading
                ? "Sending..."
                : isOfferToRequirement
                ? "Submit Equipment Offer"
                : isSold
                ? "Request Similar Unit"
                : "Send Inquiry"}
            </span>
          </button>

          <p className="text-[10px] text-slate-400 text-center leading-tight pt-1">
            Your contact information is never displayed publicly on the marketplace.
          </p>
        </form>
      )}
    </div>
  );
}
