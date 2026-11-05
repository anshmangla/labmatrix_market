"use client";

import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "labmatrix_saved_listings";
const EVENT_NAME = "labmatrix_saved_changed";

/**
 * Hook for managing saved/shortlisted equipment listings in localStorage.
 * Synchronizes state across all components and tabs without hitting the backend.
 */
export function useSavedListings() {
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const load = () => {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            setSavedIds(parsed);
          }
        }
      } catch {
        // ignore storage access errors
      } finally {
        setIsLoaded(true);
      }
    };

    load();

    const handler = () => load();
    window.addEventListener(EVENT_NAME, handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener(EVENT_NAME, handler);
      window.removeEventListener("storage", handler);
    };
  }, []);

  const toggleSave = useCallback((id: string) => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const current: string[] = raw ? JSON.parse(raw) : [];
      let updated: string[];
      if (current.includes(id)) {
        updated = current.filter((item) => item !== id);
      } else {
        updated = [...current, id];
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      setSavedIds(updated);
      window.dispatchEvent(new Event(EVENT_NAME));
    } catch {
      // ignore
    }
  }, []);

  const isSaved = useCallback(
    (id: string) => savedIds.includes(id),
    [savedIds]
  );

  return { savedIds, isSaved, toggleSave, isLoaded };
}
