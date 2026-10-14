import React from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
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
  const session = await auth();

  const req = await prisma.requirement.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      description: true,
      category: true,
      itemType: true,
      partNumber: true,
      compatibleWith: true,
      status: true,
      isApproved: true,
      buyerId: true,
      createdAt: true,
      // PRIVACY RULE: Buyer personal details are NOT selected!
    },
  });

  if (!req) {
    notFound();
  }

  const isOwner = session?.user?.id === req.buyerId;
  const isAdmin = (session?.user as any)?.role === "ADMIN";

  // If not approved, only owner or admin can preview it
  if (!req.isApproved && !isOwner && !isAdmin) {
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

        {/* Pending Approval Banner for Owner/Admin */}
        {!req.isApproved && (
          <div className="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start space-x-3 shadow-xs">
            <Clock className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold uppercase tracking-wider bg-amber-200/60 text-amber-900 px-2 py-0.5 rounded">
                  Private Owner Preview
                </span>
                <span className="text-xs font-bold text-amber-800">• Pending Admin Approval</span>
              </div>
              <p className="text-xs text-amber-800 mt-1">
                This procurement request is currently under admin review and is not visible to the public. You will receive an on-site notification (bell icon) as soon as it is approved.
              </p>
            </div>
          </div>
        )}

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

                {req.itemType === "SPARE_PART" && (
                  <div className="mt-4 p-3.5 bg-teal-50/70 rounded-xl border border-teal-200/80 flex flex-wrap gap-5 text-xs">
                    {req.compatibleWith && (
                      <div>
                        <span className="text-slate-400 block font-bold text-[10px] uppercase">
                          Target Instrument / Model
                        </span>
                        <span className="font-bold text-slate-900 text-sm">{req.compatibleWith}</span>
                      </div>
                    )}
                    {req.partNumber && (
                      <div>
                        <span className="text-slate-400 block font-bold text-[10px] uppercase">
                          Part / Catalog #
                        </span>
                        <span className="font-bold text-slate-900 font-mono text-sm">{req.partNumber}</span>
                      </div>
                    )}
                  </div>
                )}
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

              {/* Marketplace Procurement Callout */}
              <div className="bg-slate-900 text-white rounded-xl p-5 flex items-start space-x-3.5 shadow-sm">
                <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-teal-400 uppercase tracking-wider">
                    Verified Procurement Request
                  </h4>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    This requirement is actively requested by a verified laboratory.
                    If you own or represent matching equipment or spare parts, submit your
                    proposal using the form on the right.
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
                <span>The platform coordinator will assist in facilitating the review.</span>
              </div>
              <div className="flex items-start space-x-2">
                <CheckCircle className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" />
                <span>Secure quotation and deal coordination through the platform.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
