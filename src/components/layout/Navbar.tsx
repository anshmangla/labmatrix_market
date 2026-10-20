"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import {
  Menu,
  X,
  LogIn,
  UserPlus,
  Tag,
  FileQuestion,
  LayoutDashboard,
  Shield,
  LogOut,
  ChevronRight,
  Package,
  FileText,
  MessageSquare,
} from "lucide-react";
import { NotificationBell } from "./NotificationBell";
import UserMenu from "./UserMenu";
import PostActionMenu from "./PostActionMenu";

export default function Navbar() {
  const { data: session, status } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div className="flex items-center space-x-3 flex-shrink-0">
            <Link href="/" className="flex items-center group py-1">
              <Image
                src="/logo.png"
                alt="LabMatrix Marketplace - Refurbished & Pre-Owned Analytical Laboratory Instruments"
                width={170}
                height={36}
                priority
                className="h-8 sm:h-9 w-auto object-contain transition-transform group-hover:scale-[1.02]"
              />
            </Link>
          </div>

          {/* Desktop Primary Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-1 xl:space-x-2 text-xs xl:text-sm font-semibold text-slate-600">
            <Link
              href="/listings"
              className="px-2.5 xl:px-3 py-1.5 rounded-xl hover:text-brand-blue hover:bg-slate-100/70 transition-colors whitespace-nowrap"
            >
              Available Equipment
            </Link>
            <Link
              href="/new-instruments"
              className="px-2.5 xl:px-3 py-1.5 rounded-xl hover:text-brand-blue hover:bg-slate-100/70 transition-colors whitespace-nowrap"
            >
              New Instruments
            </Link>
            <Link
              href="/spare-parts"
              className="px-2.5 xl:px-3 py-1.5 rounded-xl hover:text-brand-blue hover:bg-slate-100/70 transition-colors whitespace-nowrap"
            >
              Spare Parts
            </Link>
            <Link
              href="/requests"
              className="px-2.5 xl:px-3 py-1.5 rounded-xl hover:text-brand-blue hover:bg-slate-100/70 transition-colors whitespace-nowrap"
            >
              Buyer Requests
            </Link>
            <Link
              href="/#how-it-works"
              prefetch={false}
              className="px-2.5 xl:px-3 py-1.5 rounded-xl hover:text-brand-blue hover:bg-slate-100/70 transition-colors whitespace-nowrap"
            >
              How It Works
            </Link>
            <Link
              href="/contact"
              className="px-2.5 xl:px-3 py-1.5 rounded-xl hover:text-brand-blue hover:bg-slate-100/70 transition-colors whitespace-nowrap"
            >
              Contact
            </Link>
          </nav>

          {/* Desktop Actions & User Controls */}
          <div className="hidden lg:flex items-center space-x-2 xl:space-x-3 flex-shrink-0">
            {/* Primary Unified CTA */}
            <PostActionMenu />

            {/* Auth / Profile Area */}
            {status === "loading" ? (
              <div className="h-8 w-24 bg-slate-100 rounded-full animate-pulse" />
            ) : session?.user ? (
              <div className="flex items-center space-x-2.5">
                <NotificationBell />
                <UserMenu user={session.user} />
              </div>
            ) : (
              <div className="flex items-center space-x-2 pl-1">
                <Link
                  href="/auth/signin"
                  prefetch={false}
                  className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 hover:text-brand-blue hover:bg-slate-100 transition-colors"
                >
                  <LogIn className="w-3.5 h-3.5 text-slate-500" />
                  <span>Sign In</span>
                </Link>
                <Link
                  href="/auth/signup"
                  prefetch={false}
                  className="inline-flex items-center space-x-1 px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-brand-blue hover:bg-brand-blue-500 shadow-xs transition-all"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Register</span>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Right Controls: Bell + Hamburger Button */}
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

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-4 shadow-xl max-h-[calc(100vh-4rem)] overflow-y-auto animate-in slide-in-from-top-2 duration-150">
          {/* Quick Action Banners: Buy vs Sell */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <Link
              href="/listings/create"
              onClick={() => setMobileMenuOpen(false)}
              className="flex flex-col items-center justify-center text-center p-3 rounded-2xl bg-brand-gold/20 hover:bg-brand-gold/30 border border-brand-gold/50 transition-colors group"
            >
              <div className="w-8 h-8 rounded-xl bg-brand-gold text-brand-blue flex items-center justify-center mb-1.5 shadow-xs">
                <Tag className="w-4 h-4 text-brand-blue" />
              </div>
              <span className="text-xs font-black text-brand-blue">Sell Equipment</span>
              <span className="text-[10px] text-slate-600 mt-0.5">List Machines & Spares</span>
            </Link>

            <Link
              href="/requests/create"
              onClick={() => setMobileMenuOpen(false)}
              className="flex flex-col items-center justify-center text-center p-3 rounded-2xl bg-brand-blue-50/80 hover:bg-brand-blue-100/80 border border-brand-blue-200/80 transition-colors group"
            >
              <div className="w-8 h-8 rounded-xl bg-brand-blue text-white flex items-center justify-center mb-1.5 shadow-xs">
                <FileQuestion className="w-4 h-4 text-white" />
              </div>
              <span className="text-xs font-black text-brand-blue">Post Wanted</span>
              <span className="text-[10px] text-slate-600 mt-0.5">Request a Machine</span>
            </Link>
          </div>

          {/* Section 1: Explore & Source */}
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 block mb-1">
              Marketplace Exploration
            </span>
            <nav className="flex flex-col space-y-0.5 text-sm font-semibold text-slate-700">
              <Link
                href="/listings"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-xl hover:bg-slate-50 hover:text-brand-blue flex items-center justify-between"
              >
                <span>Available Equipment</span>
                <ChevronRight className="w-4 h-4 text-slate-300" />
              </Link>
              <Link
                href="/new-instruments"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-xl hover:bg-slate-50 hover:text-brand-blue flex items-center justify-between"
              >
                <span>New Instruments</span>
                <ChevronRight className="w-4 h-4 text-slate-300" />
              </Link>
              <Link
                href="/spare-parts"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-xl hover:bg-slate-50 hover:text-brand-blue flex items-center justify-between"
              >
                <span>Spare Parts & Consumables</span>
                <ChevronRight className="w-4 h-4 text-slate-300" />
              </Link>
              <Link
                href="/requests"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-xl hover:bg-slate-50 hover:text-brand-blue flex items-center justify-between"
              >
                <span>Buyer Requests Board</span>
                <ChevronRight className="w-4 h-4 text-slate-300" />
              </Link>
            </nav>
          </div>

          {/* Section 2: Support & Company */}
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 block mb-1">
              Assurance & Desk
            </span>
            <nav className="flex flex-col space-y-0.5 text-sm font-semibold text-slate-700">
              <Link
                href="/#how-it-works"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-xl hover:bg-slate-50 hover:text-brand-blue flex items-center justify-between"
              >
                <span>How It Works</span>
                <ChevronRight className="w-4 h-4 text-slate-300" />
              </Link>
              <Link
                href="/contact"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-xl hover:bg-slate-50 hover:text-brand-blue flex items-center justify-between"
              >
                <span>Contact Corporate Desk</span>
                <ChevronRight className="w-4 h-4 text-slate-300" />
              </Link>
            </nav>
          </div>

          {/* Section 3: User Account & Session */}
          <div className="pt-3 border-t border-slate-100">
            {session?.user ? (
              <div className="space-y-2">
                {/* User Info Header Card */}
                <div className="p-3 bg-slate-50 rounded-2xl flex items-center justify-between border border-slate-200/60">
                  <div className="min-w-0 pr-2">
                    <p className="text-xs font-bold text-slate-900 truncate">
                      {session.user.name || "Lab User"}
                    </p>
                    <p className="text-[11px] text-slate-500 truncate">
                      {session.user.email}
                    </p>
                  </div>
                  {(session.user as any)?.role === "ADMIN" ? (
                    <span className="text-[10px] font-bold bg-brand-blue-900 text-brand-gold px-2 py-0.5 rounded-md flex-shrink-0">
                      Admin
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md flex-shrink-0">
                      Member
                    </span>
                  )}
                </div>

                {/* Account Links */}
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

                  {(session.user as any)?.role === "ADMIN" && (
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
                    className="w-full flex items-center justify-center space-x-1.5 py-2.5 px-3 rounded-xl text-xs font-bold text-red-600 bg-red-50/70 hover:bg-red-100/70 transition-colors"
                  >
                    <LogOut className="w-4 h-4 text-red-500" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-1">
                <Link
                  href="/auth/signin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-2.5 text-center text-xs font-bold border border-slate-300 rounded-xl text-slate-700 hover:bg-slate-50 flex items-center justify-center space-x-1"
                >
                  <LogIn className="w-3.5 h-3.5 text-slate-500" />
                  <span>Sign In</span>
                </Link>
                <Link
                  href="/auth/signup"
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
