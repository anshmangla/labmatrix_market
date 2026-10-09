import React from "react";
import Link from "next/link";
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
      <section className="relative bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800 text-white py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center space-x-2 bg-teal-500/10 border border-teal-500/30 px-3.5 py-1.5 rounded-full text-xs font-semibold text-teal-400">
            <ShieldCheck className="w-4 h-4" />
            <span>Confidential Brokerage • No Public Contact Details</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight">
            Buy & Sell Pre-Owned <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-400">
              Pharma & Analytical Equipment
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
            A trusted, broker-managed platform for high-precision analytical
            instruments. Browse available machines or submit your equipment
            requirements—all transactions are negotiated securely through our
            dedicated desk.
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
                className="bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm px-6 py-3 rounded-xl transition-colors flex items-center justify-center space-x-2"
              >
                <span>Find Machines</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap justify-center gap-4 pt-4">
            <Link
              href="/listings/create"
              className="inline-flex items-center space-x-2 bg-white text-slate-900 hover:bg-slate-100 font-semibold px-5 py-2.5 rounded-xl text-sm transition-all shadow-md"
            >
              <PlusCircle className="w-4 h-4 text-teal-600" />
              <span>List a Surplus Machine</span>
            </Link>
            <Link
              href="/requests/create"
              className="inline-flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-all"
            >
              <FileQuestion className="w-4 h-4 text-teal-400" />
              <span>Post Machine Wanted</span>
            </Link>
            <Link
              href="/requests"
              className="inline-flex items-center space-x-2 bg-transparent hover:bg-slate-800/80 text-slate-300 font-semibold px-4 py-2.5 rounded-xl text-sm transition-all"
            >
              <span>View Buyer Requests →</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Brokerage Trust Pillars */}
      <section className="py-12 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex items-start space-x-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
              <div className="w-12 h-12 rounded-xl bg-teal-100 flex items-center justify-center flex-shrink-0 text-teal-700">
                <PhoneOff className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">
                  Zero Direct Contact Exposure
                </h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Neither buyers nor sellers see each other&apos;s phone numbers or
                  company identities. We prevent unsolicited calls and direct
                  bypasses.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0 text-emerald-700">
                <UserCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">
                  Broker-Mediated Deals
                </h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Every inquiry and request is reviewed and managed directly by our
                  brokerage desk to verify equipment condition and pricing.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0 text-blue-700">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">
                  Frictionless Onboarding
                </h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Sign up instantly via Email or Google. Your mobile number and
                  company details are only requested when you choose to list or
                  request.
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
              <span className="text-xs font-bold uppercase tracking-wider text-teal-600">
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
                  className="bg-white p-5 rounded-2xl border border-slate-200/80 hover:border-teal-500 hover:shadow-md transition-all group flex flex-col justify-between"
                >
                  <div className="w-10 h-10 rounded-xl bg-slate-100 group-hover:bg-teal-50 flex items-center justify-center text-slate-700 group-hover:text-teal-600 transition-colors mb-4">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm group-hover:text-teal-600 transition-colors">
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
            <span className="text-xs font-bold uppercase tracking-wider text-teal-600">
              Confidentiality First
            </span>
            <h2 className="text-3xl font-black text-slate-900 mt-1">
              How Deals Work on LabMatrix
            </h2>
            <p className="text-sm text-slate-600 mt-3">
              We eliminate unsolicited contacts by acting as your dedicated
              dealmaker throughout the lifecycle.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200/70 flex flex-col">
              <div className="text-3xl font-black text-teal-600 mb-3">01</div>
              <h3 className="font-bold text-slate-900 text-lg">
                Post Machine or Request
              </h3>
              <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                Add equipment specs, photos, and approximate price range. Or post
                what you need. Your contact info is stored privately for the
                administrator only.
              </p>
            </div>

            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200/70 flex flex-col">
              <div className="text-3xl font-black text-teal-600 mb-3">02</div>
              <h3 className="font-bold text-slate-900 text-lg">
                Direct Broker Inquiry
              </h3>
              <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                When a buyer is interested, they click &quot;Inquire&quot;. The notification
                goes straight to our broker desk—not to other users or public
                eyes.
              </p>
            </div>

            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200/70 flex flex-col">
              <div className="text-3xl font-black text-teal-600 mb-3">03</div>
              <h3 className="font-bold text-slate-900 text-lg">
                Mediated Close
              </h3>
              <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                We coordinate inspections, condition verification, price
                negotiations, and safe handover between both parties.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-teal-500 text-white flex items-center justify-center font-bold text-sm">
              LM
            </div>
            <span className="text-lg font-bold text-white">LabMatrix</span>
          </div>
          <p className="text-xs text-slate-500">
            &copy; 2026 LabMatrix. Confidential Brokered Marketplace for Pharma & Analytical Equipment.
          </p>
        </div>
      </footer>
    </div>
  );
}
