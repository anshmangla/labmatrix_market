"use client";

import React, { useEffect, useState } from "react";
import { X, ExternalLink, Download, FileText, AlertCircle, RefreshCw } from "lucide-react";

interface PdfViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  pdfUrl: string | null;
  title?: string;
}

export default function PdfViewerModal({
  isOpen,
  onClose,
  pdfUrl,
  title,
}: PdfViewerModalProps) {
  const [useGoogleDocsFallback, setUseGoogleDocsFallback] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Close on Escape key press & prevent background scroll
  useEffect(() => {
    if (!isOpen) {
      setUseGoogleDocsFallback(false);
      setIsLoading(true);
      return;
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !pdfUrl) return null;

  const rawFileName = pdfUrl.split("/").pop()?.split("?")[0] || "Document.pdf";
  const displayFileName = decodeURIComponent(rawFileName);
  const displayTitle = title || displayFileName;

  const googleDocsUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(
    pdfUrl
  )}&embedded=true`;

  const activeSrc = useGoogleDocsFallback ? googleDocsUrl : pdfUrl;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="PDF Document Viewer"
    >
      <div
        className="bg-white w-full max-w-5xl h-[92vh] max-h-[900px] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-slate-200 bg-slate-50 flex-shrink-0">
          <div className="flex items-center space-x-3 min-w-0 pr-4">
            <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center flex-shrink-0 shadow-xs">
              <FileText className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-slate-900 truncate" title={displayTitle}>
                {displayTitle}
              </h3>
              <p className="text-[11px] text-slate-500 truncate">{displayFileName}</p>
            </div>
          </div>

          {/* Actions Bar */}
          <div className="flex items-center space-x-1.5 sm:space-x-2 flex-shrink-0">
            {/* Fallback Switcher if rendering issues arise */}
            <button
              type="button"
              onClick={() => {
                setIsLoading(true);
                setUseGoogleDocsFallback((prev) => !prev);
              }}
              title={
                useGoogleDocsFallback
                  ? "Switch to native PDF renderer"
                  : "Switch to Google Docs viewer"
              }
              className="hidden sm:inline-flex items-center space-x-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
              <span>{useGoogleDocsFallback ? "Native Mode" : "Alternative View"}</span>
            </button>

            {/* Open in New Window */}
            <a
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:text-brand-blue hover:bg-slate-100 transition-colors shadow-xs"
              title="Open document in a new browser tab"
            >
              <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">Open in new window</span>
            </a>

            {/* Direct Download */}
            <a
              href={pdfUrl}
              download={displayFileName}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-1.5 text-xs font-bold px-3 py-1.5 rounded-lg bg-brand-blue text-white hover:bg-brand-blue-700 transition-colors shadow-xs"
              title="Download PDF to your computer"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Download</span>
            </a>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/80 rounded-lg transition-colors ml-1"
              aria-label="Close PDF Viewer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Viewer Body */}
        <div className="flex-1 relative bg-slate-900 overflow-hidden flex flex-col">
          {isLoading && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-900 text-slate-300">
              <div className="w-8 h-8 border-2 border-brand-blue border-t-transparent rounded-full animate-spin mb-3" />
              <span className="text-xs font-medium">Loading document viewer...</span>
            </div>
          )}

          <iframe
            key={activeSrc}
            src={activeSrc}
            title={displayTitle}
            className="w-full h-full border-0 bg-white"
            onLoad={() => setIsLoading(false)}
          />

          {/* Quick Notice footer */}
          <div className="py-1.5 px-4 bg-slate-950 text-slate-400 text-[11px] flex items-center justify-between border-t border-slate-800">
            <span className="truncate">
              Trouble viewing? Click <strong>Alternative View</strong> or{" "}
              <strong>Open in new window</strong>.
            </span>
            <span className="hidden sm:inline font-mono text-[10px] text-slate-500">
              Labmatrix Secure Documents
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
