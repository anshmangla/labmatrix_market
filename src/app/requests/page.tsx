"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  FileQuestion,
  Search,
  Filter,
  PlusCircle,
  ShieldCheck,
  Clock,
  ArrowRight,
  Send,
  Building,
} from "lucide-react";

interface Requirement {
  id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  createdAt: string;
}

const CATEGORIES = [
  "ALL",
  "HPLC & UHPLC",
  "GC & GC-MS",
  "UV-Vis & FTIR",
  "Dissolution Testers",
  "Stability Chambers",
  "Particle Analyzers",
  "Centrifuges & Shakers",
  "Karl Fischer & Titrators",
  "Other Lab Equipment",
];

export default function BrowseRequestsPage() {
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");

  useEffect(() => {
    fetchRequirements();
  }, [selectedCategory]);

  const fetchRequirements = async () => {
    setLoading(true);
    try {
      let url = `/api/requirements?`;
      if (selectedCategory !== "ALL") {
        url += `category=${encodeURIComponent(selectedCategory)}&`;
      }
      if (search.trim()) {
        url += `query=${encodeURIComponent(search.trim())}&`;
      }

      const res = await fetch(url);
      const data = await res.json();
      if (data?.requirements) {
        setRequirements(data.requirements);
      }
    } catch (err) {
      console.error("Fetch requirements error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchRequirements();
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center space-x-1.5 text-xs font-bold text-teal-600 bg-teal-50 px-2.5 py-1 rounded-full mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Verified Laboratory Inquiries • Broker-Managed</span>
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900">
              Buyer Equipment Requirements
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Laboratories actively looking for analytical instruments. Have a
              matching unit? Submit an offer directly to our broker desk.
            </p>
          </div>

          <Link
            href="/requests/create"
            className="inline-flex items-center space-x-2 px-5 py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-md transition-all self-start md:self-auto"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Post Equipment Wanted</span>
          </Link>
        </div>

        {/* Search & Filter */}
        <div className="bg-white p-4 rounded-2xl shadow-xs border border-slate-200 mb-8 space-y-4">
          <form onSubmit={handleSearchSubmit} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                placeholder="Search desired instruments (HPLC, GC-MS, FTIR, Dissolution)..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white"
              />
            </div>
            <button
              type="submit"
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold rounded-xl transition-colors"
            >
              Search
            </button>
          </form>

          {/* Category Chips */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center pr-2">
              <Filter className="w-3.5 h-3.5 mr-1" /> Category:
            </span>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? "bg-teal-600 text-white shadow-xs"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-600"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Feed */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border border-slate-200 p-6 space-y-3 animate-pulse"
              >
                <div className="h-4 bg-slate-200 rounded w-1/4" />
                <div className="h-5 bg-slate-200 rounded w-3/4" />
                <div className="h-12 bg-slate-100 rounded w-full" />
              </div>
            ))}
          </div>
        ) : requirements.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-lg mx-auto my-12">
            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400 mb-4">
              <FileQuestion className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">
              No equipment requirements found
            </h3>
            <p className="text-sm text-slate-500 mt-1">
              Be the first to post a machine requirement on the marketplace.
            </p>
            <Link
              href="/requests/create"
              className="mt-6 inline-flex items-center space-x-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-semibold"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Post First Requirement</span>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {requirements.map((req) => (
              <div
                key={req.id}
                className="bg-white rounded-2xl border border-slate-200 hover:border-teal-500/80 p-6 shadow-xs hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="bg-teal-50 text-teal-700 text-xs font-bold px-2.5 py-0.5 rounded-md">
                      {req.category}
                    </span>
                    <span className="text-slate-400 text-xs">•</span>
                    <span className="text-slate-500 text-xs flex items-center">
                      <Clock className="w-3.5 h-3.5 mr-1" />
                      Posted on {new Date(req.createdAt).toLocaleDateString()}
                    </span>
                    <span className="text-slate-400 text-xs">•</span>
                    <span className="bg-slate-100 text-slate-700 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded flex items-center space-x-1">
                      <ShieldCheck className="w-3 h-3 text-teal-600" />
                      <span>Admin Protected Buyer</span>
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900">
                    {req.title}
                  </h3>

                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                    {req.description}
                  </p>
                </div>

                <div className="flex-shrink-0 flex items-center">
                  <Link
                    href={`/requests/${req.id}`}
                    className="inline-flex items-center space-x-1.5 px-4 py-2.5 bg-slate-900 hover:bg-teal-600 text-white rounded-xl text-xs font-bold transition-colors shadow-xs"
                  >
                    <span>View & Fulfill Request</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
