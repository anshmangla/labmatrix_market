import React from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import InquiryBox from "@/components/inquiries/InquiryBox";
import {
  Clock,
  ShieldCheck,
  CheckCircle,
  FileText,
  PhoneOff,
  Building,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function RequirementDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const req = await prisma.requirement.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      description: true,
      category: true,
      status: true,
      createdAt: true,
      // CONFIDENTIALITY RULE: Buyer personal details are NOT selected!
    },
  });

  if (!req) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <div className="mb-6 flex items-center space-x-2 text-xs font-semibold text-slate-500">
          <Link href="/" className="hover:text-teal-600 transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link href="/requests" className="hover:text-teal-600 transition-colors">
            Buyer Requests
          </Link>
          <span>/</span>
          <span className="text-slate-800 truncate max-w-xs">{req.title}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column (2 Cols): Target Instrument Specs */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-xs border border-slate-200 space-y-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-teal-600">
                  {req.category}
                </span>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
                  {req.title}
                </h1>
                <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-slate-500">
                  <span className="flex items-center">
                    <Clock className="w-3.5 h-3.5 mr-1 text-slate-400" />
                    Requested on {new Date(req.createdAt).toLocaleDateString()}
                  </span>
                  <span>•</span>
                  <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-semibold">
                    Status: {req.status}
                  </span>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-6">
                <h2 className="text-base font-bold text-slate-900 mb-3 flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-teal-600" />
                  <span>Required Specifications & Application</span>
                </h2>
                <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-line bg-slate-50 p-5 rounded-xl border border-slate-100">
                  {req.description}
                </div>
              </div>

              {/* Broker Protection Callout */}
              <div className="bg-slate-900 text-white rounded-xl p-5 flex items-start space-x-3.5 shadow-sm">
                <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <PhoneOff className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-teal-400 uppercase tracking-wider">
                    Confidential Buyer Request
                  </h4>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    Buyer identity and budget ceiling are guarded confidentially.
                    If you own or represent a matching instrument, submit your
                    proposal. Our broker desk verifies the machine and presents
                    it to the buyer.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column (1 Col): Submit Matching Offer */}
          <div className="space-y-6">
            <InquiryBox
              requirementId={req.id}
              itemTitle={req.title}
              isOfferToRequirement={true}
            />

            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs text-xs text-slate-600 space-y-3">
              <h4 className="font-bold text-slate-900 text-sm">
                How Sellers Fulfill Requests
              </h4>
              <div className="flex items-start space-x-2">
                <CheckCircle className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" />
                <span>Submit your model details, photos, and price ask.</span>
              </div>
              <div className="flex items-start space-x-2">
                <CheckCircle className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" />
                <span>The platform administrator will reach out to inspect.</span>
              </div>
              <div className="flex items-start space-x-2">
                <CheckCircle className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" />
                <span>Zero direct exposure of your contact details to the buyer.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
