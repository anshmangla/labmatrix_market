import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Search,
  ShieldCheck,
  PhoneOff,
  UserCheck,
  ArrowRight,
  PlusCircle,
  FileQuestion,
  Cpu,
  Layers,
  FlaskConical,
  Gauge,
  Microscope,
} from "lucide-react";

export default function Home() {
  const categories = [
    { name: "HPLC & UHPLC", count: "Chromatography", icon: Gauge },
    { name: "GC & GC-MS", count: "Gas Systems", icon: FlaskConical },
    { name: "UV-Vis & FTIR", count: "Spectroscopy", icon: Microscope },
    { name: "Dissolution Testers", count: "Pharma QA/QC", icon: Layers },
    { name: "Stability Chambers", count: "Environmental", icon: Cpu },
    { name: "Particle Analyzers", count: "Physical Testing", icon: Gauge },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-brand-blue-950 via-brand-blue-900 to-slate-900 text-white py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center space-x-2 bg-brand-gold/15 border border-brand-gold/40 px-4 py-1.5 rounded-full text-xs font-bold text-brand-gold shadow-xs">
            <ShieldCheck className="w-4 h-4 text-brand-gold" />
            <span>Verified B2B Marketplace • Laboratory Instruments & Spares</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight">
            Buy & Sell Pre-Owned <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-gold via-amber-300 to-yellow-200">
              Pharma & Analytical Equipment
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
            The dedicated marketplace for laboratories, pharma facilities, and
            research centers to buy and sell high-precision analytical
            instruments and certified spare parts with verified equipment
            specifications.
          </p>

          {/* Search Bar Form */}
          <form action="/listings" method="GET" className="max-w-2xl mx-auto">
            <div className="bg-white p-2 rounded-2xl shadow-2xl flex flex-col sm:flex-row gap-2 border border-slate-700/20">
              <div className="flex-1 flex items-center px-4 py-2 text-slate-700">
                <Search className="w-5 h-5 text-slate-400 mr-3 flex-shrink-0" />
                <input
                  name="query"
                  type="text"
                  placeholder="Search HPLC, GC-MS, Agilent, Waters, Shimadzu..."
                  className="w-full bg-transparent border-none focus:outline-none text-sm text-slate-900 placeholder-slate-400"
                />
              </div>
              <button
                type="submit"
                className="bg-brand-blue hover:bg-brand-blue-500 text-white font-bold text-sm px-7 py-3 rounded-xl transition-all shadow-md flex items-center justify-center space-x-2"
              >
                <span>Find Machines</span>
                <ArrowRight className="w-4 h-4 text-brand-gold" />
              </button>
            </div>
          </form>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap justify-center gap-4 pt-4">
            <Link
              href="/listings/create"
              className="inline-flex items-center space-x-2 bg-brand-gold text-brand-blue hover:bg-brand-gold-300 font-bold px-5 py-2.5 rounded-xl text-sm transition-all shadow-md"
            >
              <PlusCircle className="w-4 h-4 text-brand-blue" />
              <span>List a Surplus Machine</span>
            </Link>
            <Link
              href="/requests/create"
              className="inline-flex items-center space-x-2 bg-brand-blue-900/80 hover:bg-brand-blue-800 border border-brand-blue-700/60 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-all"
            >
              <FileQuestion className="w-4 h-4 text-brand-gold" />
              <span>Post Machine Wanted</span>
            </Link>
            <Link
              href="/requests"
              className="inline-flex items-center space-x-2 bg-transparent hover:bg-brand-blue-900/40 text-slate-300 hover:text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition-all"
            >
              <span>View Buyer Requests →</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Marketplace Trust Pillars */}
      <section className="py-12 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex items-start space-x-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
              <div className="w-12 h-12 rounded-xl bg-brand-blue-50 flex items-center justify-center flex-shrink-0 text-brand-blue">
                <UserCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">
                  Verified Industry Network
                </h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Connect with verified pharmaceutical manufacturers, research institutes,
                  and analytical testing facilities across India.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
              <div className="w-12 h-12 rounded-xl bg-brand-gold-50 flex items-center justify-center flex-shrink-0 text-brand-gold-700">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">
                  Direct Inquiries & Quotes
                </h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Submit inquiries and price proposals directly on any machine or spare part.
                  Coordinated with verified equipment specs and pricing.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
              <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0 text-slate-700">
                <Cpu className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">
                  Quality Testing Equipment
                </h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Access premium chromatography, spectroscopy, dissolution systems, and
                  genuine consumables from global industry leaders.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-brand-blue">
                Instrument Categories
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
                Explore Laboratory Machinery
              </h2>
            </div>
            <p className="text-sm text-slate-500 max-w-md mt-2 md:mt-0">
              High-value analytical test instruments from top global pharma
              manufacturers.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((cat, idx) => {
              const Icon = cat.icon;
              return (
                <Link
                  key={idx}
                  href={`/listings?category=${encodeURIComponent(cat.name)}`}
                  className="bg-white p-5 rounded-2xl border border-slate-200/80 hover:border-brand-blue hover:shadow-md transition-all group flex flex-col justify-between"
                >
                  <div className="w-10 h-10 rounded-xl bg-slate-100 group-hover:bg-brand-blue flex items-center justify-center text-slate-700 group-hover:text-brand-gold transition-colors mb-4">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm group-hover:text-brand-blue transition-colors">
                      {cat.name}
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {cat.count}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-white border-t border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-blue">
              Simple & Transparent
            </span>
            <h2 className="text-3xl font-black text-slate-900 mt-1">
              How It Works on LabMatrix
            </h2>
            <p className="text-sm text-slate-600 mt-3">
              A streamlined process to list equipment, submit inquiries, and connect
              verified buyers with sellers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200/70 flex flex-col">
              <div className="text-3xl font-black text-brand-blue mb-3">01</div>
              <h3 className="font-bold text-slate-900 text-lg">
                List Equipment or Post Request
              </h3>
              <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                Add equipment specifications, high-res photos, and approximate price range.
                Or post the machine or spare parts your laboratory needs.
              </p>
            </div>

            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200/70 flex flex-col">
              <div className="text-3xl font-black text-brand-blue mb-3">02</div>
              <h3 className="font-bold text-slate-900 text-lg">
                Send Inquiry / Request Quote
              </h3>
              <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                When interested in an item, click &quot;Inquire&quot; to send questions or price
                proposals. Inquiries are handled promptly with verified specifications.
              </p>
            </div>

            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200/70 flex flex-col">
              <div className="text-3xl font-black text-brand-blue mb-3">03</div>
              <h3 className="font-bold text-slate-900 text-lg">
                Verified Handover & Inspection
              </h3>
              <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                Coordinate instrument inspections, calibration records verification, and
                secure delivery between laboratories.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
