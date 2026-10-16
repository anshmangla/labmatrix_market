"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Upload,
  X,
  AlertCircle,
  CheckCircle2,
  Lock,
  Phone,
  Building2,
  ArrowRight,
  Info,
  Image as ImageIcon,
  Wrench,
  Clock,
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

const MACHINE_CONDITIONS = [
  "Used - Excellent (Calibrated)",
  "Used - Good Working Condition",
  "Used - Normal Wear",
  "Refurbished by OEM/Third-Party",
  "For Parts / Non-operational",
];

const NEW_INSTRUMENT_CONDITIONS = [
  "Brand New - Factory Sealed",
  "Brand New - Demo Unit",
  "Brand New with OEM Warranty",
];

const SPARE_CONDITIONS = [
  "Brand New - Sealed OEM",
  "Tested Working Surplus",
  "Used - Functional",
  "Refurbished / Repaired",
];

function CreateListingForm() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialType =
    searchParams.get("type") === "spare_part"
      ? "SPARE_PART"
      : searchParams.get("type") === "new_instrument"
      ? "NEW_INSTRUMENT"
      : "MACHINE";
  const [itemType, setItemType] = useState<"MACHINE" | "NEW_INSTRUMENT" | "SPARE_PART">(initialType);

  // Listing fields
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState(
    initialType === "SPARE_PART" ? "Spare Parts & Consumables" : CATEGORIES[0]
  );
  const [condition, setCondition] = useState(
    initialType === "SPARE_PART"
      ? SPARE_CONDITIONS[0]
      : initialType === "NEW_INSTRUMENT"
      ? NEW_INSTRUMENT_CONDITIONS[0]
      : MACHINE_CONDITIONS[1]
  );
  const [compatibleWith, setCompatibleWith] = useState("");
  const [partNumber, setPartNumber] = useState("");
  const [location, setLocation] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [description, setDescription] = useState("");
  const [duplicatingFrom, setDuplicatingFrom] = useState<string | null>(null);

  // Photos
  const [photos, setPhotos] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  // Private contact fields (collected when user posts)
  const [userHasPhone, setUserHasPhone] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [companyName, setCompanyName] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [submittedData, setSubmittedData] = useState<{ id: string; title: string; itemType: string } | null>(null);

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
        .catch((err) => console.error("Profile check error:", err));
    }
  }, [session]);

  // Check for duplicate query param to prefill fields
  useEffect(() => {
    const duplicateId = searchParams.get("duplicate");
    if (!duplicateId) return;

    fetch(`/api/listings/${duplicateId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data?.listing) {
          const l = data.listing;
          setTitle(l.title ? `Copy of ${l.title}` : "");
          setDescription(l.description || "");
          setCategory(l.category || CATEGORIES[0]);
          if (l.itemType === "SPARE_PART" || l.itemType === "NEW_INSTRUMENT" || l.itemType === "MACHINE") {
            setItemType(l.itemType);
          }
          setCondition(l.condition || "");
          setPartNumber(l.partNumber || "");
          setCompatibleWith(l.compatibleWith || "");
          setLocation(l.location || "");
          setMinPrice(l.minPrice !== undefined && l.minPrice !== null ? String(l.minPrice) : "");
          setMaxPrice(l.maxPrice !== undefined && l.maxPrice !== null ? String(l.maxPrice) : "");
          setPhotos(Array.isArray(l.photos) ? l.photos : []);
          setQuantity(l.quantity ? String(l.quantity) : "1");
          setDuplicatingFrom(l.title || "Selected Listing");
        }
      })
      .catch((err) => console.error("Error fetching listing to duplicate:", err));
  }, [searchParams]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-4 border-brand-blue border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center border border-slate-200">
          <Lock className="w-12 h-12 text-brand-blue mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-800">
            Sign In Required to List Items
          </h2>
          <p className="text-sm text-slate-600 mt-2">
            Please sign in with your email or Google account to list machinery or spare parts on LabMatrix.
          </p>
          <Link
            href="/auth/signin"
            className="mt-6 inline-flex items-center justify-center w-full py-2.5 px-4 rounded-xl text-white font-semibold bg-brand-blue hover:bg-brand-blue-500 transition-colors shadow-xs"
          >
            <span>Proceed to Sign In</span>
            <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </div>
      </div>
    );
  }

  // Handle image upload to Cloudinary route
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setError("");

    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || "Upload failed");
        }

        const data = await res.json();
        return data.url;
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      setPhotos((prev) => [...prev, ...uploadedUrls]);
    } catch (err: any) {
      console.error("Upload error:", err);
      setError(err.message || "Failed to upload one or more images");
    } finally {
      setUploading(false);
    }
  };

  const removePhoto = (indexToRemove: number) => {
    setPhotos((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!userHasPhone && !phoneNumber.trim()) {
      setError("Please provide your mobile number for inquiry notifications.");
      return;
    }

    if (parseFloat(minPrice) > parseFloat(maxPrice)) {
      setError("Minimum price cannot be greater than maximum price.");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        title: title.trim(),
        category,
        itemType,
        partNumber: partNumber?.trim() || null,
        compatibleWith: compatibleWith?.trim() || null,
        condition,
        location: location.trim(),
        minPrice,
        maxPrice,
        quantity: Math.max(1, parseInt(quantity, 10) || 1),
        description: description.trim(),
        photos,
        phoneNumber,
        companyName,
      };

      const res = await fetch("/api/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to submit listing");
        setLoading(false);
        return;
      }

      setSubmittedData({
        id: data.listingId,
        title: title.trim(),
        itemType,
      });
      setLoading(false);
    } catch (err: any) {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  };

  const currentConditions =
    itemType === "SPARE_PART"
      ? SPARE_CONDITIONS
      : itemType === "NEW_INSTRUMENT"
      ? NEW_INSTRUMENT_CONDITIONS
      : MACHINE_CONDITIONS;

  if (submittedData) {
    return (
      <div className="min-h-screen bg-slate-50 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-xl mx-auto bg-white rounded-3xl p-8 sm:p-10 border border-slate-200 shadow-xl text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto shadow-xs">
            <Clock className="w-8 h-8" />
          </div>

          <div>
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 mb-3">
              <Clock className="w-3.5 h-3.5" />
              <span>Pending Admin Review</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900">
              Entry Submitted for Approval!
            </h1>
            <p className="text-sm text-slate-600 mt-2 leading-relaxed">
              Your listing for <strong className="text-slate-900">&quot;{submittedData.title}&quot;</strong> has been successfully created and sent to our admin team for verification.
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left space-y-2 text-xs text-slate-600">
            <div className="flex items-start space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <span><strong>Next Step:</strong> Our admin team will verify specifications and activate it.</span>
            </div>
            <div className="flex items-start space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <span><strong>Notification:</strong> You will receive an on-site alert (bell icon) the moment it goes live.</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href="/dashboard"
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-brand-blue hover:bg-brand-blue-500 text-white font-bold text-sm transition-colors shadow-xs"
            >
              Go to My Dashboard
            </Link>
            <Link
              href={submittedData.itemType === "SPARE_PART" ? "/spare-parts" : `/listings/${submittedData.id}`}
              className="w-full sm:w-auto px-6 py-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-sm transition-colors"
            >
              Preview Entry
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/listings"
            className="text-xs font-semibold text-brand-blue hover:text-brand-blue-500 flex items-center mb-2"
          >
            ← Back to All Listings
          </Link>
          <h1 className="text-3xl font-extrabold text-slate-900">
            List Equipment or Spare Parts
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Your contact details remain completely private. Inquiries and proposals are coordinated securely.
          </p>
        </div>

        {duplicatingFrom && (
          <div className="mb-6 rounded-2xl bg-brand-gold/15 p-4 border border-brand-gold/40 flex items-start space-x-3 text-brand-blue-900 text-sm">
            <Info className="w-5 h-5 flex-shrink-0 text-brand-blue mt-0.5" />
            <div>
              <span className="font-bold block">📋 Duplicating Listing</span>
              <span>
                Pre-filled specifications, photos, and pricing from &quot;{duplicatingFrom}&quot;. Modify any fields below as needed and submit as a brand-new listing.
              </span>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 rounded-xl bg-red-50 p-4 border border-red-200 flex items-start space-x-3 text-red-700 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-500 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Card 0: Item Type Selector */}
          <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200 space-y-4">
            <label className="block text-sm font-bold text-slate-900">
              What are you listing for sale? *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => {
                  setItemType("MACHINE");
                  setCondition(MACHINE_CONDITIONS[1]);
                  if (category === "Spare Parts & Consumables") setCategory(CATEGORIES[0]);
                }}
                className={`p-4 rounded-xl border-2 text-left transition-all cursor-pointer ${
                  itemType === "MACHINE"
                    ? "border-brand-blue bg-brand-blue-50/60 shadow-xs"
                    : "border-slate-200 hover:border-slate-300 bg-white"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-base ${
                      itemType === "MACHINE"
                        ? "bg-brand-blue text-white"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    🔬
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 text-sm block">
                      Pre-Owned Machine
                    </span>
                    <span className="text-xs text-slate-500">
                      Refurbished / Used instruments
                    </span>
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setItemType("NEW_INSTRUMENT");
                  setCondition(NEW_INSTRUMENT_CONDITIONS[0]);
                  if (category === "Spare Parts & Consumables") setCategory(CATEGORIES[0]);
                }}
                className={`p-4 rounded-xl border-2 text-left transition-all cursor-pointer ${
                  itemType === "NEW_INSTRUMENT"
                    ? "border-emerald-600 bg-emerald-50/60 shadow-xs"
                    : "border-slate-200 hover:border-slate-300 bg-white"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-base ${
                      itemType === "NEW_INSTRUMENT"
                        ? "bg-emerald-600 text-white"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    ✨
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 text-sm block">
                      Brand New Instrument
                    </span>
                    <span className="text-xs text-slate-500">
                      Factory sealed with OEM warranty
                    </span>
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setItemType("SPARE_PART");
                  setCondition(SPARE_CONDITIONS[0]);
                  setCategory("Spare Parts & Consumables");
                }}
                className={`p-4 rounded-xl border-2 text-left transition-all cursor-pointer ${
                  itemType === "SPARE_PART"
                    ? "border-brand-blue bg-brand-blue-50/60 shadow-xs"
                    : "border-slate-200 hover:border-slate-300 bg-white"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-base ${
                      itemType === "SPARE_PART"
                        ? "bg-brand-blue text-white"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    ⚙️
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 text-sm block">
                      Spare Part / Consumable
                    </span>
                    <span className="text-xs text-slate-500">
                      Lamps, columns, modules, valves...
                    </span>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Card 1: Specifications */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-xs border border-slate-200">
            <h2 className="text-lg font-bold text-slate-900 mb-5">
              {itemType === "SPARE_PART"
                ? "1. Spare Part Specifications"
                : itemType === "NEW_INSTRUMENT"
                ? "1. New Instrument Specifications"
                : "1. Machine Specifications"}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  {itemType === "SPARE_PART"
                    ? "Part / Consumable Title & Name *"
                    : "Equipment Title & Model *"}
                </label>
                <input
                  type="text"
                  required
                  placeholder={
                    itemType === "SPARE_PART"
                      ? "e.g. Agilent 1260 DAD Deuterium Lamp (OEM Sealed) or Waters 2695 Pump Seal Kit"
                      : "e.g. Waters Acquity UPLC System with PDA Detector & Sample Manager"
                  }
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm text-slate-900 bg-white placeholder:text-slate-500 focus:ring-2 focus:ring-brand-blue focus:border-brand-blue transition-colors"
                />
              </div>

              {itemType === "SPARE_PART" && (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">
                      Compatible Instrument / OEM Model
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Agilent 1100 / 1200 / 1260 Series, Waters Alliance"
                      value={compatibleWith}
                      onChange={(e) => setCompatibleWith(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm text-slate-900 bg-white placeholder:text-slate-500 focus:ring-2 focus:ring-brand-blue focus:border-brand-blue"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">
                      Part Number / Catalog Number (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. G1315-60012, 5063-6589"
                      value={partNumber}
                      onChange={(e) => setPartNumber(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm text-slate-900 bg-white placeholder:text-slate-500 focus:ring-2 focus:ring-brand-blue focus:border-brand-blue"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Category *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm text-slate-900 bg-white focus:ring-2 focus:ring-brand-blue focus:border-brand-blue"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat} className="text-slate-900 bg-white">
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Condition *
                </label>
                <select
                  value={condition}
                  onChange={(e) => setCondition(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm text-slate-900 bg-white focus:ring-2 focus:ring-brand-blue focus:border-brand-blue"
                >
                  {currentConditions.map((cond) => (
                    <option key={cond} value={cond} className="text-slate-900 bg-white">
                      {cond}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Current Location (City / State)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Hyderabad, Telangana"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm text-slate-900 bg-white placeholder:text-slate-500 focus:ring-2 focus:ring-brand-blue focus:border-brand-blue"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Quantity Available *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  placeholder="1"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm text-slate-900 bg-white placeholder:text-slate-500 focus:ring-2 focus:ring-brand-blue focus:border-brand-blue"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Min Price (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    placeholder="e.g. 25000"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm text-slate-900 bg-white placeholder:text-slate-500 focus:ring-2 focus:ring-brand-blue focus:border-brand-blue"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Max Price (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    placeholder="e.g. 35000"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm text-slate-900 bg-white placeholder:text-slate-500 focus:ring-2 focus:ring-brand-blue focus:border-brand-blue"
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Detailed Description & Specifications *
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder={
                    itemType === "SPARE_PART"
                      ? "Describe part working status, manufacture date or expiry if applicable, original packaging, quantity included, testing verified..."
                      : "Include year of manufacture, software version, included modules/detectors, service history, operational status, calibration status..."
                  }
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm text-slate-900 bg-white placeholder:text-slate-500 focus:ring-2 focus:ring-brand-blue focus:border-brand-blue"
                />
              </div>
            </div>
          </div>

          {/* Card 2: Photos Upload */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-xs border border-slate-200">
            <h2 className="text-lg font-bold text-slate-900 mb-1">
              2. Photos & Documentation
            </h2>
            <p className="text-xs text-slate-500 mb-5">
              High-quality photos of the serial plate, modules, and condition increase buyer interest.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
              {photos.map((url, idx) => (
                <div
                  key={idx}
                  className="relative group rounded-xl overflow-hidden border border-slate-200 bg-slate-100 aspect-square"
                >
                  <img
                    src={url}
                    alt={`Upload ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removePhoto(idx)}
                    className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 opacity-90 hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}

              <label className="border-2 border-dashed border-slate-300 hover:border-brand-blue rounded-xl flex flex-col items-center justify-center cursor-pointer aspect-square p-4 text-center transition-colors bg-slate-50 hover:bg-brand-blue-50/30">
                <Upload className="w-6 h-6 text-slate-400 mb-2" />
                <span className="text-xs font-semibold text-slate-700">
                  {uploading ? "Uploading..." : "Add Photos"}
                </span>
                <span className="text-[10px] text-slate-400 mt-1">PNG, JPG, WEBP</span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploading}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Card 3: Contact & Notification Details */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl p-6 sm:p-8 shadow-md">
            <div className="flex items-start space-x-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-brand-gold/20 border border-brand-gold/40 flex items-center justify-center text-brand-gold flex-shrink-0">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">
                  3. Contact & Notification Details
                </h2>
                <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                  Your phone number will NEVER be displayed publicly on this listing. It is used
                  strictly for deal notifications and verifying interested buyers.
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
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:ring-2 focus:ring-brand-blue focus:border-brand-blue"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Company / Laboratory Name (Optional)
                </label>
                <div className="relative rounded-xl">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Building2 className="h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    placeholder="e.g. Apex Analytical Solutions"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:ring-2 focus:ring-brand-blue focus:border-brand-blue"
                  />
                </div>
              </div>
            </div>

            {userHasPhone && (
              <div className="mt-3 flex items-center space-x-1.5 text-xs text-brand-gold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Phone on file: Verified for inquiry notifications.</span>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={loading || uploading}
              className="px-8 py-3.5 bg-brand-blue hover:bg-brand-blue-500 text-white font-bold rounded-xl shadow-lg transition-all disabled:opacity-50 flex items-center space-x-2 text-sm cursor-pointer"
            >
              <span>
                {loading
                  ? "Publishing..."
                  : itemType === "SPARE_PART"
                  ? "Publish Spare Part Listing"
                  : itemType === "NEW_INSTRUMENT"
                  ? "Publish New Instrument Listing"
                  : "Publish Machine Listing"}
              </span>
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function CreateListingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <div className="w-8 h-8 border-4 border-brand-blue border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <CreateListingForm />
    </Suspense>
  );
}
