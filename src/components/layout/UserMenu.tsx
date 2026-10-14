"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import {
  User,
  LayoutDashboard,
  Package,
  FileText,
  MessageSquare,
  Shield,
  LogOut,
  ChevronDown,
  CheckCircle2,
} from "lucide-react";

interface UserMenuProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: string;
  };
}

export default function UserMenu({ user }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Click-outside listener
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Escape key listener
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const displayName = user.name || user.email?.split("@")[0] || "Account";
  const initials = (user.name || user.email || "LM")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const isAdmin = user.role === "ADMIN";

  return (
    <div className="relative" ref={menuRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center space-x-2 pl-2 pr-3 py-1.5 rounded-full border transition-all text-xs font-semibold ${
          isOpen
            ? "border-brand-blue bg-brand-blue-50/80 text-brand-blue ring-2 ring-brand-blue/20"
            : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
        }`}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label="User account menu"
      >
        <div className="w-6 h-6 rounded-full bg-brand-blue text-white flex items-center justify-center font-bold text-[11px] shadow-xs">
          {initials}
        </div>
        <span className="max-w-[110px] truncate text-slate-800 font-medium">
          {displayName}
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
            isOpen ? "rotate-180 text-brand-blue" : ""
          }`}
        />
      </button>

      {/* Floating Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200/90 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
          {/* User Profile Header */}
          <div className="px-4 py-3 border-b border-slate-100">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-full bg-brand-blue/10 text-brand-blue flex items-center justify-center font-bold text-xs">
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-slate-900 truncate">
                  {user.name || "Lab User"}
                </p>
                <p className="text-[11px] text-slate-500 truncate" title={user.email || ""}>
                  {user.email}
                </p>
              </div>
            </div>

            <div className="mt-2.5 flex items-center gap-1.5">
              {isAdmin ? (
                <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-brand-blue-900 text-brand-gold border border-brand-gold/30">
                  <Shield className="w-3 h-3 text-brand-gold" />
                  <span>Platform Admin</span>
                </span>
              ) : (
                <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  <span>Verified Member</span>
                </span>
              )}
            </div>
          </div>

          {/* Core Navigation Items */}
          <div className="py-1 text-xs font-medium text-slate-700">
            <Link
              href="/dashboard"
              onClick={() => setIsOpen(false)}
              className="flex items-center space-x-2.5 px-4 py-2 hover:bg-slate-50 hover:text-brand-blue transition-colors"
            >
              <LayoutDashboard className="w-4 h-4 text-slate-400 group-hover:text-brand-blue" />
              <span>Dashboard Overview</span>
            </Link>

            <Link
              href="/dashboard?tab=listings"
              onClick={() => setIsOpen(false)}
              className="flex items-center space-x-2.5 px-4 py-2 hover:bg-slate-50 hover:text-brand-blue transition-colors"
            >
              <Package className="w-4 h-4 text-slate-400" />
              <span>My Listed Equipment</span>
            </Link>

            <Link
              href="/dashboard?tab=requests"
              onClick={() => setIsOpen(false)}
              className="flex items-center space-x-2.5 px-4 py-2 hover:bg-slate-50 hover:text-brand-blue transition-colors"
            >
              <FileText className="w-4 h-4 text-slate-400" />
              <span>My Sourcing Requirements</span>
            </Link>

            <Link
              href="/dashboard?tab=inquiries"
              onClick={() => setIsOpen(false)}
              className="flex items-center space-x-2.5 px-4 py-2 hover:bg-slate-50 hover:text-brand-blue transition-colors"
            >
              <MessageSquare className="w-4 h-4 text-slate-400" />
              <span>Inquiries & Messages</span>
            </Link>

            {isAdmin && (
              <div className="pt-1 mt-1 border-t border-slate-100">
                <Link
                  href="/admin"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center space-x-2.5 px-4 py-2 text-brand-blue bg-brand-blue-50/50 hover:bg-brand-blue-50 hover:text-brand-blue-700 font-bold transition-colors"
                >
                  <Shield className="w-4 h-4 text-brand-blue" />
                  <span>Admin Deal Desk</span>
                </Link>
              </div>
            )}
          </div>

          {/* Sign Out Action */}
          <div className="pt-1 border-t border-slate-100">
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                signOut({ callbackUrl: "/" });
              }}
              className="w-full flex items-center space-x-2.5 px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50/70 transition-colors text-left cursor-pointer"
            >
              <LogOut className="w-4 h-4 text-red-500" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
