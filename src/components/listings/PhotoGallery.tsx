"use client";

import React, { useState } from "react";
import { Tag, FileText, ExternalLink, Eye, Download } from "lucide-react";
import { getOptimizedImageUrl, IMAGE_PRESETS } from "@/lib/images";
import PdfViewerModal from "@/components/listings/PdfViewerModal";

export type MediaItem =
  | { type: "photo"; url: string; id: string }
  | { type: "pdf"; url: string; id: string; name: string };

export default function PhotoGallery({
  photos = [],
  documents = [],
  title,
}: {
  photos: string[];
  documents?: string[];
  title: string;
}) {
  const [activeIdx, setActiveIdx] = useState(0);

  // PDF Lightbox Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [activePdfUrl, setActivePdfUrl] = useState<string | null>(null);
  const [activePdfTitle, setActivePdfTitle] = useState<string>("");

  const mediaItems: MediaItem[] = [
    ...photos.map((url, idx) => ({
      type: "photo" as const,
      url,
      id: `photo-${idx}`,
    })),
    ...(documents || []).map((url, idx) => {
      const raw = url.split("/").pop()?.split("?")[0] || `Document_${idx + 1}.pdf`;
      return {
        type: "pdf" as const,
        url,
        id: `doc-${idx}`,
        name: decodeURIComponent(raw),
      };
    }),
  ];

  const handleOpenPdf = (url: string, name: string) => {
    setActivePdfUrl(url);
    setActivePdfTitle(`${title} — ${name}`);
    setModalOpen(true);
  };

  if (mediaItems.length === 0) {
    return (
      <div className="bg-slate-100 rounded-2xl aspect-[16/10] flex flex-col items-center justify-center text-slate-400 border border-slate-200">
        <Tag className="w-12 h-12 mb-2 text-slate-300" />
        <span className="text-sm font-medium">No machine photos or documents uploaded</span>
      </div>
    );
  }

  // Ensure activeIdx is in bounds
  const safeIdx = activeIdx < mediaItems.length ? activeIdx : 0;
  const activeItem = mediaItems[safeIdx];

  return (
    <div className="space-y-4">
      {/* Active Media Container */}
      <div className="bg-slate-900 rounded-2xl overflow-hidden aspect-[16/10] relative border border-slate-200 shadow-sm flex items-center justify-center">
        {activeItem.type === "photo" ? (
          <img
            src={getOptimizedImageUrl(activeItem.url, IMAGE_PRESETS.GALLERY_HERO)}
            alt={`${title} - view ${safeIdx + 1}`}
            fetchPriority="high"
            decoding="async"
            width={1200}
            height={750}
            className="w-full h-full object-contain"
          />
        ) : (
          /* High-Contrast Interactive PDF Document Slide */
          <div
            onClick={() => handleOpenPdf(activeItem.url, activeItem.name)}
            className="w-full h-full p-6 sm:p-10 flex flex-col items-center justify-center text-center cursor-pointer group bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 text-white relative select-none"
          >
            {/* Subtle Grid Watermark Pattern */}
            <div className="absolute inset-0 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px] opacity-10 pointer-events-none" />

            <div className="relative z-10 flex flex-col items-center max-w-md w-full">
              {/* Document Icon Graphic */}
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center mb-4 group-hover:scale-105 group-hover:bg-rose-500/30 transition-all shadow-lg">
                <FileText className="w-8 h-8 sm:w-10 sm:h-10" />
              </div>

              {/* Type Badge */}
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-rose-400 bg-rose-950/80 px-2.5 py-0.5 rounded-full border border-rose-800/60 mb-2">
                PDF Document / Datasheet
              </span>

              {/* Document Title */}
              <h3 className="text-sm sm:text-base font-bold text-white mb-1 line-clamp-2 px-2 group-hover:text-sky-300 transition-colors">
                {activeItem.name}
              </h3>
              <p className="text-xs text-slate-400 mb-5">Click to view document inside page</p>

              {/* Interactive Buttons */}
              <div className="flex flex-wrap items-center justify-center gap-2.5 w-full">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenPdf(activeItem.url, activeItem.name);
                  }}
                  className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-brand-blue hover:bg-brand-blue-700 text-white text-xs font-bold shadow-md transition-all active:scale-95"
                >
                  <Eye className="w-4 h-4" />
                  <span>Preview PDF</span>
                </button>

                <a
                  href={activeItem.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-all active:scale-95"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>New Window</span>
                </a>

                <a
                  href={activeItem.url}
                  download={activeItem.name}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-all active:scale-95"
                  title="Download PDF"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span className="sr-only sm:not-sr-only">Download</span>
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Media Type & Counter Pill */}
        <div className="absolute top-3 right-3 z-10 bg-black/60 backdrop-blur-xs text-white text-[11px] font-bold px-2.5 py-1 rounded-lg border border-white/10 flex items-center space-x-1.5 pointer-events-none">
          {activeItem.type === "photo" ? (
            <span>
              Photo {safeIdx + 1} of {mediaItems.length}
            </span>
          ) : (
            <span className="flex items-center text-rose-300">
              <FileText className="w-3 h-3 mr-1 text-rose-400" />
              PDF {safeIdx + 1} of {mediaItems.length}
            </span>
          )}
        </div>
      </div>

      {/* Thumbnails (Unified Photos & Documents) */}
      {mediaItems.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
          {mediaItems.map((item, idx) => {
            const isSelected = safeIdx === idx;
            if (item.type === "photo") {
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveIdx(idx)}
                  className={`relative rounded-xl overflow-hidden w-20 h-20 flex-shrink-0 border-2 transition-all ${
                    isSelected
                      ? "border-brand-blue ring-2 ring-brand-blue/30"
                      : "border-slate-200 opacity-70 hover:opacity-100"
                  }`}
                  title={`${title} - photo ${idx + 1}`}
                >
                  <img
                    src={getOptimizedImageUrl(item.url, IMAGE_PRESETS.THUMBNAIL)}
                    alt={`${title} - thumbnail ${idx + 1}`}
                    loading="lazy"
                    decoding="async"
                    width={160}
                    height={160}
                    className="w-full h-full object-cover"
                  />
                </button>
              );
            }

            // PDF Document Thumbnail
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveIdx(idx)}
                className={`relative rounded-xl overflow-hidden w-20 h-20 flex-shrink-0 border-2 transition-all p-2 flex flex-col items-center justify-between bg-slate-50 ${
                  isSelected
                    ? "border-rose-500 ring-2 ring-rose-500/30 bg-rose-50/50"
                    : "border-slate-200 opacity-75 hover:opacity-100 hover:border-slate-300"
                }`}
                title={item.name}
              >
                <div className="w-7 h-7 rounded bg-rose-100 text-rose-600 flex items-center justify-center mt-1">
                  <FileText className="w-4 h-4" />
                </div>
                <div className="w-full text-center">
                  <span className="text-[9px] font-black uppercase text-rose-700 bg-rose-100/70 px-1 py-0.5 rounded leading-none block mx-auto w-fit mb-0.5">
                    PDF
                  </span>
                  <p className="text-[9px] text-slate-700 truncate w-full font-medium leading-tight">
                    {item.name}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Global In-Page PDF Modal */}
      <PdfViewerModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        pdfUrl={activePdfUrl}
        title={activePdfTitle}
      />
    </div>
  );
}
