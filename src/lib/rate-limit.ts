/**
 * In-memory sliding-window rate limiter for sensitive API routes.
 * Protects against credential stuffing, automated scraping, upload flooding, and spam.
 */

interface RateLimitRecord {
  timestamps: number[];
}

const rateLimitMap = new Map<string, RateLimitRecord>();

let lastCleanup = Date.now();

/**
 * Periodically purges stale IP/user records to prevent unbounded memory growth.
 */
function cleanupExpired(windowMs: number) {
  const now = Date.now();
  if (now - lastCleanup < 60000) return; // Run at most once per minute
  lastCleanup = now;

  for (const [key, record] of rateLimitMap.entries()) {
    record.timestamps = record.timestamps.filter((ts) => now - ts < windowMs);
    if (record.timestamps.length === 0) {
      rateLimitMap.delete(key);
    }
  }
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  resetSeconds: number;
}

/**
 * Evaluates whether a request from a given key exceeds the maximum allowed count in a sliding time window.
 *
 * @param key Unique identifier (e.g., `register:192.168.1.1` or `inquiry:usr_123`)
 * @param limit Maximum allowed requests within the window
 * @param windowMs Time window in milliseconds (e.g., 60_000 for 1 minute)
 */
export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number
): RateLimitResult {
  const now = Date.now();
  cleanupExpired(windowMs);

  let record = rateLimitMap.get(key);
  if (!record) {
    record = { timestamps: [] };
    rateLimitMap.set(key, record);
  }

  // Keep only timestamps that fall inside the current sliding window
  record.timestamps = record.timestamps.filter((ts) => now - ts < windowMs);

  if (record.timestamps.length >= limit) {
    const oldestTimestamp = record.timestamps[0];
    const resetSeconds = Math.ceil((oldestTimestamp + windowMs - now) / 1000);
    return {
      success: false,
      limit,
      remaining: 0,
      resetSeconds: Math.max(1, resetSeconds),
    };
  }

  record.timestamps.push(now);
  return {
    success: true,
    limit,
    remaining: limit - record.timestamps.length,
    resetSeconds: Math.ceil(windowMs / 1000),
  };
}

/**
 * Extracts client IP address from proxy forwarding headers.
 */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const firstIp = forwarded.split(",")[0].trim();
    if (firstIp) return firstIp;
  }
  const realIp = request.headers.get("x-real-ip");
  if (realIp) {
    return realIp.trim();
  }
  return "127.0.0.1";
}
