"use client";

import React, { useEffect, useState, useTransition } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export default function NavigationProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);

  // When pathname or searchParams change, navigation has completed
  useEffect(() => {
    if (loading) {
      setProgress(100);
      const timer = setTimeout(() => {
        setVisible(false);
        setLoading(false);
        setProgress(0);
      }, 250);
      return () => clearTimeout(timer);
    }
  }, [pathname, searchParams]);

  // Intercept click on internal links
  useEffect(() => {
    let progressTimer: NodeJS.Timeout | null = null;
    let safetyTimer: NodeJS.Timeout | null = null;

    const handleAnchorClick = (e: MouseEvent) => {
      // Find closest anchor tag
      const target = (e.target as HTMLElement)?.closest("a");
      if (!target) return;

      const href = target.getAttribute("href");
      if (!href) return;

      // Ignore hash links, tel:, mailto:, external links, target="_blank", or modifier clicks
      if (
        href.startsWith("#") ||
        href.startsWith("tel:") ||
        href.startsWith("mailto:") ||
        target.target === "_blank" ||
        e.ctrlKey ||
        e.metaKey ||
        e.shiftKey ||
        e.altKey
      ) {
        return;
      }

      // Check if external URL
      try {
        const url = new URL(href, window.location.origin);
        if (url.origin !== window.location.origin) return;

        // If navigating to the exact same pathname + search, skip
        if (
          url.pathname === window.location.pathname &&
          url.search === window.location.search
        ) {
          return;
        }

        // Start progress
        setVisible(true);
        setLoading(true);
        setProgress(25);

        if (progressTimer) clearInterval(progressTimer);
        progressTimer = setInterval(() => {
          setProgress((prev) => {
            if (prev >= 85) {
              if (progressTimer) clearInterval(progressTimer);
              return 85;
            }
            return prev + Math.floor(Math.random() * 15 + 5);
          });
        }, 200);

        // Safety fallback: Reset after 8s if something went wrong
        if (safetyTimer) clearTimeout(safetyTimer);
        safetyTimer = setTimeout(() => {
          setVisible(false);
          setLoading(false);
          setProgress(0);
          if (progressTimer) clearInterval(progressTimer);
        }, 8000);
      } catch (err) {
        // Invalid URL, ignore
      }
    };

    document.addEventListener("click", handleAnchorClick, true);

    return () => {
      document.removeEventListener("click", handleAnchorClick, true);
      if (progressTimer) clearInterval(progressTimer);
      if (safetyTimer) clearTimeout(safetyTimer);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      aria-hidden="true"
      className="fixed top-0 left-0 right-0 z-[99999] pointer-events-none h-[3px] bg-transparent"
    >
      <div
        className="h-full bg-gradient-to-r from-brand-blue via-brand-gold to-brand-blue transition-all duration-200 ease-out shadow-[0_0_10px_rgba(26,79,159,0.5)]"
        style={{
          width: `${progress}%`,
          opacity: visible ? 1 : 0,
        }}
      />
    </div>
  );
}
