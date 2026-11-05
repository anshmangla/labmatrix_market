"use client";

import React, { useState } from "react";
import { FileText, Eye, ExternalLink, Download } from "lucide-react";
import PdfViewerModal from "@/components/listings/PdfViewerModal";

interface DocumentListProps {
  documents: string[];
  listingTitle: string;
}

export default function DocumentList({ documents, listingTitle }: DocumentListProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [activePdfUrl, setActivePdfUrl] = useState<string | null>(null);
  const [activePdfTitle, setActivePdfTitle] = useState<string>("");

  if (!documents || documents.length === 0) return null;

  const handleOpenPdf = (docUrl: string, displayName: string) => {
    setActivePdfUrl(docUrl);
    setActivePdfTitle(`${listingTitle} — ${displayName}`);
    setModalOpen(true);
  };

  return (
    <div className="bg-white rounded-2xl p-6 sm:p-7 shadow-xs border border-slate-200 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
          <FileText className="w-4 h-4 text-rose-600" />
          <span>Attached Documents & Manuals ({documents.length})</span>
        </h2>
        <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
          PDF Specifications
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {documents.map((docUrl: string, idx: number) => {
          const rawName = docUrl.split("/").pop()?.split("?")[0] || `Document_${idx + 1}.pdf`;
          const rawDecoded = decodeURIComponent(rawName);
          const isHashWithoutExt = !rawDecoded.includes(".");
          const displayName = isHashWithoutExt
            ? `${listingTitle} Datasheet.pdf`
            : rawDecoded.toLowerCase().endsWith(".pdf")
            ? rawDecoded
            : `${rawDecoded}.pdf`;

          const inlineStreamUrl = `/api/documents/serve?url=${encodeURIComponent(docUrl)}&title=${encodeURIComponent(displayName)}`;
          const downloadUrl = `/api/documents/serve?url=${encodeURIComponent(docUrl)}&title=${encodeURIComponent(displayName)}&download=1`;

          return (
            <div
              key={idx}
              className="flex items-center justify-between p-3.5 bg-slate-50 hover:bg-slate-100/80 rounded-xl border border-slate-200 transition-all group"
            >
              {/* Document Identity & Tap Target */}
              <button
                type="button"
                onClick={() => handleOpenPdf(docUrl, displayName)}
                className="flex items-center space-x-3 text-left min-w-0 flex-1 mr-2"
                title={`Preview ${displayName}`}
              >
                <div className="w-9 h-9 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform shadow-xs">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-slate-900 truncate group-hover:text-brand-blue transition-colors">
                    {displayName}
                  </p>
                  <p className="text-[11px] text-slate-500 flex items-center">
                    <span className="font-semibold text-rose-600 mr-1.5">PDF</span>
                    <span>• Tap to preview</span>
                  </p>
                </div>
              </button>

              {/* Action Buttons */}
              <div className="flex items-center space-x-1 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => handleOpenPdf(docUrl, displayName)}
                  className="p-1.5 text-slate-500 hover:text-brand-blue hover:bg-white rounded-lg transition-colors border border-transparent hover:border-slate-200 shadow-2xs"
                  title="Preview in page"
                >
                  <Eye className="w-4 h-4" />
                </button>

                <a
                  href={inlineStreamUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 text-slate-500 hover:text-brand-blue hover:bg-white rounded-lg transition-colors border border-transparent hover:border-slate-200 shadow-2xs"
                  title="Open in new window"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>

                <a
                  href={downloadUrl}
                  download={displayName}
                  className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-slate-200 shadow-2xs"
                  title="Download PDF"
                >
                  <Download className="w-4 h-4" />
                </a>
              </div>
            </div>
          );
        })}
      </div>

      {/* Lightbox Modal */}
      <PdfViewerModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        pdfUrl={activePdfUrl}
        title={activePdfTitle}
      />
    </div>
  );
}
