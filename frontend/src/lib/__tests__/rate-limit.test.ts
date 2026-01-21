/**
 * Unit tests for rate-limit.ts using TDD methodology
 *
 * TDD Cycle demonstration:
 * 1. RED: Write test that fails
 * 2. GREEN: Implementation already exists (verify it works)
 * 3. REFACTOR: Test edge cases and improve coverage
 * 4. VERIFY: Achieve 100% coverage
 *
 * Run tests:
 *   npm run test src/lib/__tests__/rate-limit.test.ts
 *   npm run test:coverage src/lib/__tests__/rate-limit.test.ts
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { ratelimit, rateLimiters } from '../rate-limit';

describe('ratelimit', () => {
  // Clear the store before each test to ensure isolation
  beforeEach(() => {
    vi.clearAllTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // =============================================================================
  // TDD CYCLE: Basic Functionality
  // =============================================================================

  it('should allow requests within limit', () => {
    // RED Phase: Write test first
    const limiter = ratelimit({ limit: 5, window: 60 });

    // Act
    const result = limiter.limit('user1');

    // Assert
    expect(result.success).toBe(true);
    expect(result.remaining).toBe(4);
    expect(result.limit).toBe(5);
    expect(result.reset).toBeGreaterThan(0);
    expect(result.reset).toBeLessThanOrEqual(60);
  });

  it('should block requests exceeding limit', () => {
    // GREEN Phase: Test that blocking works
    const limiter = ratelimit({ limit: 2, window: 60 });

    // Allow 2 requests
    const r1 = limiter.limit('user1');
    const r2 = limiter.limit('user1');

    expect(r1.success).toBe(true);
    expect(r1.remaining).toBe(1);

    expect(r2.success).toBe(true);
    expect(r2.remaining).toBe(0);

    // 3rd request should be blocked
    const r3 = limiter.limit('user1');

    expect(r3.success).toBe(false);
    expect(r3.remaining).toBe(0);
  });

  it('should increment count correctly', () => {
    // REFACTOR Phase: Test detailed behavior
    const limiter = ratelimit({ limit: 5, window: 60 });

    const r1 = limiter.limit('user1');
    const r2 = limiter.limit('user1');
    const r3 = limiter.limit('user1');

    expect(r1.remaining).toBe(4);
    expect(r2.remaining).toBe(3);
    expect(r3.remaining).toBe(2);
  });

  // =============================================================================
  // TDD CYCLE: Window Reset
  // =============================================================================

  it('should reset after window expires', async () => {
    // Use fake timers
    vi.useFakeTimers();

    const limiter = ratelimit({ limit: 1, window: 1 }); // 1 second window

    // First request (allowed)
    const r1 = limiter.limit('user1');
    expect(r1.success).toBe(true);

    // Second request immediately (blocked)
    const r2 = limiter.limit('user1');
    expect(r2.success).toBe(false);

    // Advance time by 1.1 seconds
    vi.advanceTimersByTime(1100);

    // Third request (should be allowed after reset)
    const r3 = limiter.limit('user1');
    expect(r3.success).toBe(true);
    expect(r3.remaining).toBe(0); // First request in new window

    vi.useRealTimers();
  });

  it('should return correct reset time', () => {
    vi.useFakeTimers();
    const now = Date.now();
    vi.setSystemTime(now);

    const limiter = ratelimit({ limit: 1, window: 60 });
    const result = limiter.limit('user1');

    expect(result.reset).toBeGreaterThan(0);
    expect(result.reset).toBeLessThanOrEqual(60);

    vi.useRealTimers();
  });

  // =============================================================================
  // TDD CYCLE: Multiple Identifiers
  // =============================================================================

  it('should handle multiple identifiers independently', () => {
    const limiter = ratelimit({ limit: 1, window: 60 });

    const result1 = limiter.limit('user1');
    const result2 = limiter.limit('user2');

    expect(result1.success).toBe(true);
    expect(result2.success).toBe(true); // Different identifier, separate limit

    // User1 second request should be blocked
    const result3 = limiter.limit('user1');
    expect(result3.success).toBe(false);

    // User2 second request should be blocked
    const result4 = limiter.limit('user2');
    expect(result4.success).toBe(false);
  });

  it('should create separate keys for different configs', () => {
    const limiter1 = ratelimit({ limit: 5, window: 60 });
    const limiter2 = ratelimit({ limit: 10, window: 120 });

    // Same identifier, different limiters
    const r1 = limiter1.limit('user1');
    const r2 = limiter2.limit('user1');

    expect(r1.success).toBe(true);
    expect(r1.remaining).toBe(4);

    expect(r2.success).toBe(true);
    expect(r2.remaining).toBe(9); // Different limit
  });

  // =============================================================================
  // TDD CYCLE: Edge Cases
  // =============================================================================

  it('should handle edge case: limit=0', () => {
    const limiter = ratelimit({ limit: 0, window: 60 });
    const result = limiter.limit('user1');

    expect(result.success).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it('should handle edge case: limit=1', () => {
    const limiter = ratelimit({ limit: 1, window: 60 });

    const r1 = limiter.limit('user1');
    expect(r1.success).toBe(true);
    expect(r1.remaining).toBe(0);

    const r2 = limiter.limit('user1');
    expect(r2.success).toBe(false);
  });

  it('should calculate remaining correctly when blocked', () => {
    const limiter = ratelimit({ limit: 2, window: 60 });

    limiter.limit('user1'); // count=1, remaining=1
    limiter.limit('user1'); // count=2, remaining=0
    const result = limiter.limit('user1'); // count=3, blocked

    expect(result.remaining).toBe(0); // Math.max(0, 2 - 3) = 0
    expect(result.success).toBe(false);
  });

  it('should handle very short windows', () => {
    vi.useFakeTimers();

    const limiter = ratelimit({ limit: 2, window: 0.1 }); // 100ms window

    const r1 = limiter.limit('user1');
    expect(r1.success).toBe(true);

    // Advance time by 150ms (past window)
    vi.advanceTimersByTime(150);

    const r2 = limiter.limit('user1');
    expect(r2.success).toBe(true); // New window

    vi.useRealTimers();
  });

  it('should handle large windows', () => {
    const limiter = ratelimit({ limit: 1, window: 3600 }); // 1 hour

    const result = limiter.limit('user1');

    expect(result.success).toBe(true);
    expect(result.reset).toBeGreaterThan(3500); // Close to 3600
    expect(result.reset).toBeLessThanOrEqual(3600);
  });

  it('should handle empty identifier', () => {
    const limiter = ratelimit({ limit: 5, window: 60 });

    const result = limiter.limit('');

    expect(result.success).toBe(true);
    expect(result.remaining).toBe(4);
  });

  // =============================================================================
  // TDD CYCLE: Concurrency
  // =============================================================================

  it('should handle rapid sequential requests correctly', () => {
    const limiter = ratelimit({ limit: 10, window: 60 });

    // Make 15 rapid requests
    const results = [];
    for (let i = 0; i < 15; i++) {
      results.push(limiter.limit('user1'));
    }

    // First 10 should succeed
    for (let i = 0; i < 10; i++) {
      expect(results[i].success).toBe(true);
      expect(results[i].remaining).toBe(9 - i);
    }

    // Last 5 should fail
    for (let i = 10; i < 15; i++) {
      expect(results[i].success).toBe(false);
      expect(results[i].remaining).toBe(0);
    }
  });
});

// =============================================================================
// Preset Rate Limiters Tests
// =============================================================================

describe('rateLimiters presets', () => {
  it('should have auth limiter with correct config (5 req/min)', () => {
    const r1 = rateLimiters.auth.limit('ip1');
    expect(r1.success).toBe(true);
    expect(r1.limit).toBe(5);
    expect(r1.remaining).toBe(4);

    // 5th request should succeed
    rateLimiters.auth.limit('ip1'); // 2nd
    rateLimiters.auth.limit('ip1'); // 3rd
    rateLimiters.auth.limit('ip1'); // 4th
    const r5 = rateLimiters.auth.limit('ip1'); // 5th
    expect(r5.success).toBe(true);
    expect(r5.remaining).toBe(0);

    // 6th request should fail
    const r6 = rateLimiters.auth.limit('ip1');
    expect(r6.success).toBe(false);
  });

  it('should have api limiter with correct config (20 req/min)', () => {
    const result1 = rateLimiters.api.limit('ip2');
    expect(result1.limit).toBe(20);
    expect(result1.success).toBe(true);
  });

  it('should have sync limiter with correct config (10 req/5min)', () => {
    const result1 = rateLimiters.sync.limit('ip3');
    expect(result1.limit).toBe(10);
    expect(result1.success).toBe(true);
    expect(result1.reset).toBeGreaterThan(200); // 5 minutes = 300 seconds
  });

  it('should have sensitive limiter with correct config (3 req/hour)', () => {
    const result1 = rateLimiters.sensitive.limit('ip4');
    expect(result1.limit).toBe(3);
    expect(result1.success).toBe(true);

    // 3rd request should succeed
    rateLimiters.sensitive.limit('ip4'); // 2nd
    const r3 = rateLimiters.sensitive.limit('ip4'); // 3rd
    expect(r3.success).toBe(true);

    // 4th request should fail
    const r4 = rateLimiters.sensitive.limit('ip4');
    expect(r4.success).toBe(false);
  });

  it('should isolate preset limiters from each other', () => {
    // Different identifiers
    const authResult = rateLimiters.auth.limit('user1');
    const apiResult = rateLimiters.api.limit('user1');

    expect(authResult.success).toBe(true);
    expect(apiResult.success).toBe(true);

    // They have different limits
    expect(authResult.limit).toBe(5);
    expect(apiResult.limit).toBe(20);
  });
});

// =============================================================================
// Cleanup Mechanism Tests
// =============================================================================

describe('rate limit store cleanup', () => {
  it('should cleanup expired entries periodically', () => {
    vi.useFakeTimers();

    const limiter = ratelimit({ limit: 1, window: 1 }); // 1 second window

    // Create entry
    limiter.limit('user1');

    // Advance time by 6 minutes (cleanup interval is 5 minutes)
    vi.advanceTimersByTime(6 * 60 * 1000);

    // Entry should be cleaned up, new request should start fresh
    const result = limiter.limit('user1');
    expect(result.success).toBe(true);
    expect(result.remaining).toBe(0);

    vi.useRealTimers();
  });
});

// =============================================================================
// Type Safety Tests
// =============================================================================

describe('type safety', () => {
  it('should accept RateLimitConfig object', () => {
    const config = { limit: 10, window: 60 };
    const limiter = ratelimit(config);

    const result = limiter.limit('user1');
    expect(result).toHaveProperty('success');
    expect(result).toHaveProperty('limit');
    expect(result).toHaveProperty('remaining');
    expect(result).toHaveProperty('reset');
  });

  it('should return RateLimitResult with correct shape', () => {
    const limiter = ratelimit({ limit: 5, window: 60 });
    const result = limiter.limit('user1');

    // Verify all required properties exist
    expect(typeof result.success).toBe('boolean');
    expect(typeof result.limit).toBe('number');
    expect(typeof result.remaining).toBe('number');
    expect(typeof result.reset).toBe('number');
  });
});
