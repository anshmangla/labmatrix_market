import { unstable_cache, revalidateTag } from "next/cache";

/**
 * Caching for the database reads behind public web pages (catalogs, listing and request
 * detail pages, sitemap). Pages still render per request (they read filters from the URL and
 * the visitor's session), but a cached read means most page views need no database round trip
 * and never wake a suspended Neon database.
 *
 * Every route that changes listings or requests calls invalidatePublicListings() /
 * invalidatePublicRequirements(), so changes show on the next page view. The time limit is
 * only a safety net in case a change happens somewhere that doesn't invalidate.
 */

export const PUBLIC_LISTINGS_TAG = "public-listings";
export const PUBLIC_REQUIREMENTS_TAG = "public-requirements";

const SAFETY_NET_SECONDS = 300;

// Cached values are stored as JSON, which turns Dates into strings. These are the date fields
// the cached queries select; they are turned back into Dates so callers see what Prisma returns.
const DATE_KEYS = new Set(["createdAt", "updatedAt"]);

function reviveDates<T>(value: T): T {
  // On a cache miss the original result (with real Dates) comes back unchanged
  if (value instanceof Date) return value;
  if (Array.isArray(value)) return value.map(reviveDates) as T;
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [key, v] of Object.entries(value)) {
      out[key] = DATE_KEYS.has(key) && typeof v === "string" ? new Date(v) : reviveDates(v);
    }
    return out as T;
  }
  return value;
}

/**
 * Runs `read` through the shared cache. `keyParts` must include every value the query depends
 * on (ids, filters), since they identify the cached entry.
 */
export async function cachedPublicRead<T>(
  tag: typeof PUBLIC_LISTINGS_TAG | typeof PUBLIC_REQUIREMENTS_TAG,
  keyParts: string[],
  read: () => Promise<T>
): Promise<T> {
  const cached = unstable_cache(read, ["public-read", tag, ...keyParts], {
    tags: [tag],
    revalidate: SAFETY_NET_SECONDS,
  });
  return reviveDates(await cached());
}

/** Call after any change to listings, so public pages show it on the next view. */
export function invalidatePublicListings() {
  try {
    // expire: 0 = the next view reads fresh data instead of being served the old copy once
    revalidateTag(PUBLIC_LISTINGS_TAG, { expire: 0 });
  } catch (error) {
    console.warn("Could not invalidate cached listings:", error);
  }
}

/** Call after any change to requests (requirements), so public pages show it on the next view. */
export function invalidatePublicRequirements() {
  try {
    revalidateTag(PUBLIC_REQUIREMENTS_TAG, { expire: 0 });
  } catch (error) {
    console.warn("Could not invalidate cached requests:", error);
  }
}
