"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
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
  CheckCircle2,
  Loader2,
  Wrench,
  Bell,
  CheckCheck,
  Pencil,
  MessageSquare,
  ArrowRight,
  Inbox,
  Send,
} from "lucide-react";

function DashboardContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  const rawTab = searchParams.get("tab");
  const initialTab =
    rawTab === "requests"
      ? "requests"
      : rawTab === "inquiries" || rawTab === "notifications" || rawTab === "messages"
      ? "inquiries"
      : "listings";

  const [profile, setProfile] = useState<any>(null);
  const [listings, setListings] = useState<any[]>([]);
  const [requirements, setRequirements] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [inquiries, setInquiries] = useState<{ received: any[]; sent: any[] }>({
    received: [],
    sent: [],
  });
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"listings" | "requests" | "inquiries">(initialTab);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Sync tab with URL search parameter
  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab === "requests") {
      setActiveTab("requests");
    } else if (tab === "inquiries" || tab === "notifications" || tab === "messages") {
      setActiveTab("inquiries");
    } else if (tab === "listings") {
      setActiveTab("listings");
    }
  }, [searchParams]);

  const switchTab = (tab: "listings" | "requests" | "inquiries") => {
    setActiveTab(tab);
    router.replace(`/dashboard?tab=${tab}`, { scroll: false });
  };

  useEffect(() => {
    if (session?.user) {
      loadUserData();
    }
  }, [session]);

  const loadUserData = async () => {
    setLoading(true);
    try {
      const [profRes, itemsRes, notifRes, inqRes] = await Promise.all([
        fetch("/api/user/profile"),
        fetch("/api/user/my-items"),
        fetch("/api/notifications"),
        fetch("/api/inquiries"),
      ]);

      const profData = await profRes.json();
      const itemsData = await itemsRes.json();
      const notifData = await notifRes.json();
      const inqData = await inqRes.json();

      if (profData?.user) setProfile(profData.user);
      if (itemsData?.listings) setListings(itemsData.listings);
      if (itemsData?.requirements) setRequirements(itemsData.requirements);
      if (notifData?.notifications) {
        setNotifications(notifData.notifications);
        setUnreadCount(notifData.unreadCount || 0);
      }
      if (inqData?.received || inqData?.sent) {
        setInquiries({
          received: inqData.received || [],
          sent: inqData.sent || [],
        });
      }
    } catch (err) {
      console.error("Dashboard error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ all: true }),
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error("Error marking all read:", err);
    }
  };

  const handleUpdateListingStatus = async (id: string, newStatus: string) => {
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/listings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (res.ok) {
        setListings((prev) =>
          prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
        );
      } else {
        alert(data.error || "Failed to update status");
      }
    } catch (err) {
      alert("Error updating listing status");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleUpdateRequirementStatus = async (id: string, newStatus: string) => {
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/requirements/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (res.ok) {
        setRequirements((prev) =>
          prev.map((req) => (req.id === id ? { ...req, status: newStatus } : req))
        );
      } else {
        alert(data.error || "Failed to update status");
      }
    } catch (err) {
      alert("Error updating requirement status");
    } finally {
      setUpdatingId(null);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-brand-blue border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center border border-slate-200">
          <Lock className="w-12 h-12 text-brand-blue mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-900">Sign In Required</h2>
          <p className="text-sm text-slate-600 mt-2">
            Please sign in to view your dashboard, active listings, and equipment requests.
          </p>
          <Link
            href="/auth/signin"
            className="mt-6 inline-flex items-center justify-center w-full py-2.5 px-4 rounded-xl text-white font-semibold bg-brand-blue hover:bg-brand-blue-500 transition-colors text-sm shadow-xs"
          >
            Sign In with Email or Google
          </Link>
        </div>
      </div>
    );
  }

  const totalInquiriesAndNotifications =
    inquiries.received.length + inquiries.sent.length + notifications.length;

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* User Profile Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-2xl bg-brand-blue text-white font-black text-2xl flex items-center justify-center shadow-md">
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

          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              href="/listings/create"
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-brand-gold hover:bg-brand-gold-500 text-brand-blue-950 text-xs font-bold rounded-xl transition-colors shadow-xs"
            >
              <PlusCircle className="w-3.5 h-3.5 text-brand-blue-900" />
              <span>List Machine</span>
            </Link>
            <Link
              href="/listings/create?type=spare_part"
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-slate-100 hover:bg-brand-blue-50 hover:text-brand-blue text-slate-800 text-xs font-bold rounded-xl transition-colors border border-slate-200 shadow-xs"
            >
              <Wrench className="w-3.5 h-3.5 text-brand-blue" />
              <span>List Spare Part</span>
            </Link>
            <Link
              href="/requests/create"
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-brand-blue hover:bg-brand-blue-500 text-white text-xs font-bold rounded-xl transition-colors shadow-xs"
            >
              <FileQuestion className="w-3.5 h-3.5" />
              <span>Post Request</span>
            </Link>
          </div>
        </div>

        {/* Privacy Notice Banner */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-2xl p-5 flex items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-brand-gold/20 text-brand-gold flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-brand-gold uppercase tracking-wider">
                Full Privacy Guarantee Active
              </h4>
              <p className="text-xs text-slate-300 mt-0.5">
                Your personal phone number and email remain private. Inquiries and deal
                notifications are managed securely through your dashboard.
              </p>
            </div>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2">
          <button
            type="button"
            onClick={() => switchTab("listings")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "listings"
                ? "bg-brand-blue text-white shadow-xs"
                : "bg-white text-slate-600 hover:bg-slate-200"
            }`}
          >
            My Listed Equipment ({listings.length})
          </button>
          <button
            type="button"
            onClick={() => switchTab("requests")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "requests"
                ? "bg-brand-blue text-white shadow-xs"
                : "bg-white text-slate-600 hover:bg-slate-200"
            }`}
          >
            My Machine Requests ({requirements.length})
          </button>
          <button
            type="button"
            onClick={() => switchTab("inquiries")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
              activeTab === "inquiries"
                ? "bg-brand-blue text-white shadow-xs"
                : "bg-white text-slate-600 hover:bg-slate-200"
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Inquiries & Messages ({totalInquiriesAndNotifications})</span>
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                {unreadCount}
              </span>
            )}
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
                  on LabMatrix and connect with verified buyers across India.
                </p>
                <Link
                  href="/listings/create"
                  className="mt-5 inline-flex items-center space-x-1.5 px-4 py-2 bg-brand-gold hover:bg-brand-gold-500 text-brand-blue-950 text-xs font-bold rounded-xl shadow-xs transition-colors"
                >
                  <PlusCircle className="w-4 h-4 text-brand-blue-900" />
                  <span>List Your First Machine</span>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {listings.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-slate-300 transition-colors"
                  >
                    <div className="space-y-3">
                      {/* Top Badges */}
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center space-x-1.5">
                          <span className="font-bold text-brand-blue-700 bg-brand-blue-50 border border-brand-blue-100/60 px-2.5 py-1 rounded-md text-xs">
                            {item.category}
                          </span>
                          {item.itemType === "SPARE_PART" && (
                            <span className="bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded text-[10px] font-bold">
                              ⚙️ Spare Part
                            </span>
                          )}
                        </div>
                        {item.isApproved ? (
                          <span className="inline-flex items-center space-x-1 text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-md">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Approved & Live</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center space-x-1 text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-md">
                            <Clock className="w-3.5 h-3.5 text-amber-600" />
                            <span>Pending Admin Approval</span>
                          </span>
                        )}
                      </div>

                      <div>
                        <h3 className="font-bold text-slate-900 text-base leading-snug">
                          {item.title}
                        </h3>
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                          {item.description}
                        </p>
                      </div>

                      {!item.isApproved && (
                        <div className="p-2.5 bg-amber-50/70 border border-amber-200/80 rounded-xl text-[11px] text-amber-800 flex items-start space-x-1.5">
                          <Clock className="w-3.5 h-3.5 text-amber-600 flex-shrink-0 mt-0.5" />
                          <span>Under admin review. Once approved, it will appear publicly on the marketplace.</span>
                        </div>
                      )}
                    </div>

                    <div className="pt-3 border-t border-slate-100 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-[10px] text-slate-400 block font-semibold">
                            Price Expectation:
                          </span>
                          <span className="text-sm font-black text-slate-900">
                            ₹{item.minPrice.toLocaleString("en-IN")} - ₹{item.maxPrice.toLocaleString("en-IN")}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Link
                            href={`/listings/${item.id}/edit`}
                            className="inline-flex items-center space-x-1 text-xs font-bold text-slate-700 hover:text-brand-blue bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-lg transition-colors border border-slate-200"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                            <span>Edit</span>
                          </Link>
                          <Link
                            href={`/listings/${item.id}`}
                            className="inline-flex items-center space-x-1 text-xs font-semibold text-brand-blue hover:text-brand-blue-500 hover:underline"
                          >
                            <span>View</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </div>

                      {/* Status toggle for listing owner */}
                      <div className="flex items-center justify-between pt-2 border-t border-slate-100/80 text-xs">
                        <label className="text-xs font-semibold text-slate-600">
                          Machine Status:
                        </label>
                        <div className="flex items-center space-x-2">
                          <select
                            value={item.status}
                            onChange={(e) => handleUpdateListingStatus(item.id, e.target.value)}
                            disabled={updatingId === item.id}
                            className={`text-xs font-bold rounded-lg px-2.5 py-1 border transition-colors cursor-pointer ${
                              item.status === "AVAILABLE"
                                ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                                : "bg-slate-100 text-slate-700 border-slate-300"
                            }`}
                          >
                            <option value="AVAILABLE" className="text-slate-900 bg-white">AVAILABLE</option>
                            <option value="SOLD" className="text-slate-900 bg-white">SOLD</option>
                          </select>
                          {updatingId === item.id && (
                            <Loader2 className="w-3.5 h-3.5 text-brand-blue animate-spin" />
                          )}
                        </div>
                      </div>
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
                  and verified suppliers will respond with matching inventory.
                </p>
                <Link
                  href="/requests/create"
                  className="mt-5 inline-flex items-center space-x-1.5 px-4 py-2 bg-brand-gold hover:bg-brand-gold-500 text-brand-blue-950 text-xs font-bold rounded-xl shadow-xs transition-colors"
                >
                  <PlusCircle className="w-4 h-4 text-brand-blue-900" />
                  <span>Post First Requirement</span>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {requirements.map((req) => (
                  <div
                    key={req.id}
                    className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-slate-300 transition-colors"
                  >
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center space-x-2 text-xs">
                          <span className="font-bold text-brand-blue-700 bg-brand-blue-50 border border-brand-blue-100/60 px-2.5 py-1 rounded-md">
                            {req.category}
                          </span>
                          {req.itemType === "SPARE_PART" && (
                            <span className="bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded text-[10px] font-bold">
                              ⚙️ Spare Part
                            </span>
                          )}
                          <span className="text-slate-400">•</span>
                          <span className="text-slate-500 text-xs">
                            Posted on {new Date(req.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        {req.isApproved ? (
                          <span className="inline-flex items-center space-x-1 text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-md">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Approved & Live</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center space-x-1 text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-md">
                            <Clock className="w-3.5 h-3.5 text-amber-600" />
                            <span>Pending Admin Approval</span>
                          </span>
                        )}
                      </div>

                      <div>
                        <h3 className="font-bold text-slate-900 text-base leading-snug">
                          {req.title}
                        </h3>
                        <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                          {req.description}
                        </p>
                      </div>

                      {!req.isApproved && (
                        <div className="p-2.5 bg-amber-50/70 border border-amber-200/80 rounded-xl text-[11px] text-amber-800 flex items-start space-x-1.5">
                          <Clock className="w-3.5 h-3.5 text-amber-600 flex-shrink-0 mt-0.5" />
                          <span>Under admin review. Once approved, it will be visible for matching suppliers.</span>
                        </div>
                      )}
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center space-x-2">
                        <label className="text-xs font-semibold text-slate-600">
                          Request Status:
                        </label>
                        <div className="flex items-center space-x-2">
                          <select
                            value={req.status}
                            onChange={(e) => handleUpdateRequirementStatus(req.id, e.target.value)}
                            disabled={updatingId === req.id}
                            className={`text-xs font-bold rounded-lg px-2.5 py-1 border transition-colors cursor-pointer ${
                              req.status === "OPEN"
                                ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                                : "bg-slate-100 text-slate-700 border-slate-300"
                            }`}
                          >
                            <option value="OPEN" className="text-slate-900 bg-white">OPEN (Looking)</option>
                            <option value="FULFILLED" className="text-slate-900 bg-white">FULFILLED (Purchased)</option>
                          </select>
                          {updatingId === req.id && (
                            <Loader2 className="w-3.5 h-3.5 text-brand-blue animate-spin" />
                          )}
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 self-start sm:self-auto">
                        <Link
                          href={`/requests/${req.id}/edit`}
                          className="inline-flex items-center space-x-1 text-xs font-bold text-slate-700 hover:text-brand-blue bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-lg transition-colors border border-slate-200"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </Link>
                        <Link
                          href={`/requests/${req.id}`}
                          className="inline-flex items-center space-x-1 text-xs font-semibold text-brand-blue hover:text-brand-blue-500 hover:underline"
                        >
                          <span>View</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Inquiries & Messages */}
        {activeTab === "inquiries" && (
          <div className="space-y-6">
            {/* Header with Mark all read button */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                  <MessageSquare className="w-4 h-4 text-brand-blue" />
                  <span>Inquiries, Messages & Activity</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Track direct buyer inquiries, listing reviews, and marketplace transactions coordinated by the Deal Desk.
                </p>
              </div>

              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-brand-blue-700 bg-brand-blue-50 hover:bg-brand-blue-100 transition-colors"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span>Mark all as read</span>
                </button>
              )}
            </div>

            {/* Inquiries Received on Your Equipment */}
            {inquiries.received.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Inbox className="w-4 h-4 text-brand-blue" />
                  <h3 className="text-sm font-bold text-slate-900">
                    Inquiries Received on Your Equipment ({inquiries.received.length})
                  </h3>
                </div>

                <div className="space-y-3">
                  {inquiries.received.map((inq: any) => (
                    <div
                      key={inq.id}
                      className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3 hover:border-slate-300 transition-colors"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-bold text-brand-blue bg-brand-blue-50 border border-brand-blue-100 px-2.5 py-0.5 rounded-md">
                            {inq.listing ? "Machine Listing" : "Buyer Request"}
                          </span>
                          <span className="text-xs font-bold text-slate-900">
                            {inq.listing?.title || inq.requirement?.title || "Item"}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                              inq.status === "NEW"
                                ? "bg-amber-50 text-amber-800 border border-amber-200"
                                : inq.status === "IN_PROGRESS"
                                ? "bg-brand-blue-50 text-brand-blue-700 border border-brand-blue-200"
                                : "bg-slate-100 text-slate-600 border border-slate-200"
                            }`}
                          >
                            {inq.status === "NEW"
                              ? "New Inquiry"
                              : inq.status === "IN_PROGRESS"
                              ? "In Coordination"
                              : "Closed"}
                          </span>
                          <span className="text-[11px] text-slate-400">
                            {new Date(inq.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-700 leading-relaxed border border-slate-100">
                        <span className="font-semibold text-slate-900 block mb-0.5">
                          Buyer Message / Offer:
                        </span>
                        {inq.message}
                      </div>

                      <div className="flex items-center justify-between pt-1 text-xs">
                        <span className="text-[11px] text-slate-500">
                          🔒 Direct Deal Desk coordination active. Our broker coordinates terms with the buyer.
                        </span>
                        {inq.listing?.id && (
                          <Link
                            href={`/listings/${inq.listing.id}`}
                            className="inline-flex items-center space-x-1 font-semibold text-brand-blue hover:underline"
                          >
                            <span>View Listing</span>
                            <ExternalLink className="w-3 h-3" />
                          </Link>
                        )}
                        {inq.requirement?.id && (
                          <Link
                            href={`/requests/${inq.requirement.id}`}
                            className="inline-flex items-center space-x-1 font-semibold text-brand-blue hover:underline"
                          >
                            <span>View Request</span>
                            <ExternalLink className="w-3 h-3" />
                          </Link>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Inquiries Sent by User */}
            {inquiries.sent.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Send className="w-4 h-4 text-brand-blue" />
                  <h3 className="text-sm font-bold text-slate-900">
                    Inquiries Sent by You ({inquiries.sent.length})
                  </h3>
                </div>

                <div className="space-y-3">
                  {inquiries.sent.map((inq: any) => (
                    <div
                      key={inq.id}
                      className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3 hover:border-slate-300 transition-colors"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-bold text-slate-700 bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded-md">
                            Target: {inq.listing ? "Equipment" : "Request"}
                          </span>
                          <span className="text-xs font-bold text-slate-900">
                            {inq.listing?.title || inq.requirement?.title || "Item"}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                              inq.status === "NEW"
                                ? "bg-amber-50 text-amber-800 border border-amber-200"
                                : inq.status === "IN_PROGRESS"
                                ? "bg-brand-blue-50 text-brand-blue-700 border border-brand-blue-200"
                                : "bg-slate-100 text-slate-600 border border-slate-200"
                            }`}
                          >
                            {inq.status === "NEW"
                              ? "In Review"
                              : inq.status === "IN_PROGRESS"
                              ? "In Coordination"
                              : "Closed"}
                          </span>
                          <span className="text-[11px] text-slate-400">
                            {new Date(inq.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-700 leading-relaxed border border-slate-100">
                        <span className="font-semibold text-slate-900 block mb-0.5">
                          Your Inquiry Message:
                        </span>
                        {inq.message}
                      </div>

                      <div className="flex items-center justify-end pt-1 text-xs">
                        {inq.listing?.id && (
                          <Link
                            href={`/listings/${inq.listing.id}`}
                            className="inline-flex items-center space-x-1 font-semibold text-brand-blue hover:underline"
                          >
                            <span>View Listing</span>
                            <ExternalLink className="w-3 h-3" />
                          </Link>
                        )}
                        {inq.requirement?.id && (
                          <Link
                            href={`/requests/${inq.requirement.id}`}
                            className="inline-flex items-center space-x-1 font-semibold text-brand-blue hover:underline"
                          >
                            <span>View Request</span>
                            <ExternalLink className="w-3 h-3" />
                          </Link>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Notifications Feed */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Bell className="w-4 h-4 text-brand-blue" />
                <h3 className="text-sm font-bold text-slate-900">
                  Activity & Verification Alerts ({notifications.length})
                </h3>
              </div>

              {notifications.length === 0 &&
              inquiries.received.length === 0 &&
              inquiries.sent.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
                  <MessageSquare className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                  <h3 className="text-base font-bold text-slate-800">
                    No inquiries or notifications yet
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    When buyers submit inquiries on your listed equipment or your items get reviewed by our Deal Desk, they will appear here.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {notifications.map((item) => {
                    const isApproved = item.type === "ENTRY_APPROVED";
                    const isReview = item.type === "ENTRY_PENDING";
                    return (
                      <div
                        key={item.id}
                        className={`bg-white rounded-2xl border p-5 shadow-xs transition-colors flex items-start space-x-4 ${
                          !item.isRead
                            ? "border-brand-blue-200 bg-brand-blue-50/30"
                            : "border-slate-200"
                        }`}
                      >
                        <div className="flex-shrink-0 mt-0.5">
                          {isApproved ? (
                            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-xs">
                              <CheckCircle2 className="w-5 h-5" />
                            </div>
                          ) : isReview ? (
                            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shadow-xs">
                              <Clock className="w-5 h-5" />
                            </div>
                          ) : (
                            <div className="w-10 h-10 rounded-xl bg-brand-blue-50 text-brand-blue flex items-center justify-center shadow-xs">
                              <Bell className="w-5 h-5" />
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <h4 className="text-sm font-bold text-slate-900">
                              {item.title}
                            </h4>
                            <span className="text-[11px] text-slate-400">
                              {new Date(item.createdAt).toLocaleString("en-IN", {
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                            {item.message}
                          </p>

                          {item.link && (
                            <div className="mt-3">
                              <Link
                                href={item.link}
                                className="inline-flex items-center space-x-1.5 text-xs font-bold text-brand-blue hover:text-brand-blue-500 hover:underline"
                              >
                                <span>View Details</span>
                                <ExternalLink className="w-3.5 h-3.5" />
                              </Link>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function UserDashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-brand-blue border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}
