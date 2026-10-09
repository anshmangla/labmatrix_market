"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import {
  Shield,
  PlusCircle,
  LogIn,
  LogOut,
  User,
  Menu,
  X,
  FileQuestion,
  LayoutDashboard,
} from "lucide-react";

export default function Navbar() {
  const { data: session, status } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <div className="flex items-center space-x-3">
            <Link href="/" className="flex items-center space-x-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-teal-600 flex items-center justify-center text-white font-bold text-lg shadow-sm group-hover:bg-teal-700 transition-colors">
                LM
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-black tracking-tight text-slate-900 leading-none">
                  LabMatrix
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider text-teal-600 mt-0.5">
                  Analytical & Pharma
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Nav links */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2 text-sm font-medium text-slate-600">
            <Link
              href="/listings"
              className="px-3 py-2 rounded-lg hover:text-teal-600 hover:bg-slate-50 transition-colors"
            >
              Browse Equipment
            </Link>
            <Link
              href="/requests"
              className="px-3 py-2 rounded-lg hover:text-teal-600 hover:bg-slate-50 transition-colors"
            >
              Buyer Requests
            </Link>
            <Link
              href="/#how-it-works"
              className="px-3 py-2 rounded-lg hover:text-teal-600 hover:bg-slate-50 transition-colors flex items-center space-x-1"
            >
              <Shield className="w-3.5 h-3.5 text-teal-600" />
              <span>Brokerage Process</span>
            </Link>
            <Link
              href="/listings/create"
              className="px-3 py-2 rounded-lg text-teal-700 bg-teal-50 hover:bg-teal-100 font-semibold transition-colors flex items-center space-x-1"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>List Machine</span>
            </Link>
            <Link
              href="/requests/create"
              className="px-3 py-2 rounded-lg text-slate-700 hover:text-teal-600 hover:bg-slate-50 font-semibold transition-colors"
            >
              + Post Request
            </Link>
          </nav>

          {/* Desktop Right Action Buttons & Auth */}
          <div className="hidden md:flex items-center space-x-3">
            {status === "loading" ? (
              <div className="h-8 w-20 bg-slate-100 rounded-lg animate-pulse" />
            ) : session?.user ? (
              <div className="flex items-center space-x-3">
                {(session.user as any)?.role === "ADMIN" && (
                  <Link
                    href="/admin"
                    className="inline-flex items-center space-x-1.5 text-xs font-bold bg-slate-900 text-white hover:bg-teal-600 px-3 py-1.5 rounded-full transition-colors shadow-xs"
                  >
                    <Shield className="w-3 h-3 text-teal-400" />
                    <span>Admin Desk</span>
                  </Link>
                )}

                <Link
                  href="/dashboard"
                  className="flex items-center space-x-2 text-xs font-semibold text-slate-700 hover:text-teal-700 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-full border border-slate-200 transition-colors"
                  title="Open Dashboard"
                >
                  <User className="w-3.5 h-3.5 text-teal-600" />
                  <span className="max-w-[120px] truncate">
                    {session.user.name || session.user.email}
                  </span>
                </Link>

                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="inline-flex items-center space-x-1 text-xs font-semibold text-slate-600 hover:text-red-600 px-2.5 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
                  title="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden lg:inline">Sign out</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  href="/auth/signin"
                  className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  <LogIn className="w-4 h-4 text-slate-500" />
                  <span>Sign In</span>
                </Link>
                <Link
                  href="/auth/signup"
                  className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 shadow-sm transition-all"
                >
                  <span>Register</span>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Hamburger Button */}
          <div className="flex items-center md:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3 shadow-lg">
          <nav className="flex flex-col space-y-1 text-sm font-semibold text-slate-700">
            <Link
              href="/listings"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2.5 rounded-xl hover:bg-slate-100 flex items-center justify-between"
            >
              <span>Browse Equipment</span>
            </Link>
            <Link
              href="/requests"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2.5 rounded-xl hover:bg-slate-100 flex items-center justify-between"
            >
              <span>Buyer Requests</span>
            </Link>
            <Link
              href="/#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2.5 rounded-xl hover:bg-slate-100 flex items-center space-x-2"
            >
              <Shield className="w-4 h-4 text-teal-600" />
              <span>Brokerage Process</span>
            </Link>
            <Link
              href="/listings/create"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2.5 rounded-xl bg-teal-50 text-teal-700 flex items-center space-x-2"
            >
              <PlusCircle className="w-4 h-4" />
              <span>List a Surplus Machine</span>
            </Link>
            <Link
              href="/requests/create"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2.5 rounded-xl hover:bg-slate-100 flex items-center space-x-2"
            >
              <FileQuestion className="w-4 h-4 text-slate-500" />
              <span>Post Machine Wanted</span>
            </Link>

            {session?.user && (
              <Link
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2.5 rounded-xl hover:bg-slate-100 flex items-center space-x-2"
              >
                <LayoutDashboard className="w-4 h-4 text-teal-600" />
                <span>My Dashboard</span>
              </Link>
            )}

            {(session?.user as any)?.role === "ADMIN" && (
              <Link
                href="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2.5 rounded-xl bg-slate-900 text-white flex items-center space-x-2"
              >
                <Shield className="w-4 h-4 text-teal-400" />
                <span>Admin Deal Desk</span>
              </Link>
            )}
          </nav>

          <div className="pt-3 border-t border-slate-100">
            {session?.user ? (
              <div className="flex items-center justify-between pt-1">
                <span className="text-xs text-slate-600 truncate max-w-[200px]">
                  {session.user.email}
                </span>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    signOut({ callbackUrl: "/" });
                  }}
                  className="text-xs font-bold text-red-600 hover:underline flex items-center space-x-1"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign out</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-1">
                <Link
                  href="/auth/signin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-2.5 text-center text-xs font-bold border border-slate-300 rounded-xl text-slate-700 hover:bg-slate-50"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-2.5 text-center text-xs font-bold bg-teal-600 text-white rounded-xl hover:bg-teal-700"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
