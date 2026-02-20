/**
 * Simple in-memory rate limiting for API endpoints
 * Uses a sliding window approach with IP-based tracking
 * 
 * For production, consider using Redis (e.g., Upstash) for distributed rate limiting
 */

interface RateLimitEntry {
  count: number;
  firstRequest: number;
  resetAt: number;
}

interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetAt: number;
  retryAfter?: number;
}

// In-memory store for rate limits
// In production, use Redis for distributed systems
const rateLimitStore = new Map<string, RateLimitEntry>();

// Default rate limit configuration
const DEFAULT_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const DEFAULT_MAX_REQUESTS = 5;

// Cleanup interval (remove expired entries every 5 minutes)
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000;

// Start cleanup interval
setInterval(() => {
  cleanupExpiredEntries();
}, CLEANUP_INTERVAL_MS);

/**
 * Clean up expired entries from the rate limit store
 */
function cleanupExpiredEntries(): void {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetAt < now) {
      rateLimitStore.delete(key);
    }
  }
}

/**
 * Get client IP from request
 * @param request - Next.js request object
 * @returns IP address string
 */
export function getClientIP(request: Request): string {
  // Try to get IP from various headers
  const headers = request.headers;
  
  // X-Forwarded-For is the most common header for proxied requests
  const forwardedFor = headers.get("x-forwarded-for");
  if (forwardedFor) {
    // Take the first IP in the chain (client IP)
    return forwardedFor.split(",")[0].trim();
  }
  
  // Fallback headers
  const realIP = headers.get("x-real-ip");
  if (realIP) return realIP;
  
  const cfConnectingIP = headers.get("cf-connecting-ip");
  if (cfConnectingIP) return cfConnectingIP;
  
  // Last resort: return a placeholder (not useful for rate limiting but prevents errors)
  return "unknown";
}

/**
 * Check rate limit for a given key (typically IP address)
 * @param key - Unique identifier (e.g., IP address)
 * @param maxRequests - Maximum requests allowed in window (default: 5)
 * @param windowMs - Time window in milliseconds (default: 1 hour)
 * @returns RateLimitResult with allowed status and metadata
 */
export function checkRateLimit(
  key: string,
  maxRequests: number = DEFAULT_MAX_REQUESTS,
  windowMs: number = DEFAULT_WINDOW_MS
): RateLimitResult {
  const now = Date.now();
  const entry = rateLimitStore.get(key);

  // If no entry exists or window has expired, create new entry
  if (!entry || entry.resetAt < now) {
    const newEntry: RateLimitEntry = {
      count: 1,
      firstRequest: now,
      resetAt: now + windowMs,
    };
    rateLimitStore.set(key, newEntry);

    return {
      allowed: true,
      limit: maxRequests,
      remaining: maxRequests - 1,
      resetAt: newEntry.resetAt,
    };
  }

  // Window is active, check if limit exceeded
  if (entry.count >= maxRequests) {
    const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
    return {
      allowed: false,
      limit: maxRequests,
      remaining: 0,
      resetAt: entry.resetAt,
      retryAfter,
    };
  }

  // Increment count and allow request
  entry.count += 1;

  return {
    allowed: true,
    limit: maxRequests,
    remaining: maxRequests - entry.count,
    resetAt: entry.resetAt,
  };
}

/**
 * Reset rate limit for a given key (useful for testing)
 * @param key - Unique identifier to reset
 */
export function resetRateLimit(key: string): void {
  rateLimitStore.delete(key);
}

/**
 * Get rate limit headers for response
 * @param result - RateLimitResult
 * @returns Object with rate limit headers
 */
export function getRateLimitHeaders(result: RateLimitResult): Record<string, string> {
  return {
    "X-RateLimit-Limit": String(result.limit),
    "X-RateLimit-Remaining": String(result.remaining),
    "X-RateLimit-Reset": String(Math.ceil(result.resetAt / 1000)),
  };
}
