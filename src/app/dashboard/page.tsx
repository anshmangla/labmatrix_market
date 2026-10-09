"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  Tag,
  FileQuestion,
  PlusCircle,
  Clock,
  ExternalLink,
  ShieldCheck,
  User,
  Phone,
  Building,
  Mail,
  Lock,
} from "lucide-react";

export default function UserDashboardPage() {
  const { data: session, status } = useSession();
  const [profile, setProfile] = useState<any>(null);
  const [listings, setListings] = useState<any[]>([]);
  const [requirements, setRequirements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"listings" | "requests">("listings");

  useEffect(() => {
    if (session?.user) {
      loadUserData();
    }
  }, [session]);

  const loadUserData = async () => {
    setLoading(true);
    try {
      const [profRes, itemsRes] = await Promise.all([
        fetch("/api/user/profile"),
        fetch("/api/user/my-items"),
      ]);

      const profData = await profRes.json();
      const itemsData = await itemsRes.json();

      if (profData?.user) setProfile(profData.user);
      if (itemsData?.listings) setListings(itemsData.listings);
      if (itemsData?.requirements) setRequirements(itemsData.requirements);
    } catch (err) {
      console.error("Dashboard error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center border border-slate-200">
          <Lock className="w-12 h-12 text-teal-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-900">Sign In Required</h2>
          <p className="text-sm text-slate-600 mt-2">
            Please sign in to view your dashboard, active listings, and equipment
            requests.
          </p>
          <Link
            href="/auth/signin"
            className="mt-6 inline-flex items-center justify-center w-full py-2.5 px-4 rounded-xl text-white font-semibold bg-teal-600 hover:bg-teal-700 transition-colors text-sm"
          >
            Sign In with Email or Google
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* User Profile Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-2xl bg-teal-600 text-white font-black text-2xl flex items-center justify-center shadow-md">
              {session?.user?.name?.[0]?.toUpperCase() ||
                session?.user?.email?.[0]?.toUpperCase() ||
                "U"}
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900">
                {profile?.name || session?.user?.name || "Laboratory Client"}
              </h1>
              <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-slate-500">
                <span className="flex items-center">
                  <Mail className="w-3.5 h-3.5 mr-1 text-slate-400" />
                  {profile?.email || session?.user?.email}
                </span>
                <span>•</span>
                <span className="flex items-center">
                  <Phone className="w-3.5 h-3.5 mr-1 text-slate-400" />
                  {profile?.phoneNumber || (
                    <span className="text-amber-600">No mobile on file yet</span>
                  )}
                </span>
                {profile?.companyName && (
                  <>
                    <span>•</span>
                    <span className="flex items-center">
                      <Building className="w-3.5 h-3.5 mr-1 text-slate-400" />
                      {profile.companyName}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/listings/create"
              className="inline-flex items-center space-x-1.5 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl transition-colors shadow-xs"
            >
              <PlusCircle className="w-4 h-4" />
              <span>List Machine</span>
            </Link>
            <Link
              href="/requests/create"
              className="inline-flex items-center space-x-1.5 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors shadow-xs"
            >
              <FileQuestion className="w-4 h-4" />
              <span>Post Request</span>
            </Link>
          </div>
        </div>

        {/* Confidentiality Reminder Banner */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-2xl p-5 flex items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-teal-400 uppercase tracking-wider">
                Full Privacy Guarantee Active
              </h4>
              <p className="text-xs text-slate-300 mt-0.5">
                Your name, phone number, and company are shielded from public
                view on all items below. Only the platform administrator coordinates deals.
              </p>
            </div>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex space-x-2 border-b border-slate-200 pb-2">
          <button
            type="button"
            onClick={() => setActiveTab("listings")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "listings"
                ? "bg-teal-600 text-white shadow-xs"
                : "bg-white text-slate-600 hover:bg-slate-200"
            }`}
          >
            My Listed Equipment ({listings.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("requests")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "requests"
                ? "bg-teal-600 text-white shadow-xs"
                : "bg-white text-slate-600 hover:bg-slate-200"
            }`}
          >
            My Machine Requests ({requirements.length})
          </button>
        </div>

        {/* Tab 1: Listings */}
        {activeTab === "listings" && (
          <div className="space-y-4">
            {listings.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
                <Tag className="w-10 h-10 text-slate-400 mx-auto mb-3" />
                <h3 className="text-base font-bold text-slate-800">
                  You haven&apos;t listed any machines yet
                </h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Have surplus HPLC, GC-MS, or testing instruments? List them
                  confidentially and let our brokerage desk find buyers for you.
                </p>
                <Link
                  href="/listings/create"
                  className="mt-5 inline-flex items-center space-x-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>List Your First Machine</span>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {listings.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between space-y-4"
                  >
                    <div>
                      <div className="flex items-center justify-between text-xs mb-2">
                        <span className="font-bold text-teal-600 bg-teal-50 px-2 py-0.5 rounded">
                          {item.category}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                            item.status === "AVAILABLE"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {item.status}
                        </span>
                      </div>
                      <h3 className="font-bold text-slate-900 text-base">
                        {item.title}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                        {item.description}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-slate-400 block">
                          Price Expectation:
                        </span>
                        <span className="text-sm font-black text-slate-900">
                          ₹{item.minPrice.toLocaleString("en-IN")} - ₹
                          {item.maxPrice.toLocaleString("en-IN")}
                        </span>
                      </div>
                      <Link
                        href={`/listings/${item.id}`}
                        className="inline-flex items-center space-x-1 text-xs font-semibold text-teal-600 hover:underline"
                      >
                        <span>View Public Page</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Requests */}
        {activeTab === "requests" && (
          <div className="space-y-4">
            {requirements.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
                <FileQuestion className="w-10 h-10 text-slate-400 mx-auto mb-3" />
                <h3 className="text-base font-bold text-slate-800">
                  No equipment requests posted yet
                </h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Looking for a specific testing machine? Post your requirement
                  and our broker network will locate matching inventory.
                </p>
                <Link
                  href="/requests/create"
                  className="mt-5 inline-flex items-center space-x-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Post First Requirement</span>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {requirements.map((req) => (
                  <div
                    key={req.id}
                    className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2 text-xs">
                        <span className="font-bold text-teal-600 bg-teal-50 px-2 py-0.5 rounded">
                          {req.category}
                        </span>
                        <span className="text-slate-400">•</span>
                        <span className="text-slate-500">
                          Posted on {new Date(req.createdAt).toLocaleDateString()}
                        </span>
                        <span className="text-slate-400">•</span>
                        <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-bold text-[10px]">
                          {req.status}
                        </span>
                      </div>
                      <h3 className="font-bold text-slate-900 text-base">
                        {req.title}
                      </h3>
                      <p className="text-xs text-slate-600 line-clamp-1">
                        {req.description}
                      </p>
                    </div>

                    <Link
                      href={`/requests/${req.id}`}
                      className="inline-flex items-center space-x-1 text-xs font-semibold text-teal-600 hover:underline self-start sm:self-auto flex-shrink-0"
                    >
                      <span>View Requirement</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
