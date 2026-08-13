import 'server-only';

import { serverEnv } from '@/lib/env';

/**
 * In-memory fixed-window rate limiter.
 *
 * Deliberately simple and dependency-free. It protects a single server instance against
 * accidental request storms and casual abuse — a login form being hammered, a script
 * retrying a PDF export in a loop.
 *
 * It is *per instance*: on a horizontally scaled deployment each instance keeps its own
 * counters, so the effective limit is `RATE_LIMIT_MAX × instances`. For a hard global
 * limit put Upstash/Redis behind `consume()` or use your platform's edge rate limiting —
 * the call sites do not change. This trade-off is documented in README.md → "Rate limiting".
 */

interface Window {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Window>();
let lastSweep = Date.now();

function sweep(now: number): void {
  // Amortised cleanup: at most once a minute, and only over expired entries.
  if (now - lastSweep < 60_000) return;
  lastSweep = now;
  for (const [key, window] of buckets) {
    if (window.resetAt <= now) buckets.delete(key);
  }
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  limit: number;
  resetAt: number;
  retryAfterSeconds: number;
}

export function consume(
  key: string,
  options: { max?: number; windowSeconds?: number } = {},
): RateLimitResult {
  const config = serverEnv().rateLimit;
  const max = options.max ?? config.max;
  const windowMs = (options.windowSeconds ?? config.windowSeconds) * 1000;

  const now = Date.now();
  sweep(now);

  const existing = buckets.get(key);
  if (!existing || existing.resetAt <= now) {
    const window: Window = { count: 1, resetAt: now + windowMs };
    buckets.set(key, window);
    return {
      allowed: true,
      remaining: max - 1,
      limit: max,
      resetAt: window.resetAt,
      retryAfterSeconds: 0,
    };
  }

  existing.count += 1;
  const allowed = existing.count <= max;

  return {
    allowed,
    remaining: Math.max(0, max - existing.count),
    limit: max,
    resetAt: existing.resetAt,
    retryAfterSeconds: allowed ? 0 : Math.ceil((existing.resetAt - now) / 1000),
  };
}

/** Derives a stable client key from proxy headers, falling back to a shared bucket. */
export function clientKey(headers: Headers, scope: string): string {
  const forwarded = headers.get('x-forwarded-for');
  const ip =
    forwarded?.split(',')[0]?.trim() ||
    headers.get('x-real-ip') ||
    headers.get('cf-connecting-ip') ||
    'unknown';
  return `${scope}:${ip}`;
}

/** Test seam. */
export function __resetRateLimiter(): void {
  buckets.clear();
  lastSweep = Date.now();
}
