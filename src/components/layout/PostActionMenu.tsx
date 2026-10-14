"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { PlusCircle, FileQuestion, ChevronDown, Tag, Sparkles } from "lucide-react";

export default function PostActionMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

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

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-black tracking-wide text-brand-blue bg-brand-gold hover:bg-brand-gold-300 shadow-xs hover:shadow-sm transition-all cursor-pointer ${
          isOpen ? "ring-2 ring-brand-gold-400 ring-offset-1" : ""
        }`}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label="Create listing or post requirement"
      >
        <PlusCircle className="w-4 h-4 text-brand-blue flex-shrink-0" />
        <span>Post / Sell</span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-brand-blue/80 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200/90 p-2 z-50 animate-in fade-in zoom-in-95 duration-150 space-y-1">
          {/* Action 1: Sell / List */}
          <Link
            href="/listings/create"
            onClick={() => setIsOpen(false)}
            className="flex items-start space-x-3 p-3 rounded-xl hover:bg-brand-gold/15 transition-colors group"
          >
            <div className="w-8 h-8 rounded-lg bg-brand-gold/30 text-brand-blue flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
              <Tag className="w-4 h-4 text-brand-blue" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-1.5">
                <span className="text-xs font-black text-slate-900 group-hover:text-brand-blue">
                  Sell Equipment / Spares
                </span>
                <span className="text-[10px] font-bold text-brand-blue bg-brand-gold/30 px-1.5 py-0.2 rounded">
                  Seller
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                List surplus analytical instruments, lab machines, or replacement components.
              </p>
            </div>
          </Link>

          {/* Action 2: Post Buyer Requirement */}
          <Link
            href="/requests/create"
            onClick={() => setIsOpen(false)}
            className="flex items-start space-x-3 p-3 rounded-xl hover:bg-brand-blue-50/70 transition-colors group"
          >
            <div className="w-8 h-8 rounded-lg bg-brand-blue-50 text-brand-blue flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
              <FileQuestion className="w-4 h-4 text-brand-blue" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-1.5">
                <span className="text-xs font-black text-slate-900 group-hover:text-brand-blue">
                  Post Sourcing Requirement
                </span>
                <span className="text-[10px] font-bold text-brand-blue bg-brand-blue-100/60 px-1.5 py-0.2 rounded">
                  Buyer
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                Can't find a specific machine or part? Request quotes from our verified network.
              </p>
            </div>
          </Link>
        </div>
      )}
    </div>
  );
}
