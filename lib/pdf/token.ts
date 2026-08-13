import 'server-only';

import { createHmac, timingSafeEqual } from 'node:crypto';

import { serverEnv } from '@/lib/env';

/**
 * Short-lived, single-purpose tokens for the internal `/print/[id]` route.
 *
 * The print route renders a CV without the app chrome so a browser can print it directly.
 * It is reachable by URL, so it must not be guessable and must not be a general-purpose
 * read capability: a token is bound to one owner, one CV, and expires in minutes.
 */

const TTL_SECONDS = 10 * 60;

function sign(payload: string): string {
  return createHmac('sha256', serverEnv().pdf.renderSecret).update(payload).digest('base64url');
}

export function createRenderToken(uid: string, cvId: string, ttlSeconds = TTL_SECONDS): string {
  const expires = Math.floor(Date.now() / 1000) + ttlSeconds;
  const payload = `${uid}.${cvId}.${expires}`;
  return `${Buffer.from(payload).toString('base64url')}.${sign(payload)}`;
}

export interface RenderTokenClaims {
  uid: string;
  cvId: string;
  expiresAt: number;
}

export function verifyRenderToken(token: string | null | undefined): RenderTokenClaims | null {
  if (!token) return null;

  const separator = token.lastIndexOf('.');
  if (separator <= 0) return null;

  const encodedPayload = token.slice(0, separator);
  const signature = token.slice(separator + 1);

  let payload: string;
  try {
    payload = Buffer.from(encodedPayload, 'base64url').toString('utf8');
  } catch {
    return null;
  }

  const expected = sign(payload);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

  const [uid, cvId, expires] = payload.split('.');
  if (!uid || !cvId || !expires) return null;

  const expiresAt = Number.parseInt(expires, 10);
  if (!Number.isFinite(expiresAt) || expiresAt * 1000 < Date.now()) return null;

  return { uid, cvId, expiresAt: expiresAt * 1000 };
}
