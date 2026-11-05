/**
 * Shared Indian formatters for prices, dates, and relative timestamps.
 * Standardizes display across listings, cards, details, and requests.
 */

export function formatSinglePrice(val: number): string {
  if (val >= 10000000) {
    const cr = val / 10000000;
    return (cr % 1 === 0 ? cr.toFixed(0) : cr.toFixed(1)) + " Cr";
  }
  if (val >= 100000) {
    const lk = val / 100000;
    return (lk % 1 === 0 ? lk.toFixed(0) : lk.toFixed(1)) + " L";
  }
  return val.toLocaleString("en-IN");
}

export function formatPrice(
  min?: number | null,
  max?: number | null
): string {
  const hasMin = min !== undefined && min !== null && min > 0;
  const hasMax = max !== undefined && max !== null && max > 0;

  if (!hasMin && !hasMax) {
    return "Price on request";
  }

  if (hasMin && (!hasMax || min === max)) {
    return `₹${formatSinglePrice(min!)}`;
  }

  if (!hasMin && hasMax) {
    return `Up to ₹${formatSinglePrice(max!)}`;
  }

  if (hasMin && hasMax) {
    const minVal = min!;
    const maxVal = max!;

    if (minVal >= 100000 && maxVal >= 100000 && minVal < 10000000 && maxVal < 10000000) {
      const minLk = minVal / 100000;
      const maxLk = maxVal / 100000;
      const minStr = minLk % 1 === 0 ? minLk.toFixed(0) : minLk.toFixed(1);
      const maxStr = maxLk % 1 === 0 ? maxLk.toFixed(0) : maxLk.toFixed(1);
      return `₹${minStr}–${maxStr} L`;
    }

    if (minVal >= 10000000 && maxVal >= 10000000) {
      const minCr = minVal / 10000000;
      const maxCr = maxVal / 10000000;
      const minStr = minCr % 1 === 0 ? minCr.toFixed(0) : minCr.toFixed(1);
      const maxStr = maxCr % 1 === 0 ? maxCr.toFixed(0) : maxCr.toFixed(1);
      return `₹${minStr}–${maxStr} Cr`;
    }

    return `₹${formatSinglePrice(minVal)} - ₹${formatSinglePrice(maxVal)}`;
  }

  return "Price on request";
}

export function formatDate(date: string | Date | number): string {
  try {
    const d = typeof date === "string" || typeof date === "number" ? new Date(date) : date;
    if (isNaN(d.getTime())) return "";
    return d.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "";
  }
}

export function formatRelativeTime(date: string | Date | number): string {
  try {
    const d = typeof date === "string" || typeof date === "number" ? new Date(date) : date;
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffDays = Math.floor(diffSec / 86400);

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "1 day ago";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return `${weeks} ${weeks === 1 ? "week" : "weeks"} ago`;
    }
    const months = Math.floor(diffDays / 30);
    return `${months} ${months === 1 ? "month" : "months"} ago`;
  } catch {
    return "";
  }
}
