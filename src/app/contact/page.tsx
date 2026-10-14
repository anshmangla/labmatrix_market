"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  Send,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  ShieldCheck,
  Building,
  ArrowRight,
  ExternalLink,
} from "lucide-react";

const INQUIRY_CATEGORIES = [
  "Buy Pre-owned / Refurbished Laboratory Instrument",
  "Sell Surplus or Idle Analytical Equipment",
  "Spare Parts & Consumables Supply",
  "AMC & Preventive Maintenance / Relocation",
  "Analytical Laboratory Setup & Turnkey Consultancy",
  "Calibration & Validation Services",
  "General Business / Partnership Inquiry",
];

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [subject, setSubject] = useState(INQUIRY_CATEGORIES[0]);
  const [message, setMessage] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          phone,
          company,
          subject,
          message,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to submit message");
      }

      setSuccess(true);
      setName("");
      setEmail("");
      setPhone("");
      setCompany("");
      setMessage("");
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Header */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-blue-900 via-brand-blue to-slate-900 text-white py-16 sm:py-20">
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px] opacity-10" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-brand-gold/15 border border-brand-gold/40 text-brand-gold text-xs font-bold tracking-wide uppercase mb-4">
            <ShieldCheck className="w-4 h-4 text-brand-gold" />
            <span>LabMatrix Instrument India Pvt Ltd</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white max-w-3xl mx-auto">
            Get in Touch with Our{" "}
            <span className="bg-gradient-to-r from-brand-gold to-amber-300 bg-clip-text text-transparent">
              Laboratory Specialists
            </span>
          </h1>
          <p className="text-slate-300 text-sm sm:text-base mt-4 max-w-2xl mx-auto leading-relaxed">
            Have questions about buying, selling, or sourcing pre-owned analytical machinery,
            spare parts, or turnkey services? We are here to assist your laboratory.
          </p>

          {/* Breadcrumb */}
          <div className="mt-6 flex items-center justify-center space-x-2 text-xs text-slate-400">
            <Link href="/" className="hover:text-brand-gold transition-colors">
              Home
            </Link>
            <span>/</span>
            <span className="text-white font-semibold">Contact Us</span>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column (5 Cols): Official Direct Contact Channels */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-brand-blue block">
                  Official Communication Desk
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
                  Connect Directly
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Reach out directly through phone, WhatsApp, email, or visit our corporate office in New Delhi.
                </p>
              </div>

              {/* Channel 1: Phone & WhatsApp */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-start space-x-3.5 hover:border-brand-blue-200 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-brand-blue-50 text-brand-blue flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Phone className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                    Direct Sales & Support Hotline
                  </span>
                  <a
                    href="tel:+917303040804"
                    className="text-base font-black text-slate-900 hover:text-brand-blue hover:underline block mt-0.5"
                  >
                    +91 7303040804
                  </a>
                  <div className="flex items-center space-x-2 mt-2">
                    <a
                      href="tel:+917303040804"
                      className="inline-flex items-center space-x-1 text-xs font-bold px-2.5 py-1 bg-brand-blue hover:bg-brand-blue-500 text-white rounded-lg transition-colors shadow-xs"
                    >
                      <span>Call Now</span>
                    </a>
                    <a
                      href="https://wa.me/917303040804?text=Hello%20LabMatrix%20Team%2C%20I%20have%20an%20inquiry%20regarding%20laboratory%20equipment."
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-1 text-xs font-bold px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors shadow-xs"
                    >
                      <span>WhatsApp Chat</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>

              {/* Channel 2: Email */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-start space-x-3.5 hover:border-brand-blue-200 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-brand-blue-50 text-brand-blue flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Mail className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                    Official Quotations & Sales Email
                  </span>
                  <a
                    href="mailto:sales@labmatrixindia.com"
                    className="text-sm font-bold text-brand-blue hover:text-brand-blue-500 hover:underline break-all block mt-0.5"
                  >
                    sales@labmatrixindia.com
                  </a>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Send specification sheets, formal RFQs, or equipment photo portfolios.
                  </p>
                </div>
              </div>

              {/* Channel 3: Address */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-start space-x-3.5 hover:border-brand-blue-200 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-brand-blue-50 text-brand-blue flex items-center justify-center flex-shrink-0 mt-0.5">
                  <MapPin className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                    Corporate Headquarters
                  </span>
                  <p className="text-sm font-bold text-slate-900 mt-0.5 leading-snug">
                    LABMATRIX INSTRUMENT INDIA PVT LTD
                  </p>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    514/5, Mehrauli, New Delhi – 110030, India
                  </p>
                </div>
              </div>

              {/* Channel 4: Operating Hours */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-start space-x-3.5">
                <div className="w-10 h-10 rounded-xl bg-brand-gold-50 text-brand-gold-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                    Business Hours
                  </span>
                  <p className="text-xs font-bold text-slate-900 mt-0.5">
                    Monday to Saturday: 9:30 AM – 6:30 PM IST
                  </p>
                  <span className="inline-block mt-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                    Average response: 2–4 hours
                  </span>
                </div>
              </div>
            </div>

            {/* Platform Assurance Callout */}
            <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-sm border border-slate-800 space-y-3">
              <div className="flex items-center space-x-2 text-brand-gold font-bold text-xs uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4" />
                <span>LabMatrix Assurance Guarantee</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Every instrument and spare part listed or requested through LabMatrix is
                handled with strict confidentiality, verification support, and pan-India logistics coordination.
              </p>
            </div>
          </div>

          {/* Right Column (7 Cols): Interactive Form */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-10 shadow-xs">
              <div className="border-b border-slate-100 pb-5 mb-6">
                <span className="text-xs font-bold uppercase tracking-wider text-brand-blue">
                  Online Inquiry Form
                </span>
                <h2 className="text-2xl font-black text-slate-900 mt-1">
                  Send Us an Inquiry
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Fill out your details below. Your message will be automatically dispatched to our engineering sales desk via Resend.
                </p>
              </div>

              {success && (
                <div className="mb-6 rounded-2xl bg-emerald-50 border border-emerald-200 p-6 text-emerald-900 space-y-2">
                  <div className="flex items-center space-x-2 font-bold text-emerald-800 text-sm">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                    <span>Inquiry Sent Successfully!</span>
                  </div>
                  <p className="text-xs text-emerald-800 leading-relaxed">
                    Thank you for reaching out. We have received your inquiry and sent an acknowledgment to your email. Our sales engineering team will contact you within 2 to 4 business hours.
                  </p>
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => setSuccess(false)}
                      className="text-xs font-bold text-emerald-700 underline hover:text-emerald-900"
                    >
                      Send another inquiry
                    </button>
                  </div>
                </div>
              )}

              {error && (
                <div className="mb-6 rounded-xl bg-red-50 border border-red-200 p-4 text-red-700 text-xs flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Full Name */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Your Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Dr. Rajesh Sharma"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm text-slate-900 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-brand-blue transition-colors"
                    />
                  </div>

                  {/* Email Address */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Official Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. r.sharma@pharma-lab.in"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm text-slate-900 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-brand-blue transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Phone Number */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Mobile / WhatsApp Number *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+91 98765 43210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm text-slate-900 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-brand-blue transition-colors"
                    />
                  </div>

                  {/* Company / Lab Name */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Company / Laboratory Name (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Apex Analytical Research Ltd"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm text-slate-900 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-brand-blue transition-colors"
                    />
                  </div>
                </div>

                {/* Requirement Category */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    What is your inquiry related to? *
                  </label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-brand-blue transition-colors cursor-pointer"
                  >
                    {INQUIRY_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Message */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Detailed Message & Equipment Specifications *
                  </label>
                  <textarea
                    required
                    rows={5}
                    placeholder="Specify model numbers (HPLC, GC-MS, FTIR), manufacturer preference, urgency, target city/state, or any specific spare part catalog IDs..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm text-slate-900 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-brand-blue transition-colors"
                  />
                </div>

                {/* Submit Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-8 py-3.5 bg-brand-blue hover:bg-brand-blue-500 text-white font-bold rounded-xl text-sm transition-all shadow-md hover:shadow-lg disabled:opacity-50 cursor-pointer"
                  >
                    <span>{loading ? "Sending Message..." : "Submit Inquiry Message"}</span>
                    {!loading && <Send className="w-4 h-4 ml-1" />}
                  </button>
                  <p className="text-[11px] text-slate-400 mt-2">
                    🔒 Your contact information is kept strictly confidential and only used to respond to your inquiry.
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Embedded Interactive Google Map */}
        <div className="mt-16 bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-brand-blue block">
                Office Location
              </span>
              <h3 className="text-lg font-black text-slate-900">
                LABMATRIX INSTRUMENT INDIA PVT LTD
              </h3>
              <p className="text-xs text-slate-500">
                514/5, Mehrauli, New Delhi – 110030
              </p>
            </div>
            <a
              href="https://maps.google.com/?q=514/5,+Mehrauli,+New+Delhi+110030"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-brand-blue bg-brand-blue-50 hover:bg-brand-blue-100 transition-colors self-start sm:self-auto"
            >
              <span>Open in Google Maps</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="w-full h-80 sm:h-96 bg-slate-100 relative">
            <iframe
              title="LabMatrix Office Location Map"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
              src="https://maps.google.com/maps?q=514/5%20Mehrauli%20New%20Delhi%20110030%20India&t=&z=14&ie=UTF8&iwloc=&output=embed"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
