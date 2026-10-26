"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
  Upload,
  X,
  AlertCircle,
  CheckCircle2,
  Lock,
  ArrowRight,
  Info,
  Image as ImageIcon,
  Wrench,
  Clock,
  ArrowLeft,
  Loader2,
  ShieldAlert,
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

export default function EditListingPage() {
  const { data: session, status: authStatus } = useSession();
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [initialLoading, setInitialLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // Listing fields
  const [itemType, setItemType] = useState<"MACHINE" | "NEW_INSTRUMENT" | "SPARE_PART">("MACHINE");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [condition, setCondition] = useState(MACHINE_CONDITIONS[1]);
  const [compatibleWith, setCompatibleWith] = useState("");
  const [partNumber, setPartNumber] = useState("");
  const [location, setLocation] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [description, setDescription] = useState("");
  const [listingStatus, setListingStatus] = useState("AVAILABLE");
  const [photos, setPhotos] = useState<string[]>([]);
  const [wasApproved, setWasApproved] = useState(false);

  // Form states
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [successResult, setSuccessResult] = useState<{
    requiresReapproval: boolean;
    message: string;
  } | null>(null);

  // Fetch listing details
  useEffect(() => {
    if (!id) return;

    async function loadListing() {
      try {
        setInitialLoading(true);
        const res = await fetch(`/api/listings/${id}`);
        if (!res.ok) {
          throw new Error("Failed to load listing or unauthorized access.");
        }
        const data = await res.json();
        const l = data.listing;
        if (!l) {
          throw new Error("Listing not found.");
        }

        setIsOwner(data.isOwner);
        setIsAdmin(data.isAdmin);

        if (l.itemType === "SPARE_PART" || l.itemType === "NEW_INSTRUMENT" || l.itemType === "MACHINE") {
          setItemType(l.itemType);
        } else {
          setItemType("MACHINE");
        }
        setTitle(l.title || "");
        setCategory(l.category || CATEGORIES[0]);
        setCondition(l.condition || MACHINE_CONDITIONS[1]);
        setCompatibleWith(l.compatibleWith || "");
        setPartNumber(l.partNumber || "");
        setLocation(l.location || "");
        setMinPrice(l.minPrice !== undefined && l.minPrice !== null ? String(l.minPrice) : "");
        setMaxPrice(l.maxPrice !== undefined && l.maxPrice !== null ? String(l.maxPrice) : "");
        setQuantity(l.quantity !== undefined && l.quantity !== null ? String(l.quantity) : "1");
        setDescription(l.description || "");
        setListingStatus(l.status || "AVAILABLE");
        setPhotos(Array.isArray(l.photos) ? l.photos : []);
        setWasApproved(!!l.isApproved);
      } catch (err: any) {
        setError(err.message || "Failed to load listing details");
      } finally {
        setInitialLoading(false);
      }
    }

    if (authStatus === "authenticated") {
      loadListing();
    } else if (authStatus === "unauthenticated") {
      setInitialLoading(false);
    }
  }, [id, authStatus]);

  if (authStatus === "loading" || initialLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-4 border-brand-blue border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (authStatus === "unauthenticated") {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center border border-slate-200">
          <Lock className="w-12 h-12 text-brand-blue mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-800">Sign In Required</h2>
          <p className="text-sm text-slate-600 mt-2">
            Please sign in to edit your equipment or spare part listing.
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

  if (!isOwner && !isAdmin) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center border border-slate-200">
          <ShieldAlert className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-900">Access Restricted</h2>
          <p className="text-sm text-slate-600 mt-2">
            You do not have permission to edit this listing. Only the listing owner or platform administrator can edit details.
          </p>
          <Link
            href="/dashboard"
            className="mt-6 inline-flex items-center justify-center w-full py-2.5 px-4 rounded-xl text-white font-semibold bg-brand-blue hover:bg-brand-blue-500 transition-colors shadow-xs"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (photos.length + files.length > 10) {
      setError("A maximum of 10 photos is allowed.");
      return;
    }

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

    const parsedMin = parseFloat(minPrice);
    const parsedMax = parseFloat(maxPrice);

    if (isNaN(parsedMin) || isNaN(parsedMax) || parsedMin < 0 || parsedMax < 0) {
      setError("Please provide valid non-negative pricing numbers.");
      return;
    }

    if (parsedMin > parsedMax) {
      setError("Minimum price cannot be greater than maximum price.");
      return;
    }

    setSaving(true);

    try {
      const payload = {
        title: title.trim(),
        category,
        itemType,
        partNumber: partNumber?.trim() || null,
        compatibleWith: compatibleWith?.trim() || null,
        condition,
        location: location.trim(),
        minPrice: parsedMin,
        maxPrice: parsedMax,
        quantity: Math.max(1, parseInt(quantity, 10) || 1),
        description: description.trim(),
        photos,
        status: listingStatus,
      };

      const res = await fetch(`/api/listings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to save listing changes");
        setSaving(false);
        return;
      }

      setSuccessResult({
        requiresReapproval: !!data.requiresReapproval,
        message: data.message,
      });
      router.refresh();
      setSaving(false);
    } catch (err: any) {
      setError("Network error. Please try again.");
      setSaving(false);
    }
  };

  const currentConditions =
    itemType === "SPARE_PART"
      ? SPARE_CONDITIONS
      : itemType === "NEW_INSTRUMENT"
      ? NEW_INSTRUMENT_CONDITIONS
      : MACHINE_CONDITIONS;

  if (successResult) {
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center px-4 py-12 bg-slate-50">
        <div className="bg-white p-8 rounded-3xl shadow-xl max-w-lg w-full text-center border border-slate-200">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-xs">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <h2 className="text-2xl font-black text-slate-900">
            {successResult.requiresReapproval
              ? "Edits Submitted for Approval"
              : "Listing Updated Successfully"}
          </h2>

          <p className="text-sm text-slate-600 mt-3 leading-relaxed">
            {successResult.message}
          </p>

          {successResult.requiresReapproval && (
            <div className="mt-5 p-4 bg-amber-50 rounded-2xl border border-amber-200 text-left text-xs text-amber-900 flex items-start space-x-3">
              <Clock className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block text-amber-950">Under Deal Desk Review</span>
                <span>
                  Our team reviews modified equipment listings to maintain verified catalog quality. You will be notified via on-site notification once your edits are live.
                </span>
              </div>
            </div>
          )}

          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <Link
              href="/dashboard"
              className="flex-1 py-3 px-4 rounded-xl font-bold text-sm text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors text-center"
            >
              Go to Dashboard
            </Link>
            <Link
              href={`/listings/${id}`}
              className="flex-1 py-3 px-4 rounded-xl font-bold text-sm text-white bg-brand-blue hover:bg-brand-blue-500 transition-colors text-center shadow-xs"
            >
              Preview Listing
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            href="/dashboard"
            className="inline-flex items-center text-xs font-bold text-slate-500 hover:text-brand-blue transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            <span>Back to Dashboard</span>
          </Link>
          <Link
            href={`/listings/${id}`}
            className="text-xs font-semibold text-brand-blue hover:underline"
          >
            View Live Listing
          </Link>
        </div>

        {/* Header */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-brand-blue/10 text-brand-blue flex items-center justify-center font-bold">
              {itemType === "SPARE_PART" ? "⚙️" : "🔬"}
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900">
                Edit Listing
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Update equipment specifications, pricing expectations, or uploaded photographs.
              </p>
            </div>
          </div>

          {/* Admin vs User Re-approval Notice */}
          <div className="mt-5 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start space-x-3 text-xs leading-relaxed">
            <Info className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block text-amber-950">
                Quality & Approval Verification Notice:
              </span>
              <span>
                {isAdmin
                  ? "As an administrator, changes made here will update immediately without requiring secondary review."
                  : "Modifying listing information (title, specifications, pricing, or photos) will temporarily set your listing to Pending Admin Approval until reviewed by our Deal Desk."}
              </span>
            </div>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">
              Basic Information
            </h2>

            {/* Item Type Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                Listing Type
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setItemType("MACHINE");
                    if (category === "Spare Parts & Consumables") {
                      setCategory(CATEGORIES[0]);
                    }
                  }}
                  className={`py-3 px-4 rounded-xl border text-xs font-bold transition-all flex items-center justify-center space-x-2 cursor-pointer ${
                    itemType === "MACHINE"
                      ? "bg-brand-blue text-white border-brand-blue shadow-xs"
                      : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <span>Pre-Owned Machine</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setItemType("NEW_INSTRUMENT");
                    if (category === "Spare Parts & Consumables") {
                      setCategory(CATEGORIES[0]);
                    }
                  }}
                  className={`py-3 px-4 rounded-xl border text-xs font-bold transition-all flex items-center justify-center space-x-2 cursor-pointer ${
                    itemType === "NEW_INSTRUMENT"
                      ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                      : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <span>Brand New Instrument</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setItemType("SPARE_PART");
                    setCategory("Spare Parts & Consumables");
                  }}
                  className={`py-3 px-4 rounded-xl border text-xs font-bold transition-all flex items-center justify-center space-x-2 cursor-pointer ${
                    itemType === "SPARE_PART"
                      ? "bg-brand-blue text-white border-brand-blue shadow-xs"
                      : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <Wrench className="w-3.5 h-3.5" />
                  <span>Spare Part / Consumable</span>
                </button>
              </div>
            </div>

            {/* Listing Title */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Listing Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Agilent 1260 Infinity II HPLC System with DAD"
                className="w-full text-sm px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-blue"
              />
            </div>

            {/* Category */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full text-sm px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-blue bg-white"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Condition <span className="text-red-500">*</span>
                </label>
                <select
                  value={condition}
                  onChange={(e) => setCondition(e.target.value)}
                  className="w-full text-sm px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-blue bg-white"
                >
                  {currentConditions.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Spare Part Specific Fields */}
            {itemType === "SPARE_PART" && (
              <div className="p-4 bg-brand-blue-50/50 rounded-xl border border-brand-blue-100 space-y-4">
                <div className="flex items-center space-x-2 text-xs font-bold text-brand-blue-900">
                  <Wrench className="w-4 h-4 text-brand-blue" />
                  <span>Spare Part Compatibility Details</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Compatible Instrument / Model
                    </label>
                    <input
                      type="text"
                      value={compatibleWith}
                      onChange={(e) => setCompatibleWith(e.target.value)}
                      placeholder="e.g. Waters Acquity UPLC / Agilent 1200"
                      className="w-full text-sm px-4 py-2 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Part / Catalog Number
                    </label>
                    <input
                      type="text"
                      value={partNumber}
                      onChange={(e) => setPartNumber(e.target.value)}
                      placeholder="e.g. G1315-60012"
                      className="w-full text-sm px-4 py-2 rounded-lg border border-slate-200 bg-white font-mono focus:outline-none focus:ring-2 focus:ring-brand-blue"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Price Expectation Range */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Expected Price Range (INR ₹) <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <input
                    type="number"
                    required
                    min="0"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    placeholder="Min Price (e.g. 500000)"
                    className="w-full text-sm px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-blue"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">Minimum price expectation</span>
                </div>
                <div>
                  <input
                    type="number"
                    required
                    min="0"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    placeholder="Max Price (e.g. 750000)"
                    className="w-full text-sm px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-blue"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">Maximum price expectation</span>
                </div>
              </div>
            </div>

            {/* Location, Quantity & Status */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Location (City / State)
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Ahmedabad, Gujarat"
                  className="w-full text-sm px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-blue"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Quantity Available <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="1"
                  className="w-full text-sm px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-blue"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Listing Status
                </label>
                <select
                  value={listingStatus}
                  onChange={(e) => setListingStatus(e.target.value)}
                  className="w-full text-sm px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-blue bg-white font-bold text-slate-800"
                >
                  <option value="AVAILABLE">AVAILABLE (Active)</option>
                  <option value="SOLD">SOLD (Archived)</option>
                </select>
              </div>
            </div>

            {/* Technical Description */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Technical Description & Configuration <span className="text-red-500">*</span>
              </label>
              <textarea
                required
                rows={5}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Include details such as Year of Manufacture, Modules (Pump, Autosampler, Detector), Software licenses included, Calibration history, and physical condition..."
                className="w-full text-sm p-4 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-blue"
              />
            </div>
          </div>

          {/* Photo Management */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">
                  Photos & Media ({photos.length}/10)
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Add clear photos of the nameplate, serial number, modules, and front panel.
                </p>
              </div>
            </div>

            {/* Photo Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 pt-2">
              {photos.map((url, idx) => (
                <div
                  key={idx}
                  className="relative group aspect-square rounded-xl overflow-hidden border border-slate-200 bg-slate-100 shadow-2xs"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={url}
                    alt={`Photo ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removePhoto(idx)}
                    className="absolute top-1.5 right-1.5 w-7 h-7 bg-red-600/90 hover:bg-red-700 text-white rounded-full flex items-center justify-center shadow-md transition-transform hover:scale-110"
                    title="Remove photo"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  {idx === 0 && (
                    <span className="absolute bottom-1.5 left-1.5 bg-slate-900/80 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                      Cover Photo
                    </span>
                  )}
                </div>
              ))}

              {photos.length < 10 && (
                <label className="border-2 border-dashed border-slate-300 hover:border-brand-blue rounded-xl flex flex-col items-center justify-center p-4 cursor-pointer hover:bg-brand-blue-50/30 transition-colors aspect-square text-center">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploading}
                    className="hidden"
                  />
                  {uploading ? (
                    <Loader2 className="w-6 h-6 text-brand-blue animate-spin" />
                  ) : (
                    <>
                      <Upload className="w-6 h-6 text-slate-400 group-hover:text-brand-blue mb-1" />
                      <span className="text-xs font-bold text-slate-600">
                        Upload Photos
                      </span>
                      <span className="text-[10px] text-slate-400 mt-0.5">
                        PNG, JPG up to 10MB
                      </span>
                    </>
                  )}
                </label>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-2">
            <Link
              href="/dashboard"
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving || uploading}
              className="px-6 py-2.5 rounded-xl bg-brand-gold hover:bg-brand-gold-500 text-brand-blue-950 text-xs font-black shadow-xs transition-colors flex items-center space-x-2 disabled:opacity-50"
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{saving ? "Saving Changes..." : "Save Listing Updates"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
