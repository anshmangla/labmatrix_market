"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  ShieldAlert,
  ShieldCheck,
  Phone,
  Mail,
  Building,
  CheckCircle2,
  Clock,
  ArrowRight,
  UserCheck,
  AlertCircle,
  FileQuestion,
  Layers,
  Inbox,
  Users,
  Tag,
  RefreshCw,
  ExternalLink,
  Trash2,
  Check,
  X,
} from "lucide-react";

export default function AdminDashboardPage() {
  const { data: session, status } = useSession();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [activeTab, setActiveTab] = useState<
    "inquiries" | "users" | "listings" | "requirements"
  >("inquiries");

  // Data states
  const [stats, setStats] = useState<any>(null);
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [listings, setListings] = useState<any[]>([]);
  const [requirements, setRequirements] = useState<any[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [tabLoading, setTabLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [claimSuccess, setClaimSuccess] = useState("");

  const sessionUserId = session?.user?.id;
  const sessionUserEmail = session?.user?.email;

  // 1. Initial admin verification - ONLY fires when authenticated user ID/email is known or unauthenticated
  useEffect(() => {
    if (status === "authenticated" && (sessionUserId || sessionUserEmail)) {
      checkAdminAccess();
    } else if (status === "unauthenticated") {
      setIsAdmin(false);
      setInitialLoading(false);
    }
  }, [sessionUserId, sessionUserEmail, status]);

  // 2. Tab data load - fires when admin rights confirmed or activeTab changes
  useEffect(() => {
    if (isAdmin) {
      loadTabData(activeTab);
    }
  }, [isAdmin, activeTab]);

  const checkAdminAccess = async () => {
    try {
      const statsRes = await fetch("/api/admin/stats");
      if (statsRes.status === 403 || statsRes.status === 401) {
        setIsAdmin(false);
        setInitialLoading(false);
        return;
      }

      const statsData = await statsRes.json();
      if (statsData?.stats) {
        setIsAdmin(true);
        setStats(statsData.stats);
      } else {
        setIsAdmin(false);
      }
    } catch (err) {
      console.error("Admin check error:", err);
      setIsAdmin(false);
    } finally {
      setInitialLoading(false);
    }
  };

  const loadTabData = async (tab: string) => {
    setTabLoading(true);
    try {
      if (tab === "inquiries") {
        const res = await fetch("/api/admin/inquiries");
        const data = await res.json();
        if (data?.inquiries) setInquiries(data.inquiries);
      } else if (tab === "users") {
        const res = await fetch("/api/admin/users");
        const data = await res.json();
        if (data?.users) setUsers(data.users);
      } else if (tab === "listings") {
        const res = await fetch("/api/admin/listings");
        const data = await res.json();
        if (data?.listings) setListings(data.listings);
      } else if (tab === "requirements") {
        const res = await fetch("/api/admin/requirements");
        const data = await res.json();
        if (data?.requirements) setRequirements(data.requirements);
      }
    } catch (err) {
      console.error(`Error loading ${tab} data:`, err);
    } finally {
      setTabLoading(false);
    }
  };

  const refreshAll = async () => {
    await checkAdminAccess();
    await loadTabData(activeTab);
  };

  const handleClaimAdmin = async () => {
    setActionLoading(true);
    setClaimSuccess("");
    try {
      const res = await fetch("/api/admin/promote", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setClaimSuccess(data.message);
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        alert(data.error || "Failed to claim admin status");
      }
    } catch (err) {
      alert("Error claiming admin role");
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateInquiryStatus = async (
    inquiryId: string,
    newStatus: string
  ) => {
    try {
      const res = await fetch(`/api/admin/inquiries/${inquiryId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setInquiries((prev) =>
          prev.map((inq) =>
            inq.id === inquiryId ? { ...inq, status: newStatus } : inq
          )
        );
      }
    } catch (err) {
      console.error("Update status error:", err);
    }
  };

  const handleUpdateListingStatus = async (
    listingId: string,
    newStatus: string
  ) => {
    try {
      const res = await fetch("/api/admin/listings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: listingId, status: newStatus }),
      });
      if (res.ok) {
        setListings((prev) =>
          prev.map((l) => (l.id === listingId ? { ...l, status: newStatus } : l))
        );
      }
    } catch (err) {
      console.error("Update listing status error:", err);
    }
  };

  const handleUpdateRequirementStatus = async (
    reqId: string,
    newStatus: string
  ) => {
    try {
      const res = await fetch("/api/admin/requirements", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: reqId, status: newStatus }),
      });
      if (res.ok) {
        setRequirements((prev) =>
          prev.map((r) => (r.id === reqId ? { ...r, status: newStatus } : r))
        );
      }
    } catch (err) {
      console.error("Update requirement status error:", err);
    }
  };

  const handleToggleListingApproval = async (
    listingId: string,
    currentApproved: boolean
  ) => {
    try {
      const newApproved = !currentApproved;
      const res = await fetch("/api/admin/listings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: listingId, isApproved: newApproved }),
      });
      if (res.ok) {
        setListings((prev) =>
          prev.map((l) => (l.id === listingId ? { ...l, isApproved: newApproved } : l))
        );
        setStats((prev: any) =>
          prev
            ? {
                ...prev,
                pendingApprovals: Math.max(0, prev.pendingApprovals + (newApproved ? -1 : 1)),
                pendingListings: Math.max(0, prev.pendingListings + (newApproved ? -1 : 1)),
              }
            : prev
        );
      } else {
        alert("Failed to update approval status");
      }
    } catch (err) {
      console.error("Toggle listing approval error:", err);
    }
  };

  const handleDeleteListing = async (listingId: string, title: string) => {
    if (!confirm(`Are you sure you want to permanently delete "${title}"? This cannot be undone.`)) {
      return;
    }
    try {
      const res = await fetch(`/api/admin/listings?id=${listingId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setListings((prev) => prev.filter((l) => l.id !== listingId));
        setStats((prev: any) =>
          prev
            ? {
                ...prev,
                totalListings: Math.max(0, prev.totalListings - 1),
              }
            : prev
        );
      } else {
        const data = await res.json();
        alert(data.error || "Failed to delete listing");
      }
    } catch (err) {
      console.error("Delete listing error:", err);
    }
  };

  const handleToggleRequirementApproval = async (
    reqId: string,
    currentApproved: boolean
  ) => {
    try {
      const newApproved = !currentApproved;
      const res = await fetch("/api/admin/requirements", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: reqId, isApproved: newApproved }),
      });
      if (res.ok) {
        setRequirements((prev) =>
          prev.map((r) => (r.id === reqId ? { ...r, isApproved: newApproved } : r))
        );
        setStats((prev: any) =>
          prev
            ? {
                ...prev,
                pendingApprovals: Math.max(0, prev.pendingApprovals + (newApproved ? -1 : 1)),
                pendingRequirements: Math.max(0, prev.pendingRequirements + (newApproved ? -1 : 1)),
              }
            : prev
        );
      } else {
        alert("Failed to update approval status");
      }
    } catch (err) {
      console.error("Toggle requirement approval error:", err);
    }
  };

  const handleDeleteRequirement = async (reqId: string, title: string) => {
    if (!confirm(`Are you sure you want to permanently delete "${title}"? This cannot be undone.`)) {
      return;
    }
    try {
      const res = await fetch(`/api/admin/requirements?id=${reqId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setRequirements((prev) => prev.filter((r) => r.id !== reqId));
        setStats((prev: any) =>
          prev
            ? {
                ...prev,
                totalRequirements: Math.max(0, prev.totalRequirements - 1),
              }
            : prev
        );
      } else {
        const data = await res.json();
        alert(data.error || "Failed to delete requirement");
      }
    } catch (err) {
      console.error("Delete requirement error:", err);
    }
  };

  const handleToggleUserRole = async (
    userId: string,
    currentRole: string,
    userName: string
  ) => {
    const newRole = currentRole === "ADMIN" ? "USER" : "ADMIN";
    const confirmMsg =
      newRole === "ADMIN"
        ? `Are you sure you want to promote "${userName}" to Platform Administrator? They will have full access to marketplace inquiries, client contacts, and moderation.`
        : `Are you sure you want to revoke Admin access from "${userName}"?`;

    if (!confirm(confirmMsg)) return;

    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role: newRole }),
      });
      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
        );
      } else {
        const data = await res.json();
        alert(data.error || "Failed to update user role");
      }
    } catch (err) {
      console.error("Update user role error:", err);
      alert("An error occurred while updating user role.");
    }
  };

  if (status === "loading" || initialLoading) {
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
          <ShieldAlert className="w-12 h-12 text-teal-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-900">Admin Area Restricted</h2>
          <p className="text-sm text-slate-600 mt-2">
            Please sign in to access the LabMatrix Admin Control Desk.
          </p>
          <Link
            href="/auth/signin"
            className="mt-6 inline-flex items-center justify-center w-full py-2.5 px-4 rounded-xl text-white font-semibold bg-teal-600 hover:bg-teal-700 transition-colors"
          >
            <span>Sign In to Continue</span>
          </Link>
        </div>
      </div>
    );
  }

  // Not an admin
  if (isAdmin === false) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center border border-slate-200 space-y-4">
          <ShieldAlert className="w-12 h-12 text-amber-500 mx-auto" />
          <h2 className="text-xl font-bold text-slate-900">
            Administrator Privileges Required
          </h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            Your current logged-in account (<strong>{session?.user?.email}</strong>)
            does not have the <code>ADMIN</code> role assigned.
          </p>

          {claimSuccess ? (
            <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 border border-emerald-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{claimSuccess} Reloading...</span>
            </div>
          ) : (
            <div className="pt-2">
              <button
                type="button"
                onClick={handleClaimAdmin}
                disabled={actionLoading}
                className="w-full py-2.5 px-4 bg-slate-900 hover:bg-teal-600 text-white font-bold rounded-xl text-xs transition-colors shadow-sm disabled:opacity-50"
              >
                {actionLoading
                  ? "Verifying & Promoting..."
                  : "Claim Platform Admin Role for this Account"}
              </button>
              <p className="text-[11px] text-slate-400 mt-2">
                (Allowed if no platform administrator has been designated yet)
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div>
            <div className="inline-flex items-center space-x-2 text-xs font-bold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-full mb-1">
              <ShieldCheck className="w-4 h-4" />
              <span>LabMatrix Operations Desk • Master Administrator View</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900">
              LabMatrix Operations & Deal Console
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Logged in as: <strong>{session?.user?.email}</strong>. Buyer and
              seller identities are visible only to you.
            </p>
          </div>

          <button
            onClick={() => refreshAll()}
            disabled={tabLoading}
            className="self-start sm:self-auto inline-flex items-center space-x-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${tabLoading ? "animate-spin text-teal-600" : ""}`} />
            <span>{tabLoading ? "Refreshing..." : "Refresh Data"}</span>
          </button>
        </div>

        {/* Stats Metric Cards */}
        {stats && (
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <div className={`p-5 rounded-2xl border shadow-xs flex items-center space-x-4 transition-colors ${
              (stats.pendingApprovals ?? 0) > 0
                ? "bg-amber-50/80 border-amber-300"
                : "bg-white border-slate-200"
            }`}>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                (stats.pendingApprovals ?? 0) > 0
                  ? "bg-amber-100 text-amber-700"
                  : "bg-slate-100 text-slate-500"
              }`}>
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs text-slate-600 font-bold uppercase tracking-wider block">
                  Pending Review
                </span>
                <span className="text-2xl font-black text-slate-900">
                  {stats.pendingApprovals ?? 0}
                </span>
                <span className="text-[11px] text-slate-500 block">
                  {stats.pendingListings ?? 0} listings • {stats.pendingRequirements ?? 0} reqs
                </span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center space-x-4">
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
                <Inbox className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider block">
                  New Inquiries
                </span>
                <span className="text-2xl font-black text-slate-900">
                  {stats.newInquiries}
                </span>
                <span className="text-[11px] text-slate-400 block">
                  ({stats.totalInquiries} total deals)
                </span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center space-x-4">
              <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center flex-shrink-0">
                <Tag className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider block">
                  Active Machines
                </span>
                <span className="text-2xl font-black text-slate-900">
                  {stats.totalListings}
                </span>
                <span className="text-[11px] text-slate-400 block">
                  Equipment listed
                </span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center space-x-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                <FileQuestion className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider block">
                  Buyer Requests
                </span>
                <span className="text-2xl font-black text-slate-900">
                  {stats.totalRequirements}
                </span>
                <span className="text-[11px] text-slate-400 block">
                  Instruments wanted
                </span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center space-x-4">
              <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center flex-shrink-0">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider block">
                  Total Users
                </span>
                <span className="text-2xl font-black text-slate-900">
                  {stats.totalUsers}
                </span>
                <span className="text-[11px] text-slate-400 block">
                  Registered clients
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex space-x-2 border-b border-slate-200 pb-2">
          <button
            onClick={() => setActiveTab("inquiries")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "inquiries"
                ? "bg-teal-600 text-white shadow-sm"
                : "bg-white text-slate-600 hover:bg-slate-200"
            }`}
          >
            Inquiries (Deal Desk)
          </button>
          <button
            onClick={() => setActiveTab("users")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "users"
                ? "bg-teal-600 text-white shadow-sm"
                : "bg-white text-slate-600 hover:bg-slate-200"
            }`}
          >
            Registered Users & Contacts
          </button>
          <button
            onClick={() => setActiveTab("listings")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
              activeTab === "listings"
                ? "bg-teal-600 text-white shadow-sm"
                : "bg-white text-slate-600 hover:bg-slate-200"
            }`}
          >
            <span>Manage Listings</span>
            {stats?.pendingListings > 0 && (
              <span className="bg-amber-500 text-white text-[10px] font-black px-1.5 py-0.2 rounded-full">
                {stats.pendingListings}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("requirements")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
              activeTab === "requirements"
                ? "bg-teal-600 text-white shadow-sm"
                : "bg-white text-slate-600 hover:bg-slate-200"
            }`}
          >
            <span>Manage Buyer Requests</span>
            {stats?.pendingRequirements > 0 && (
              <span className="bg-amber-500 text-white text-[10px] font-black px-1.5 py-0.2 rounded-full">
                {stats.pendingRequirements}
              </span>
            )}
          </button>
        </div>

        {/* TAB 1: INQUIRIES DEAL DESK */}
        {activeTab === "inquiries" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900">
                Marketplace Inquiry Pipeline
              </h2>
              <span className="text-xs text-slate-500">
                Directly coordinate between Buyer & Seller while keeping platform oversight.
              </span>
            </div>

            {tabLoading ? (
              <div className="bg-white rounded-2xl p-16 text-center border border-slate-200 flex flex-col items-center justify-center space-y-3">
                <div className="w-7 h-7 border-3 border-teal-600 border-t-transparent rounded-full animate-spin" />
                <span className="text-xs text-slate-500 font-semibold">
                  Loading deal pipeline...
                </span>
              </div>
            ) : inquiries.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center border border-slate-200 text-slate-500 text-xs">
                No inquiries submitted yet.
              </div>
            ) : (
              <div className="space-y-4">
                {inquiries.map((inq) => {
                  const hasListing = !!inq.listing;
                  const hasReq = !!inq.requirement;

                  return (
                    <div
                      key={inq.id}
                      className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4"
                    >
                      {/* Top Bar */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                        <div className="flex items-center space-x-2">
                          <span
                            className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                              inq.status === "NEW"
                                ? "bg-amber-100 text-amber-800"
                                : inq.status === "IN_PROGRESS"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-emerald-100 text-emerald-800"
                            }`}
                          >
                            {inq.status}
                          </span>
                          <span className="text-xs text-slate-400">
                            Logged on {new Date(inq.createdAt).toLocaleString()}
                          </span>
                        </div>

                        {/* Status updater */}
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-semibold text-slate-500">
                            Status:
                          </span>
                          <select
                            value={inq.status}
                            onChange={(e) =>
                              handleUpdateInquiryStatus(inq.id, e.target.value)
                            }
                            className="text-xs font-semibold bg-slate-50 border border-slate-300 rounded-lg px-2 py-1"
                          >
                            <option value="NEW">NEW</option>
                            <option value="IN_PROGRESS">IN_PROGRESS</option>
                            <option value="CLOSED">CLOSED</option>
                          </select>
                        </div>
                      </div>

                      {/* Equipment Item Being Discussed */}
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-teal-600 block">
                            {hasListing
                              ? "Machine Listing Inquiry"
                              : "Offer for Buyer Requirement"}
                          </span>
                          <h4 className="text-sm font-bold text-slate-900">
                            {hasListing
                              ? inq.listing.title
                              : inq.requirement?.title}
                          </h4>
                          {hasListing && (
                            <span className="text-xs font-semibold text-slate-600">
                              Price Target: ₹
                              {inq.listing.minPrice.toLocaleString("en-IN")} - ₹
                              {inq.listing.maxPrice.toLocaleString("en-IN")}
                            </span>
                          )}
                        </div>

                        {hasListing && (
                          <Link
                            href={`/listings/${inq.listing.id}`}
                            target="_blank"
                            className="text-xs font-semibold text-teal-600 hover:underline flex items-center"
                          >
                            <span>View Listing</span>
                            <ExternalLink className="w-3 h-3 ml-1" />
                          </Link>
                        )}
                      </div>

                      {/* Side-by-side Buyer & Seller Contacts */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Inquiring Party (Buyer or Offer Submitter) */}
                        <div className="bg-teal-50/50 p-4 rounded-xl border border-teal-100 space-y-2">
                          <span className="text-xs font-bold text-teal-800 uppercase tracking-wider block">
                            Interested Party (Inquirer)
                          </span>
                          <div className="space-y-1 text-xs text-slate-800">
                            <p className="font-bold text-slate-900">
                              {inq.inquirer.name || "Name not provided"}
                            </p>
                            <div className="flex items-center space-x-1 text-slate-600">
                              <Mail className="w-3.5 h-3.5 text-teal-600" />
                              <a
                                href={`mailto:${inq.inquirer.email}`}
                                className="hover:underline"
                              >
                                {inq.inquirer.email}
                              </a>
                            </div>
                            <div className="flex items-center space-x-1 text-slate-600">
                              <Phone className="w-3.5 h-3.5 text-teal-600" />
                              <a
                                href={`tel:${inq.inquirer.phoneNumber}`}
                                className="font-semibold text-teal-700 hover:underline"
                              >
                                {inq.inquirer.phoneNumber || "No phone saved"}
                              </a>
                              {inq.inquirer.phoneNumber && (
                                <a
                                  href={`https://wa.me/${inq.inquirer.phoneNumber.replace(
                                    /\D/g,
                                    ""
                                  )}`}
                                  target="_blank"
                                  className="text-[10px] bg-emerald-600 text-white px-1.5 py-0.5 rounded font-bold ml-1 hover:bg-emerald-700"
                                >
                                  WhatsApp
                                </a>
                              )}
                            </div>
                            {inq.inquirer.companyName && (
                              <div className="flex items-center space-x-1 text-slate-500 text-[11px]">
                                <Building className="w-3 h-3 text-slate-400" />
                                <span>{inq.inquirer.companyName}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Owner Party (Seller or Original Requester) */}
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                            {hasListing ? "Machine Seller" : "Original Requester"}
                          </span>
                          {hasListing && inq.listing.seller ? (
                            <div className="space-y-1 text-xs text-slate-800">
                              <p className="font-bold text-slate-900">
                                {inq.listing.seller.name || "Name not provided"}
                              </p>
                              <div className="flex items-center space-x-1 text-slate-600">
                                <Mail className="w-3.5 h-3.5 text-slate-500" />
                                <a
                                  href={`mailto:${inq.listing.seller.email}`}
                                  className="hover:underline"
                                >
                                  {inq.listing.seller.email}
                                </a>
                              </div>
                              <div className="flex items-center space-x-1 text-slate-600">
                                <Phone className="w-3.5 h-3.5 text-slate-500" />
                                <a
                                  href={`tel:${inq.listing.seller.phoneNumber}`}
                                  className="font-semibold text-slate-800 hover:underline"
                                >
                                  {inq.listing.seller.phoneNumber ||
                                    "No phone saved"}
                                </a>
                                {inq.listing.seller.phoneNumber && (
                                  <a
                                    href={`https://wa.me/${inq.listing.seller.phoneNumber.replace(
                                      /\D/g,
                                      ""
                                    )}`}
                                    target="_blank"
                                    className="text-[10px] bg-emerald-600 text-white px-1.5 py-0.5 rounded font-bold ml-1 hover:bg-emerald-700"
                                  >
                                    WhatsApp
                                  </a>
                                )}
                              </div>
                              {inq.listing.seller.companyName && (
                                <div className="flex items-center space-x-1 text-slate-500 text-[11px]">
                                  <Building className="w-3 h-3 text-slate-400" />
                                  <span>{inq.listing.seller.companyName}</span>
                                </div>
                              )}
                            </div>
                          ) : hasReq && inq.requirement.buyer ? (
                            <div className="space-y-1 text-xs text-slate-800">
                              <p className="font-bold text-slate-900">
                                {inq.requirement.buyer.name || "Name not provided"}
                              </p>
                              <div className="flex items-center space-x-1 text-slate-600">
                                <Mail className="w-3.5 h-3.5 text-slate-500" />
                                <a
                                  href={`mailto:${inq.requirement.buyer.email}`}
                                  className="hover:underline"
                                >
                                  {inq.requirement.buyer.email}
                                </a>
                              </div>
                              <div className="flex items-center space-x-1 text-slate-600">
                                <Phone className="w-3.5 h-3.5 text-slate-500" />
                                <a
                                  href={`tel:${inq.requirement.buyer.phoneNumber}`}
                                  className="font-semibold text-slate-800 hover:underline"
                                >
                                  {inq.requirement.buyer.phoneNumber ||
                                    "No phone saved"}
                                </a>
                              </div>
                            </div>
                          ) : (
                            <span className="text-xs text-slate-400">
                              No owner record
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Message Content */}
                      <div className="pt-2">
                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                          Inquiry Message Submitted:
                        </span>
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs text-slate-800 italic">
                          &quot;{inq.message}&quot;
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: REGISTERED USERS */}
        {activeTab === "users" && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Registered Users & Platform Permissions
                </h2>
                <p className="text-xs text-slate-500">
                  Manage user roles, grant or revoke platform administrator privileges, and view verified contacts.
                </p>
              </div>
              <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1 rounded-lg self-start sm:self-auto">
                Total Users: {users.length}
              </span>
            </div>

            {tabLoading ? (
              <div className="p-16 text-center flex flex-col items-center justify-center space-y-3">
                <div className="w-7 h-7 border-3 border-teal-600 border-t-transparent rounded-full animate-spin" />
                <span className="text-xs text-slate-500 font-semibold">
                  Loading registered users...
                </span>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold">
                    <tr>
                      <th className="p-3.5">Name</th>
                      <th className="p-3.5">Email</th>
                      <th className="p-3.5">Mobile / Phone</th>
                      <th className="p-3.5">Company / Lab</th>
                      <th className="p-3.5">Current Role</th>
                      <th className="p-3.5">Activity</th>
                      <th className="p-3.5">Joined</th>
                      <th className="p-3.5 text-right font-bold text-slate-700">
                        Admin Permissions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {users.map((u) => {
                      const isSelf = Boolean(
                        (session?.user?.id && session.user.id === u.id) ||
                        (session?.user?.email &&
                          u.email &&
                          session.user.email.toLowerCase() ===
                            u.email.toLowerCase())
                      );
                      return (
                        <tr key={u.id} className="hover:bg-slate-50">
                          <td className="p-3.5 font-bold text-slate-900">
                            {u.name || "Anonymous"}
                          </td>
                          <td className="p-3.5 text-slate-700 font-medium">
                            {u.email}
                          </td>
                          <td className="p-3.5">
                            {u.phoneNumber ? (
                              <div className="flex items-center space-x-1.5 font-bold text-teal-700">
                                <Phone className="w-3 h-3 text-teal-600" />
                                <span>{u.phoneNumber}</span>
                              </div>
                            ) : (
                              <span className="text-slate-400 italic">
                                Not yet posted
                              </span>
                            )}
                          </td>
                          <td className="p-3.5 text-slate-600">
                            {u.companyName || "—"}
                          </td>
                          <td className="p-3.5">
                            <span
                              className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${
                                u.role === "ADMIN"
                                  ? "bg-purple-100 text-purple-800 border border-purple-200"
                                  : "bg-slate-100 text-slate-700 border border-slate-200"
                              }`}
                            >
                              {u.role}
                            </span>
                          </td>
                          <td className="p-3.5 text-slate-500">
                            {u._count?.listings ?? 0} listings •{" "}
                            {u._count?.requirements ?? 0} reqs
                          </td>
                          <td className="p-3.5 text-slate-400">
                            {new Date(u.createdAt).toLocaleDateString()}
                          </td>
                          <td className="p-3.5 text-right">
                            {isSelf ? (
                              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-200">
                                You (Logged In)
                              </span>
                            ) : (
                              <div className="inline-flex items-center justify-end">
                                {u.role === "ADMIN" ? (
                                  <button
                                    onClick={() =>
                                      handleToggleUserRole(
                                        u.id,
                                        u.role,
                                        u.name || u.email
                                      )
                                    }
                                    disabled={actionLoading}
                                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 hover:border-red-300 transition-colors cursor-pointer"
                                    title="Demote this administrator to a standard user"
                                  >
                                    <ShieldAlert className="w-3.5 h-3.5 text-red-600" />
                                    <span>Demote to User</span>
                                  </button>
                                ) : (
                                  <button
                                    onClick={() =>
                                      handleToggleUserRole(
                                        u.id,
                                        u.role,
                                        u.name || u.email
                                      )
                                    }
                                    disabled={actionLoading}
                                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-purple-600 text-white hover:bg-purple-700 transition-colors shadow-xs cursor-pointer"
                                    title="Promote this user to platform administrator"
                                  >
                                    <ShieldCheck className="w-3.5 h-3.5 text-white" />
                                    <span>Make Admin</span>
                                  </button>
                                )}
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: LISTINGS MANAGER */}
        {activeTab === "listings" && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Listings Control
                </h2>
                <p className="text-xs text-slate-500">
                  Approve machine submissions, manage availability, or delete items.
                </p>
              </div>
              <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg self-start sm:self-auto">
                {listings.filter((l) => !l.isApproved).length} awaiting review
              </span>
            </div>

            {tabLoading ? (
              <div className="p-16 text-center flex flex-col items-center justify-center space-y-3">
                <div className="w-7 h-7 border-3 border-teal-600 border-t-transparent rounded-full animate-spin" />
                <span className="text-xs text-slate-500 font-semibold">
                  Loading equipment & parts listings...
                </span>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold">
                    <tr>
                      <th className="p-3.5">Machine Title</th>
                      <th className="p-3.5">Category</th>
                      <th className="p-3.5">Price Range</th>
                      <th className="p-3.5">Seller (Private)</th>
                      <th className="p-3.5">Inquiries</th>
                      <th className="p-3.5">Approval</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {listings.map((l) => (
                      <tr
                        key={l.id}
                        className={`hover:bg-slate-50 transition-colors ${
                          !l.isApproved ? "bg-amber-50/40" : ""
                        }`}
                      >
                        <td className="p-3.5 font-bold text-slate-900">
                          <Link
                            href={`/listings/${l.id}`}
                            target="_blank"
                            className="hover:text-teal-600 hover:underline flex items-center space-x-1"
                          >
                            <span>{l.title}</span>
                            <ExternalLink className="w-3 h-3 text-slate-400" />
                          </Link>
                        </td>
                        <td className="p-3.5 text-slate-600">
                          <span>{l.category}</span>
                          {l.itemType === "SPARE_PART" && (
                            <span className="block text-[10px] text-amber-700 font-bold">
                              ⚙️ Spare Part
                            </span>
                          )}
                        </td>
                        <td className="p-3.5 font-semibold text-slate-800">
                          ₹{l.minPrice.toLocaleString("en-IN")} - ₹
                          {l.maxPrice.toLocaleString("en-IN")}
                        </td>
                        <td className="p-3.5">
                          <div className="font-semibold text-slate-900">
                            {l.seller.name || l.seller.email}
                          </div>
                          <div className="text-[11px] text-teal-700 font-bold">
                            {l.seller.phoneNumber || "No phone"}
                          </div>
                        </td>
                        <td className="p-3.5 font-bold text-slate-700">
                          {l._count?.inquiries || 0}
                        </td>
                        <td className="p-3.5">
                          {l.isApproved ? (
                            <div className="flex items-center space-x-2">
                              <span className="inline-flex items-center space-x-1 text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                                <Check className="w-3 h-3" />
                                <span>Approved</span>
                              </span>
                              <button
                                type="button"
                                onClick={() => handleToggleListingApproval(l.id, l.isApproved)}
                                className="text-[10px] text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-1.5 py-0.5 rounded font-semibold transition-colors"
                              >
                                Revoke
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center space-x-2">
                              <span className="inline-flex items-center space-x-1 text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded">
                                <Clock className="w-3 h-3" />
                                <span>Pending</span>
                              </span>
                              <button
                                type="button"
                                onClick={() => handleToggleListingApproval(l.id, l.isApproved)}
                                className="text-[10px] text-white bg-emerald-600 hover:bg-emerald-700 px-2 py-0.5 rounded font-bold shadow-xs transition-colors"
                              >
                                Approve
                              </button>
                            </div>
                          )}
                        </td>
                        <td className="p-3.5">
                          <select
                            value={l.status}
                            onChange={(e) =>
                              handleUpdateListingStatus(l.id, e.target.value)
                            }
                            className="text-xs font-semibold bg-slate-50 border border-slate-300 rounded px-2 py-1 text-slate-900"
                          >
                            <option value="AVAILABLE">AVAILABLE</option>
                            <option value="PENDING">PENDING</option>
                            <option value="SOLD">SOLD</option>
                          </select>
                        </td>
                        <td className="p-3.5">
                          <button
                            type="button"
                            onClick={() => handleDeleteListing(l.id, l.title)}
                            className="inline-flex items-center space-x-1 text-[11px] font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-2 py-1 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                            <span>Delete</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: REQUIREMENTS MANAGER */}
        {activeTab === "requirements" && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Buyer Requirements Control
                </h2>
                <p className="text-xs text-slate-500">
                  Approve wanted equipment requests, update status, or delete items.
                </p>
              </div>
              <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg self-start sm:self-auto">
                {requirements.filter((r) => !r.isApproved).length} awaiting review
              </span>
            </div>

            {tabLoading ? (
              <div className="p-16 text-center flex flex-col items-center justify-center space-y-3">
                <div className="w-7 h-7 border-3 border-teal-600 border-t-transparent rounded-full animate-spin" />
                <span className="text-xs text-slate-500 font-semibold">
                  Loading buyer requests...
                </span>
              </div>
            ) : (
              <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold">
                  <tr>
                    <th className="p-3.5">Target Machine</th>
                    <th className="p-3.5">Category</th>
                    <th className="p-3.5">Buyer (Private)</th>
                    <th className="p-3.5">Inquiries</th>
                    <th className="p-3.5">Approval</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {requirements.map((r) => (
                    <tr
                      key={r.id}
                      className={`hover:bg-slate-50 transition-colors ${
                        !r.isApproved ? "bg-amber-50/40" : ""
                      }`}
                    >
                      <td className="p-3.5 font-bold text-slate-900">
                        <Link
                          href={`/requests/${r.id}`}
                          target="_blank"
                          className="hover:text-teal-600 hover:underline flex items-center space-x-1"
                        >
                          <span>{r.title}</span>
                          <ExternalLink className="w-3 h-3 text-slate-400" />
                        </Link>
                      </td>
                      <td className="p-3.5 text-slate-600">
                        <span>{r.category}</span>
                        {r.itemType === "SPARE_PART" && (
                          <span className="block text-[10px] text-amber-700 font-bold">
                            ⚙️ Spare Part
                          </span>
                        )}
                      </td>
                      <td className="p-3.5">
                        <div className="font-semibold text-slate-900">
                          {r.buyer.name || r.buyer.email}
                        </div>
                        <div className="text-[11px] text-teal-700 font-bold">
                          {r.buyer.phoneNumber || "No phone"}
                        </div>
                      </td>
                      <td className="p-3.5 font-bold text-slate-700">
                        {r._count?.inquiries || 0}
                      </td>
                      <td className="p-3.5">
                        {r.isApproved ? (
                          <div className="flex items-center space-x-2">
                            <span className="inline-flex items-center space-x-1 text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                              <Check className="w-3 h-3" />
                              <span>Approved</span>
                            </span>
                            <button
                              type="button"
                              onClick={() => handleToggleRequirementApproval(r.id, r.isApproved)}
                              className="text-[10px] text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-1.5 py-0.5 rounded font-semibold transition-colors"
                            >
                              Revoke
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2">
                            <span className="inline-flex items-center space-x-1 text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded">
                              <Clock className="w-3 h-3" />
                              <span>Pending</span>
                            </span>
                            <button
                              type="button"
                              onClick={() => handleToggleRequirementApproval(r.id, r.isApproved)}
                              className="text-[10px] text-white bg-emerald-600 hover:bg-emerald-700 px-2 py-0.5 rounded font-bold shadow-xs transition-colors"
                            >
                              Approve
                            </button>
                          </div>
                        )}
                      </td>
                      <td className="p-3.5">
                        <select
                          value={r.status}
                          onChange={(e) =>
                            handleUpdateRequirementStatus(r.id, e.target.value)
                          }
                          className="text-xs font-semibold bg-slate-50 border border-slate-300 rounded px-2 py-1 text-slate-900"
                        >
                          <option value="OPEN">OPEN</option>
                          <option value="FULFILLED">FULFILLED</option>
                          <option value="CLOSED">CLOSED</option>
                        </select>
                      </td>
                      <td className="p-3.5">
                        <button
                          type="button"
                          onClick={() => handleDeleteRequirement(r.id, r.title)}
                          className="inline-flex items-center space-x-1 text-[11px] font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-2 py-1 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                          <span>Delete</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
      </div>
    </div>
  );
}
