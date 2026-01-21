/**
 * Simple in-memory rate limiter
 * For production, use @upstash/ratelimit with Redis
 */

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetAt: number;
  };
}

const store: RateLimitStore = {};

// Cleanup old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  Object.keys(store).forEach(key => {
    if (store[key].resetAt < now) {
      delete store[key];
    }
  });
}, 5 * 60 * 1000);

export interface RateLimitConfig {
  /**
   * Maximum number of requests allowed in the window
   */
  limit: number;
  /**
   * Time window in seconds
   */
  window: number;
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

/**
 * Rate limiter using in-memory store
 *
 * @example
 * const limiter = ratelimit({ limit: 10, window: 60 });
 * const result = limiter.limit(ip);
 *
 * if (!result.success) {
 *   return NextResponse.json(
 *     { error: 'Too many requests' },
 *     { status: 429, headers: { 'Retry-After': String(result.reset) } }
 *   );
 * }
 */
export function ratelimit(config: RateLimitConfig) {
  return {
    limit: (identifier: string): RateLimitResult => {
      const now = Date.now();
      const windowMs = config.window * 1000;
      const key = `${identifier}:${config.limit}:${config.window}`;

      // Get or create entry
      let entry = store[key];

      if (!entry || entry.resetAt < now) {
        // Create new window
        entry = {
          count: 1,
          resetAt: now + windowMs,
        };
        store[key] = entry;

        return {
          success: true,
          limit: config.limit,
          remaining: config.limit - 1,
          reset: Math.ceil((entry.resetAt - now) / 1000),
        };
      }

      // Increment count
      entry.count += 1;

      const remaining = Math.max(0, config.limit - entry.count);
      const success = entry.count <= config.limit;

      return {
        success,
        limit: config.limit,
        remaining,
        reset: Math.ceil((entry.resetAt - now) / 1000),
      };
    },
  };
}

/**
 * Preset rate limiters for common use cases
 */
export const rateLimiters = {
  /**
   * Strict rate limit for authentication endpoints
   * 5 requests per minute
   */
  auth: ratelimit({ limit: 5, window: 60 }),

  /**
   * Standard rate limit for API endpoints
   * 20 requests per minute
   */
  api: ratelimit({ limit: 20, window: 60 }),

  /**
   * Generous rate limit for sync operations
   * 10 requests per 5 minutes
   */
  sync: ratelimit({ limit: 10, window: 300 }),

  /**
   * Very strict rate limit for sensitive operations
   * 3 requests per hour
   */
  sensitive: ratelimit({ limit: 3, window: 3600 }),
};
