"use client";

import React, { useState } from "react";
import { Tag } from "lucide-react";
import { getOptimizedImageUrl, IMAGE_PRESETS } from "@/lib/images";

export default function PhotoGallery({
  photos,
  title,
}: {
  photos: string[];
  title: string;
}) {
  const [activeIdx, setActiveIdx] = useState(0);

  if (!photos || photos.length === 0) {
    return (
      <div className="bg-slate-100 rounded-2xl aspect-[16/10] flex flex-col items-center justify-center text-slate-400 border border-slate-200">
        <Tag className="w-12 h-12 mb-2" />
        <span className="text-sm font-medium">No machine photos uploaded</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Active Photo */}
      <div className="bg-slate-900 rounded-2xl overflow-hidden aspect-[16/10] relative border border-slate-200 shadow-sm flex items-center justify-center">
        <img
          src={getOptimizedImageUrl(photos[activeIdx], IMAGE_PRESETS.GALLERY_HERO)}
          alt={`${title} - view ${activeIdx + 1}`}
          fetchPriority="high"
          decoding="async"
          width={1200}
          height={750}
          className="w-full h-full object-contain"
        />
      </div>

      {/* Thumbnails */}
      {photos.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-2">
          {photos.map((url, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setActiveIdx(idx)}
              className={`relative rounded-xl overflow-hidden w-20 h-20 flex-shrink-0 border-2 transition-all ${
                activeIdx === idx
                  ? "border-brand-blue ring-2 ring-brand-blue/30"
                  : "border-slate-200 opacity-70 hover:opacity-100"
              }`}
            >
              <img
                src={getOptimizedImageUrl(url, IMAGE_PRESETS.THUMBNAIL)}
                alt="thumbnail"
                loading="lazy"
                decoding="async"
                width={160}
                height={160}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
