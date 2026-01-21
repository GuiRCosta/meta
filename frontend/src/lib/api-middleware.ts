/**
 * API middleware utilities for authentication and rate limiting
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { rateLimiters, RateLimitResult } from '@/lib/rate-limit';

export interface AuthenticatedUser {
  id: string;
  email: string;
  name?: string | null;
}

/**
 * Verifies authentication and returns user session
 */
export async function requireAuth(
  request: NextRequest
): Promise<{ user: AuthenticatedUser } | NextResponse> {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  return {
    user: {
      id: session.user.id,
      email: session.user.email!,
      name: session.user.name,
    },
  };
}

/**
 * Applies rate limiting and returns error response if exceeded
 */
export function applyRateLimit(
  identifier: string,
  limiter: 'auth' | 'api' | 'sync' | 'sensitive' = 'api'
): RateLimitResult | NextResponse {
  const rateLimit = rateLimiters[limiter].limit(identifier);

  if (!rateLimit.success) {
    return NextResponse.json(
      {
        error: 'Muitas requisições. Aguarde alguns segundos.',
        retry_after: rateLimit.reset,
      },
      {
        status: 429,
        headers: {
          'X-RateLimit-Limit': String(rateLimit.limit),
          'X-RateLimit-Remaining': String(rateLimit.remaining),
          'X-RateLimit-Reset': String(rateLimit.reset),
          'Retry-After': String(rateLimit.reset),
        },
      }
    );
  }

  return rateLimit;
}

/**
 * Combined authentication and rate limiting middleware
 *
 * @example
 * export async function POST(request: NextRequest) {
 *   const result = await withAuthAndRateLimit(request, 'api');
 *   if (result instanceof NextResponse) return result;
 *   const { user } = result;
 *   // ... your logic
 * }
 */
export async function withAuthAndRateLimit(
  request: NextRequest,
  limiter: 'auth' | 'api' | 'sync' | 'sensitive' = 'api'
): Promise<{ user: AuthenticatedUser } | NextResponse> {
  // Check authentication first
  const authResult = await requireAuth(request);
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  // Apply rate limiting
  const rateLimitResult = applyRateLimit(authResult.user.id, limiter);
  if (rateLimitResult instanceof NextResponse) {
    return rateLimitResult;
  }

  return authResult;
}
