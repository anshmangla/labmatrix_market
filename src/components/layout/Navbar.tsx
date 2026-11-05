"use client";

import React, { useState, useRef, useEffect, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  Menu,
  X,
  Search,
  LogIn,
  UserPlus,
  Tag,
  FileQuestion,
  LayoutDashboard,
  Shield,
  LogOut,
  ChevronRight,
  ChevronDown,
  Package,
  FileText,
  MessageSquare,
  Microscope,
  Cpu,
  Sparkles,
} from "lucide-react";
import { NotificationBell } from "./NotificationBell";
import UserMenu from "./UserMenu";

function HeaderSearchInput() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const initialQuery = pathname === "/listings" ? (searchParams?.get("query") || "") : "";
  const [query, setQuery] = useState(initialQuery);

  useEffect(() => {
    if (pathname === "/listings") {
      setQuery(searchParams?.get("query") || "");
    }
  }, [pathname, searchParams]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (trimmed) {
      router.push(`/listings?query=${encodeURIComponent(trimmed)}`);
    } else if (pathname === "/listings") {
      router.push("/listings");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative w-full max-w-xs xl:max-w-sm">
      <div className="relative flex items-center">
        <Search className="absolute left-3 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search model, brand or part..."
          className="w-full pl-8 pr-7 py-1.5 text-xs bg-slate-100 hover:bg-slate-100/80 focus:bg-white text-slate-800 placeholder-slate-400 rounded-xl border border-slate-200 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/15 outline-none transition-all"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            className="absolute right-2 p-0.5 text-slate-400 hover:text-slate-600 rounded-full"
            aria-label="Clear search"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>
    </form>
  );
}

export default function Navbar() {
  const { data: session, status } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [marketplaceMenuOpen, setMarketplaceMenuOpen] = useState(false);
  const [mobileMarketplaceOpen, setMobileMarketplaceOpen] = useState(true);
  const [mobileSearchQuery, setMobileSearchQuery] = useState("");
  const marketplaceDropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();

  const signInUrl = pathname && pathname !== "/auth/signin" && pathname !== "/auth/signup"
    ? `/auth/signin?callbackUrl=${encodeURIComponent(pathname)}`
    : "/auth/signin";
  const signUpUrl = pathname && pathname !== "/auth/signin" && pathname !== "/auth/signup"
    ? `/auth/signup?callbackUrl=${encodeURIComponent(pathname)}`
    : "/auth/signup";

  const isEquipmentActive = pathname === "/listings" || (pathname.startsWith("/listings/") && !pathname.includes("/edit") && !pathname.includes("/create"));
  const isNewInstrumentsActive = pathname === "/new-instruments";
  const isSparePartsActive = pathname === "/spare-parts";
  const isMarketplaceActive = isEquipmentActive || isNewInstrumentsActive || isSparePartsActive;
  const isRequestsActive = pathname === "/requests" || (pathname.startsWith("/requests/") && !pathname.includes("/edit") && !pathname.includes("/create"));
  const isContactActive = pathname === "/contact";

  // Click outside listener for marketplace dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (marketplaceDropdownRef.current && !marketplaceDropdownRef.current.contains(event.target as Node)) {
        setMarketplaceMenuOpen(false);
      }
    }
    if (marketplaceMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [marketplaceMenuOpen]);

  const handleMobileSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = mobileSearchQuery.trim();
    setMobileMenuOpen(false);
    if (trimmed) {
      router.push(`/listings?query=${encodeURIComponent(trimmed)}`);
    } else {
      router.push("/listings");
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3 lg:gap-4">
          
          {/* Brand Logo */}
          <div className="flex items-center space-x-3 flex-shrink-0">
            <Link href="/" className="flex items-center group py-1">
              <Image
                src="/logo.png"
                alt="Labmatrix Marketplace - Refurbished & Pre-Owned Analytical Laboratory Instruments"
                width={170}
                height={36}
                priority
                className="h-8 sm:h-9 w-auto object-contain transition-transform group-hover:scale-[1.02]"
              />
            </Link>
          </div>

          {/* Desktop 3-Tab Primary Navigation */}
          <nav className="hidden lg:flex items-center space-x-1 text-xs xl:text-sm font-semibold flex-shrink-0">
            {/* 1. Marketplace (with dropdown) */}
            <div className="relative" ref={marketplaceDropdownRef}>
              <div className="flex items-center">
                <Link
                  href="/listings"
                  className={`inline-flex items-center space-x-1 px-3 py-1.5 rounded-l-xl transition-all whitespace-nowrap ${
                    isMarketplaceActive
                      ? "text-brand-blue bg-blue-50/90 font-bold shadow-xs"
                      : "text-slate-700 hover:text-brand-blue hover:bg-slate-100/70"
                  }`}
                >
                  <span>Marketplace</span>
                </Link>
                <button
                  type="button"
                  onClick={() => setMarketplaceMenuOpen(!marketplaceMenuOpen)}
                  aria-expanded={marketplaceMenuOpen}
                  aria-label="Toggle marketplace categories menu"
                  className={`p-1.5 rounded-r-xl transition-colors ${
                    isMarketplaceActive
                      ? "text-brand-blue bg-blue-50/90"
                      : "text-slate-400 hover:text-brand-blue hover:bg-slate-100/70"
                  }`}
                >
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${marketplaceMenuOpen ? "rotate-180" : ""}`} />
                </button>
              </div>

              {/* Marketplace Dropdown Flyout */}
              {marketplaceMenuOpen && (
                <div className="absolute left-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200/90 p-2 z-50 animate-in fade-in zoom-in-95 duration-150 space-y-1">
                  <Link
                    href="/listings"
                    onClick={() => setMarketplaceMenuOpen(false)}
                    className={`flex items-start space-x-2.5 p-2.5 rounded-xl transition-colors ${
                      isEquipmentActive ? "bg-blue-50/80 text-brand-blue font-bold" : "hover:bg-slate-50 text-slate-800"
                    }`}
                  >
                    <div className="w-7 h-7 rounded-lg bg-blue-50 text-brand-blue flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Microscope className="w-3.5 h-3.5 text-brand-blue" />
                    </div>
                    <div>
                      <p className="text-xs font-bold leading-tight">Pre-Owned Equipment</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">HPLC, GC-MS, UV-Vis, AAS, ICP & more</p>
                    </div>
                  </Link>

                  <Link
                    href="/new-instruments"
                    onClick={() => setMarketplaceMenuOpen(false)}
                    className={`flex items-start space-x-2.5 p-2.5 rounded-xl transition-colors ${
                      isNewInstrumentsActive ? "bg-blue-50/80 text-brand-blue font-bold" : "hover:bg-slate-50 text-slate-800"
                    }`}
                  >
                    <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-xs font-bold leading-tight">Brand New Instruments</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">OEM factory-new analytical instruments</p>
                    </div>
                  </Link>

                  <Link
                    href="/spare-parts"
                    onClick={() => setMarketplaceMenuOpen(false)}
                    className={`flex items-start space-x-2.5 p-2.5 rounded-xl transition-colors ${
                      isSparePartsActive ? "bg-blue-50/80 text-brand-blue font-bold" : "hover:bg-slate-50 text-slate-800"
                    }`}
                  >
                    <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Cpu className="w-3.5 h-3.5 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-xs font-bold leading-tight">Spare Parts & Modules</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">Boards, pumps, lamps, detectors & parts</p>
                    </div>
                  </Link>
                </div>
              )}
            </div>

            {/* 2. Buyer Requests */}
            <Link
              href="/requests"
              className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap ${
                isRequestsActive
                  ? "text-brand-blue bg-blue-50/90 font-bold shadow-xs"
                  : "text-slate-700 hover:text-brand-blue hover:bg-slate-100/70"
              }`}
            >
              Buyer Requests
            </Link>

            {/* 3. Contact */}
            <Link
              href="/contact"
              className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap ${
                isContactActive
                  ? "text-brand-blue bg-blue-50/90 font-bold shadow-xs"
                  : "text-slate-700 hover:text-brand-blue hover:bg-slate-100/70"
              }`}
            >
              Contact
            </Link>
          </nav>

          {/* Desktop Integrated Search Bar */}
          <div className="hidden lg:flex flex-1 justify-center max-w-sm mx-2">
            <Suspense fallback={<div className="w-full h-8 bg-slate-100 rounded-xl animate-pulse" />}>
              <HeaderSearchInput />
            </Suspense>
          </div>

          {/* Desktop Direct Actions: + List equipment & Post requirement */}
          <div className="hidden lg:flex items-center space-x-2 flex-shrink-0">
            {/* Direct CTA 1: Sell / List Equipment */}
            <Link
              href="/listings/create"
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-black tracking-wide text-brand-blue bg-brand-gold hover:bg-brand-gold-300 shadow-xs hover:shadow-sm transition-all whitespace-nowrap"
            >
              <Tag className="w-3.5 h-3.5 text-brand-blue" />
              <span>+ List equipment</span>
            </Link>

            {/* Direct CTA 2: Post Buyer Requirement */}
            <Link
              href="/requests/create"
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 hover:text-brand-blue bg-white hover:bg-slate-50 border border-slate-300 hover:border-slate-400 transition-all whitespace-nowrap shadow-2xs"
            >
              <FileQuestion className="w-3.5 h-3.5 text-slate-500" />
              <span>Post requirement</span>
            </Link>

            {/* User Session / Auth Controls */}
            {status === "loading" ? (
              <div className="h-8 w-20 bg-slate-100 rounded-full animate-pulse ml-1" />
            ) : session?.user ? (
              <div className="flex items-center space-x-2 ml-1">
                <NotificationBell />
                <UserMenu user={session.user} />
              </div>
            ) : (
              <div className="flex items-center space-x-1.5 pl-1">
                <Link
                  href={signInUrl}
                  prefetch={false}
                  className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-xl text-xs font-bold text-slate-700 hover:text-brand-blue hover:bg-slate-100 transition-colors"
                >
                  <LogIn className="w-3.5 h-3.5 text-slate-500" />
                  <span>Sign In</span>
                </Link>
                <Link
                  href={signUpUrl}
                  prefetch={false}
                  className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-brand-blue hover:bg-brand-blue-500 shadow-xs transition-all"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Register</span>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Right Controls: Bell + Menu Toggle */}
          <div className="flex items-center space-x-1 lg:hidden">
            {session?.user && <NotificationBell />}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-700 hover:text-brand-blue hover:bg-slate-100 transition-colors"
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Streamlined Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-4 shadow-xl max-h-[calc(100vh-4rem)] overflow-y-auto animate-in slide-in-from-top-2 duration-150">
          
          {/* Mobile Search Bar */}
          <form onSubmit={handleMobileSearch} className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="search"
              value={mobileSearchQuery}
              onChange={(e) => setMobileSearchQuery(e.target.value)}
              placeholder="Search model, brand or part..."
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-100 text-slate-800 placeholder-slate-400 rounded-xl border border-slate-200 focus:border-brand-blue focus:bg-white outline-none"
            />
          </form>

          {/* Direct Mobile Action Cards: List equipment + Post requirement */}
          <div className="grid grid-cols-2 gap-2">
            <Link
              href="/listings/create"
              onClick={() => setMobileMenuOpen(false)}
              className="flex flex-col items-center justify-center text-center p-3 rounded-2xl bg-brand-gold/20 hover:bg-brand-gold/30 border border-brand-gold/50 transition-colors group"
            >
              <div className="w-8 h-8 rounded-xl bg-brand-gold text-brand-blue flex items-center justify-center mb-1.5 shadow-xs">
                <Tag className="w-4 h-4 text-brand-blue" />
              </div>
              <span className="text-xs font-black text-brand-blue">+ List equipment</span>
              <span className="text-[10px] text-slate-600 mt-0.5">Sell instruments & spares</span>
            </Link>

            <Link
              href="/requests/create"
              onClick={() => setMobileMenuOpen(false)}
              className="flex flex-col items-center justify-center text-center p-3 rounded-2xl bg-blue-50 hover:bg-blue-100/80 border border-blue-200 transition-colors group"
            >
              <div className="w-8 h-8 rounded-xl bg-brand-blue text-white flex items-center justify-center mb-1.5 shadow-xs">
                <FileQuestion className="w-4 h-4 text-white" />
              </div>
              <span className="text-xs font-black text-brand-blue">Post requirement</span>
              <span className="text-[10px] text-slate-600 mt-0.5">Request machines or parts</span>
            </Link>
          </div>

          {/* Core Navigation Items (4 links matching app tabs) */}
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 block mb-1">
              Navigation
            </span>

            {/* Marketplace Group */}
            <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-1">
              <button
                type="button"
                onClick={() => setMobileMarketplaceOpen(!mobileMarketplaceOpen)}
                className="w-full px-3 py-2 rounded-lg flex items-center justify-between text-xs font-bold text-slate-800 hover:bg-slate-100"
              >
                <span>Marketplace Catalogs</span>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${mobileMarketplaceOpen ? "rotate-180" : ""}`} />
              </button>
              {mobileMarketplaceOpen && (
                <div className="pl-2 pr-1 pb-1 pt-0.5 space-y-0.5">
                  <Link
                    href="/listings"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`px-3 py-1.5 rounded-lg flex items-center justify-between text-xs ${
                      isEquipmentActive ? "bg-white text-brand-blue font-bold shadow-2xs" : "text-slate-600 hover:bg-white"
                    }`}
                  >
                    <span>Pre-Owned Equipment</span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
                  </Link>
                  <Link
                    href="/new-instruments"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`px-3 py-1.5 rounded-lg flex items-center justify-between text-xs ${
                      isNewInstrumentsActive ? "bg-white text-brand-blue font-bold shadow-2xs" : "text-slate-600 hover:bg-white"
                    }`}
                  >
                    <span>Brand New Instruments</span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
                  </Link>
                  <Link
                    href="/spare-parts"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`px-3 py-1.5 rounded-lg flex items-center justify-between text-xs ${
                      isSparePartsActive ? "bg-white text-brand-blue font-bold shadow-2xs" : "text-slate-600 hover:bg-white"
                    }`}
                  >
                    <span>Spare Parts & Modules</span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
                  </Link>
                </div>
              )}
            </div>

            <Link
              href="/requests"
              onClick={() => setMobileMenuOpen(false)}
              className={`px-3 py-2 rounded-xl flex items-center justify-between text-xs font-semibold ${
                isRequestsActive ? "bg-blue-50 text-brand-blue font-bold" : "text-slate-700 hover:bg-slate-50"
              }`}
            >
              <span>Buyer Requests Board</span>
              <ChevronRight className="w-4 h-4 text-slate-300" />
            </Link>

            <Link
              href="/#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-xl flex items-center justify-between text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              <span>How It Works</span>
              <ChevronRight className="w-4 h-4 text-slate-300" />
            </Link>

            <Link
              href="/contact"
              onClick={() => setMobileMenuOpen(false)}
              className={`px-3 py-2 rounded-xl flex items-center justify-between text-xs font-semibold ${
                isContactActive ? "bg-blue-50 text-brand-blue font-bold" : "text-slate-700 hover:bg-slate-50"
              }`}
            >
              <span>Contact Labmatrix</span>
              <ChevronRight className="w-4 h-4 text-slate-300" />
            </Link>
          </div>

          {/* User Account / Session Profile */}
          <div className="pt-2 border-t border-slate-100">
            {session?.user ? (
              <div className="space-y-2">
                {/* Profile Summary Card */}
                <div className="p-3 bg-slate-50 rounded-2xl flex items-center justify-between border border-slate-200/60">
                  <div className="min-w-0 pr-2">
                    <p className="text-xs font-bold text-slate-900 truncate">
                      {session.user.name || "Lab User"}
                    </p>
                    <p className="text-[11px] text-slate-500 truncate">
                      {session.user.email}
                    </p>
                  </div>
                  {session.user?.role === "ADMIN" ? (
                    <span className="text-[10px] font-bold bg-brand-blue-900 text-brand-gold px-2 py-0.5 rounded-md flex-shrink-0">
                      Admin
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md flex-shrink-0">
                      Member
                    </span>
                  )}
                </div>

                {/* Dashboard & User Links */}
                <div className="space-y-0.5 text-xs font-semibold text-slate-700">
                  <Link
                    href="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-3 py-2 rounded-xl hover:bg-slate-50 flex items-center space-x-2.5"
                  >
                    <LayoutDashboard className="w-4 h-4 text-slate-400" />
                    <span>Dashboard Overview</span>
                  </Link>

                  <Link
                    href="/dashboard?tab=listings"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-3 py-2 rounded-xl hover:bg-slate-50 flex items-center space-x-2.5"
                  >
                    <Package className="w-4 h-4 text-slate-400" />
                    <span>My Listed Equipment</span>
                  </Link>

                  <Link
                    href="/dashboard?tab=requests"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-3 py-2 rounded-xl hover:bg-slate-50 flex items-center space-x-2.5"
                  >
                    <FileText className="w-4 h-4 text-slate-400" />
                    <span>My Sourcing Requirements</span>
                  </Link>

                  <Link
                    href="/dashboard?tab=inquiries"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-3 py-2 rounded-xl hover:bg-slate-50 flex items-center space-x-2.5"
                  >
                    <MessageSquare className="w-4 h-4 text-slate-400" />
                    <span>Inquiries & Messages</span>
                  </Link>

                  {session.user?.role === "ADMIN" && (
                    <Link
                      href="/admin"
                      onClick={() => setMobileMenuOpen(false)}
                      className="px-3 py-2 rounded-xl bg-brand-blue-900 text-white flex items-center space-x-2.5 border border-brand-gold/30 font-bold"
                    >
                      <Shield className="w-4 h-4 text-brand-gold" />
                      <span>Admin Deal Desk</span>
                    </Link>
                  )}
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      signOut({ callbackUrl: "/" });
                    }}
                    className="w-full flex items-center justify-center space-x-1.5 py-2 px-3 rounded-xl text-xs font-bold text-red-600 bg-red-50/70 hover:bg-red-100/70 transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5 text-red-500" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-1">
                <Link
                  href={signInUrl}
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-2.5 text-center text-xs font-bold border border-slate-300 rounded-xl text-slate-700 hover:bg-slate-50 flex items-center justify-center space-x-1"
                >
                  <LogIn className="w-3.5 h-3.5 text-slate-500" />
                  <span>Sign In</span>
                </Link>
                <Link
                  href={signUpUrl}
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-2.5 text-center text-xs font-bold bg-brand-blue text-white rounded-xl hover:bg-brand-blue-500 shadow-xs flex items-center justify-center space-x-1"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Register</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
