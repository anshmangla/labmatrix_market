import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Phone, Mail, MapPin, ExternalLink, ShieldCheck } from "lucide-react";

export default function Footer() {
  return (
    <footer className="mt-auto bg-slate-900 text-slate-400 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Col 1: Brand & Bio */}
          <div className="space-y-4">
            <Link
              href="/"
              className="inline-flex items-center bg-white/95 hover:bg-white px-3 py-1.5 rounded-xl transition-all shadow-xs"
            >
              <Image
                src="/logo.png"
                alt="Labmatrix - Keeping Science Ahead"
                width={150}
                height={32}
                className="h-7 w-auto object-contain"
              />
            </Link>
            <p className="text-xs text-slate-400 leading-relaxed">
              LabMatrix Instrument India Pvt. Ltd. is a premier Indian marketplace
              and engineering provider for pre-owned analytical machinery, spare parts,
              and turnkey laboratory solutions.
            </p>
            <div className="inline-flex items-center space-x-1.5 text-[11px] font-bold text-brand-gold bg-brand-gold/10 border border-brand-gold/25 px-2.5 py-1 rounded-full">
              <ShieldCheck className="w-3.5 h-3.5 text-brand-gold" />
              <span>Verified Scientific Equipment</span>
            </div>
          </div>

          {/* Col 2: Marketplace Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Marketplace Catalogs
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link
                  href="/listings"
                  className="hover:text-white transition-colors"
                >
                  Browse Analytical Equipment
                </Link>
              </li>
              <li>
                <Link
                  href="/spare-parts"
                  className="hover:text-white transition-colors"
                >
                  Spare Parts & Consumables
                </Link>
              </li>
              <li>
                <Link
                  href="/requests"
                  className="hover:text-white transition-colors"
                >
                  Active Buyer Procurement Requests
                </Link>
              </li>
              <li>
                <Link
                  href="/listings/create"
                  className="hover:text-brand-gold font-semibold transition-colors"
                >
                  + List Surplus Machinery
                </Link>
              </li>
              <li>
                <Link
                  href="/requests/create"
                  className="hover:text-brand-gold font-semibold transition-colors"
                >
                  + Post Instrument Requirement
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Company & Direct Services */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Corporate & Services
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link
                  href="/contact"
                  className="hover:text-white transition-colors font-semibold text-slate-200"
                >
                  Contact Us & Direct Inquiries
                </Link>
              </li>
              <li>
                <Link
                  href="/#how-it-works"
                  className="hover:text-white transition-colors"
                >
                  How Verification Works
                </Link>
              </li>
              <li>
                <a
                  href="https://www.labmatrixindia.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-1 text-slate-400 hover:text-brand-gold transition-colors"
                >
                  <span>Official Main Site (labmatrixindia.com)</span>
                  <ExternalLink className="w-3 h-3 ml-0.5" />
                </a>
              </li>
              <li>
                <a
                  href="https://www.labmatrixindia.com/service/amc-and-preventive-maintenance.php"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  AMC & Preventive Maintenance
                </a>
              </li>
              <li>
                <a
                  href="https://www.labmatrixindia.com/service/re-engineering-services--or--pre-owned-or--refurbished-analytical-instruments.php"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  Refurbished Instrument Calibration
                </a>
              </li>
            </ul>
          </div>

          {/* Col 4: Official Contacts */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Headquarters & Support
            </h4>
            <div className="space-y-2.5 text-xs">
              <div className="flex items-start space-x-2">
                <MapPin className="w-4 h-4 text-brand-gold flex-shrink-0 mt-0.5" />
                <span className="leading-snug">
                  LABMATRIX INSTRUMENT INDIA PVT LTD<br />
                  514/5, Mehrauli, New Delhi – 110030
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-brand-gold flex-shrink-0" />
                <a
                  href="tel:+917303040804"
                  className="font-bold text-white hover:text-brand-gold transition-colors"
                >
                  +91 7303040804
                </a>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-brand-gold flex-shrink-0" />
                <a
                  href="mailto:sales@labmatrixindia.com"
                  className="text-slate-300 hover:text-white transition-colors break-all"
                >
                  sales@labmatrixindia.com
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 mt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <p>
            &copy; {new Date().getFullYear()} LABMATRIX INSTRUMENT INDIA PVT LTD. All rights reserved.
          </p>
          <div className="flex items-center space-x-4">
            <Link href="/contact" className="hover:text-slate-400 transition-colors">
              Contact Sales
            </Link>
            <span>•</span>
            <a
              href="https://www.labmatrixindia.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-slate-400 transition-colors"
            >
              labmatrixindia.com
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
