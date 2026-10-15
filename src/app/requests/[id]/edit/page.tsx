"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
  FileQuestion,
  Lock,
  ArrowRight,
  Info,
  Wrench,
  Clock,
  ArrowLeft,
  Loader2,
  ShieldAlert,
  CheckCircle2,
  AlertCircle,
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

export default function EditRequirementPage() {
  const { data: session, status: authStatus } = useSession();
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [initialLoading, setInitialLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // Requirement fields
  const [itemType, setItemType] = useState<"MACHINE" | "SPARE_PART">("MACHINE");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [compatibleWith, setCompatibleWith] = useState("");
  const [partNumber, setPartNumber] = useState("");
  const [description, setDescription] = useState("");
  const [reqStatus, setReqStatus] = useState("OPEN");
  const [wasApproved, setWasApproved] = useState(false);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [successResult, setSuccessResult] = useState<{
    requiresReapproval: boolean;
    message: string;
  } | null>(null);

  // Fetch requirement details
  useEffect(() => {
    if (!id) return;

    async function loadRequirement() {
      try {
        setInitialLoading(true);
        const res = await fetch(`/api/requirements/${id}`);
        if (!res.ok) {
          throw new Error("Failed to load requirement or unauthorized access.");
        }
        const data = await res.json();
        const r = data.requirement;
        if (!r) {
          throw new Error("Requirement not found.");
        }

        setIsOwner(data.isOwner);
        setIsAdmin(data.isAdmin);

        setItemType(r.itemType === "SPARE_PART" ? "SPARE_PART" : "MACHINE");
        setTitle(r.title || "");
        setCategory(r.category || CATEGORIES[0]);
        setCompatibleWith(r.compatibleWith || "");
        setPartNumber(r.partNumber || "");
        setDescription(r.description || "");
        setReqStatus(r.status || "OPEN");
        setWasApproved(!!r.isApproved);
      } catch (err: any) {
        setError(err.message || "Failed to load requirement details");
      } finally {
        setInitialLoading(false);
      }
    }

    if (authStatus === "authenticated") {
      loadRequirement();
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
            Please sign in to edit your equipment or spare part request.
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
            You do not have permission to edit this requirement. Only the request owner or administrator can edit details.
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);

    try {
      const payload = {
        title: title.trim(),
        category,
        itemType,
        partNumber: partNumber?.trim() || null,
        compatibleWith: compatibleWith?.trim() || null,
        description: description.trim(),
        status: reqStatus,
      };

      const res = await fetch(`/api/requirements/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to save requirement changes");
        setSaving(false);
        return;
      }

      setSuccessResult({
        requiresReapproval: !!data.requiresReapproval,
        message: data.message,
      });
      setSaving(false);
    } catch (err: any) {
      setError("Network error. Please try again.");
      setSaving(false);
    }
  };

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
              : "Request Updated Successfully"}
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
                  Our procurement team reviews buyer request edits before they are broadcasted to matching sellers across India. You will receive an on-site notification once your request is re-approved.
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
              href={`/requests/${id}`}
              className="flex-1 py-3 px-4 rounded-xl font-bold text-sm text-white bg-brand-blue hover:bg-brand-blue-500 transition-colors text-center shadow-xs"
            >
              Preview Request
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
            href={`/requests/${id}`}
            className="text-xs font-semibold text-brand-blue hover:underline"
          >
            View Live Request
          </Link>
        </div>

        {/* Header */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-brand-blue/10 text-brand-blue flex items-center justify-center font-bold">
              <FileQuestion className="w-5 h-5 text-brand-blue" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900">
                Edit Buyer Request
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Update requested instrument requirements or spare part specifications.
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
                  ? "As an administrator, changes made here will update immediately without secondary review."
                  : "Modifying request details will temporarily set this requirement to Pending Admin Approval until verified by our Deal Desk."}
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
              Requirement Specifications
            </h2>

            {/* Type Toggle */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                Request Type
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setItemType("MACHINE");
                    if (category === "Spare Parts & Consumables") {
                      setCategory(CATEGORIES[0]);
                    }
                  }}
                  className={`py-3 px-4 rounded-xl border text-xs font-bold transition-all flex items-center justify-center space-x-2 ${
                    itemType === "MACHINE"
                      ? "bg-brand-blue text-white border-brand-blue shadow-xs"
                      : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <span>Complete Laboratory Instrument</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setItemType("SPARE_PART");
                    setCategory("Spare Parts & Consumables");
                  }}
                  className={`py-3 px-4 rounded-xl border text-xs font-bold transition-all flex items-center justify-center space-x-2 ${
                    itemType === "SPARE_PART"
                      ? "bg-brand-blue text-white border-brand-blue shadow-xs"
                      : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <Wrench className="w-3.5 h-3.5" />
                  <span>Spare Part / Sub-Module / Detector</span>
                </button>
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Requirement Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Seeking Shimadzu Prominence HPLC with UV-Vis Detector"
                className="w-full text-sm px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-blue"
              />
            </div>

            {/* Category and Status */}
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
                  Requirement Status
                </label>
                <select
                  value={reqStatus}
                  onChange={(e) => setReqStatus(e.target.value)}
                  className="w-full text-sm px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-blue bg-white font-bold text-slate-800"
                >
                  <option value="OPEN">OPEN (Looking to procure)</option>
                  <option value="FULFILLED">FULFILLED (Procurement completed)</option>
                </select>
              </div>
            </div>

            {/* Spare Part Details */}
            {itemType === "SPARE_PART" && (
              <div className="p-4 bg-brand-blue-50/50 rounded-xl border border-brand-blue-100 space-y-4">
                <div className="flex items-center space-x-2 text-xs font-bold text-brand-blue-900">
                  <Wrench className="w-4 h-4 text-brand-blue" />
                  <span>Spare Part Specific Details</span>
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

            {/* Description */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Technical Specifications & Procurement Notes <span className="text-red-500">*</span>
              </label>
              <textarea
                required
                rows={5}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Mention required detector wavelengths, software versions, auto-sampler vial tray size, preferred brand or OEM, and desired procurement timeline..."
                className="w-full text-sm p-4 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-blue"
              />
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
              disabled={saving}
              className="px-6 py-2.5 rounded-xl bg-brand-gold hover:bg-brand-gold-500 text-brand-blue-950 text-xs font-black shadow-xs transition-colors flex items-center space-x-2 disabled:opacity-50"
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{saving ? "Saving Changes..." : "Save Requirement Updates"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
