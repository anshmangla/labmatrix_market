"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  FileQuestion,
  Lock,
  Phone,
  Building2,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Wrench,
  Cpu,
} from "lucide-react";

const CATEGORIES = [
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

function CreateRequirementForm() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Type: MACHINE vs SPARE_PART
  const initialType = searchParams.get("type") === "spare_part" ? "SPARE_PART" : "MACHINE";
  const [itemType, setItemType] = useState<"MACHINE" | "SPARE_PART">(initialType);

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState(
    initialType === "SPARE_PART" ? "Spare Parts & Consumables" : CATEGORIES[0]
  );
  const [compatibleWith, setCompatibleWith] = useState("");
  const [partNumber, setPartNumber] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [description, setDescription] = useState("");

  // Private contact fields
  const [userHasPhone, setUserHasPhone] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [companyName, setCompanyName] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Check user profile for existing phone
  useEffect(() => {
    if (session?.user) {
      fetch("/api/user/profile")
        .then((res) => res.json())
        .then((data) => {
          if (data?.user?.phoneNumber) {
            setUserHasPhone(true);
            setPhoneNumber(data.user.phoneNumber);
          }
          if (data?.user?.companyName) {
            setCompanyName(data.user.companyName);
          }
        })
        .catch((err) => console.error("Profile fetch error:", err));
    }
  }, [session]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center border border-slate-200">
          <Lock className="w-12 h-12 text-teal-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-800">
            Sign In Required to Request Equipment
          </h2>
          <p className="text-sm text-slate-600 mt-2">
            Please sign in with your email or Google account to post an equipment or spare part request.
          </p>
          <Link
            href="/auth/signin"
            className="mt-6 inline-flex items-center justify-center w-full py-2.5 px-4 rounded-xl text-white font-semibold bg-teal-600 hover:bg-teal-700 transition-colors"
          >
            <span>Proceed to Sign In</span>
            <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!userHasPhone && !phoneNumber.trim()) {
      setError("Please provide your phone number for admin communication.");
      return;
    }

    setLoading(true);

    // Format description to include quantity and compatibility if spare part
    let finalDesc = description.trim();
    if (itemType === "SPARE_PART") {
      finalDesc += `\n[Request Details: Quantity Needed: ${quantity || "1"}${
        compatibleWith ? ` | Fits Instrument: ${compatibleWith.trim()}` : ""
      }${partNumber ? ` | Part #: ${partNumber.trim()}` : ""}]`;
    }

    try {
      const res = await fetch("/api/requirements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          category,
          itemType,
          partNumber: partNumber?.trim() || null,
          compatibleWith: compatibleWith?.trim() || null,
          description: finalDesc,
          phoneNumber,
          companyName,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to submit requirement");
        setLoading(false);
        return;
      }

      router.push(itemType === "SPARE_PART" ? "/spare-parts" : "/requests");
      router.refresh();
    } catch (err: any) {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <Link
            href="/requests"
            className="text-xs font-semibold text-teal-600 hover:text-teal-700 flex items-center mb-2"
          >
            ← Back to All Buyer Requests
          </Link>
          <h1 className="text-3xl font-extrabold text-slate-900">
            Post an Equipment or Spare Part Request
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Post your equipment or spare part requirements. Qualified suppliers and laboratories submit offers directly through the platform.
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-xl bg-red-50 p-4 border border-red-200 flex items-start space-x-3 text-red-700 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-500 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Item Type Selector */}
          <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200 space-y-4">
            <label className="block text-sm font-bold text-slate-900">
              What type of requirement are you posting? *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setItemType("MACHINE");
                  if (category === "Spare Parts & Consumables") setCategory(CATEGORIES[0]);
                }}
                className={`p-4 rounded-xl border-2 text-left transition-all cursor-pointer ${
                  itemType === "MACHINE"
                    ? "border-teal-600 bg-teal-50/60 shadow-xs"
                    : "border-slate-200 hover:border-slate-300 bg-white"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-base ${
                      itemType === "MACHINE"
                        ? "bg-teal-600 text-white"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    🔬
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 text-sm block">
                      Complete Machine / System
                    </span>
                    <span className="text-xs text-slate-500">
                      HPLC, GC-MS, UV-Vis, Dissolution Tester...
                    </span>
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setItemType("SPARE_PART");
                  setCategory("Spare Parts & Consumables");
                }}
                className={`p-4 rounded-xl border-2 text-left transition-all cursor-pointer ${
                  itemType === "SPARE_PART"
                    ? "border-teal-600 bg-teal-50/60 shadow-xs"
                    : "border-slate-200 hover:border-slate-300 bg-white"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-base ${
                      itemType === "SPARE_PART"
                        ? "bg-teal-600 text-white"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    ⚙️
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 text-sm block">
                      Spare Part or Consumable
                    </span>
                    <span className="text-xs text-slate-500">
                      Lamps, columns, seal kits, valves, boards...
                    </span>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Details Section */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-xs border border-slate-200 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-lg font-bold text-slate-900">
                {itemType === "SPARE_PART"
                  ? "Spare Part & Consumable Specifications"
                  : "Equipment Details Needed"}
              </h2>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                {itemType === "SPARE_PART" ? "⚙️ Spare Part Request" : "🔬 Machine Request"}
              </span>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                {itemType === "SPARE_PART"
                  ? "Spare Part / Consumable Name *"
                  : "Machine Name / Target Model *"}
              </label>
              <input
                type="text"
                required
                placeholder={
                  itemType === "SPARE_PART"
                    ? "e.g. Deuterium Lamp for DAD Detector or C18 HPLC Column 250x4.6mm"
                    : "e.g. Seeking Waters Alliance 2695 HPLC with 2487 Dual UV Detector"
                }
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm text-slate-900 bg-white placeholder:text-slate-500 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              />
            </div>

            {itemType === "SPARE_PART" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Compatible Instrument / Model
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Agilent 1100 / 1200 HPLC, Waters 2695"
                    value={compatibleWith}
                    onChange={(e) => setCompatibleWith(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm text-slate-900 bg-white placeholder:text-slate-500 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Part Number / Catalog ID (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. G1315-60012, WAT044234"
                    value={partNumber}
                    onChange={(e) => setPartNumber(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm text-slate-900 bg-white placeholder:text-slate-500 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  />
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Category *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm text-slate-900 bg-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat} className="text-slate-900 bg-white">
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {itemType === "SPARE_PART" && (
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Quantity Needed
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 1 unit, 2 packs, 5 pcs"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm text-slate-900 bg-white placeholder:text-slate-500 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  />
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                {itemType === "SPARE_PART"
                  ? "Required Specifications, Condition Desired & Urgency *"
                  : "Required Specifications & Application Details *"}
              </label>
              <textarea
                required
                rows={5}
                placeholder={
                  itemType === "SPARE_PART"
                    ? "Specify preferred condition (OEM New Sealed, Tested Surplus, Refurbished), acceptable alternatives, delivery destination, and urgency..."
                    : "Specify preferred manufacture year, mandatory detectors, autosampler capacity, software requirements, qualification certificates, and delivery target city..."
                }
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm text-slate-900 bg-white placeholder:text-slate-500 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              />
            </div>
          </div>

          {/* Contact Details */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl p-6 sm:p-8 shadow-md">
            <div className="flex items-start space-x-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-400 flex-shrink-0">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">
                  Contact & Notification Details
                </h2>
                <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                  Your phone number will never be shown publicly. It is used strictly for
                  deal notifications and verifying matching inventory.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Your Mobile / WhatsApp Number *
                </label>
                <div className="relative rounded-xl">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Phone className="h-4 w-4" />
                  </div>
                  <input
                    type="tel"
                    required={!userHasPhone}
                    placeholder="+91 98765 43210"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Company / Institution Name (Optional)
                </label>
                <div className="relative rounded-xl">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Building2 className="h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    placeholder="e.g. Biocare Pharma R&D"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  />
                </div>
              </div>
            </div>

            {userHasPhone && (
              <div className="mt-3 flex items-center space-x-1.5 text-xs text-teal-400">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Phone on file: Verified for inquiry notifications.</span>
              </div>
            )}
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-lg transition-all disabled:opacity-50 flex items-center space-x-2 text-sm cursor-pointer"
            >
              <span>
                {loading
                  ? "Submitting..."
                  : itemType === "SPARE_PART"
                  ? "Post Spare Part Request"
                  : "Post Equipment Requirement"}
              </span>
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function CreateRequirementPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <div className="w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <CreateRequirementForm />
    </Suspense>
  );
}
