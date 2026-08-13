import { afterEach, describe, expect, it, vi } from 'vitest';

import { createRenderToken, verifyRenderToken } from '@/lib/pdf/token';

/**
 * Render tokens.
 *
 * `/print/[id]` is reachable by URL, so the token is the only thing keeping one user's CV
 * out of another's browser. Every one of these cases is an attack that must fail.
 */

afterEach(() => {
  vi.useRealTimers();
});

describe('createRenderToken / verifyRenderToken', () => {
  it('round-trips the owner and document', () => {
    const token = createRenderToken('user-1', 'cv-1');
    expect(verifyRenderToken(token)).toMatchObject({ uid: 'user-1', cvId: 'cv-1' });
  });

  it('rejects a missing token', () => {
    expect(verifyRenderToken(null)).toBeNull();
    expect(verifyRenderToken(undefined)).toBeNull();
    expect(verifyRenderToken('')).toBeNull();
  });

  it('rejects a token with no signature', () => {
    expect(verifyRenderToken('dXNlci0xLmN2LTEuOTk5OTk5OTk5OQ')).toBeNull();
  });

  it('rejects a tampered payload', () => {
    const token = createRenderToken('user-1', 'cv-1');
    const [, signature] = token.split(/\.(?=[^.]+$)/);
    const forged = `${Buffer.from('user-2.cv-1.9999999999').toString('base64url')}.${signature}`;
    expect(verifyRenderToken(forged)).toBeNull();
  });

  it('rejects a tampered signature', () => {
    const token = createRenderToken('user-1', 'cv-1');
    const separator = token.lastIndexOf('.');
    expect(verifyRenderToken(`${token.slice(0, separator)}.AAAAAAAAAAAAAAAAAAAAAA`)).toBeNull();
  });

  it('rejects a token for a different CV even with a valid signature', () => {
    // The route compares `claims.cvId` with the requested id; the token itself is only
    // ever valid for the pair it was minted for.
    const token = createRenderToken('user-1', 'cv-1');
    const claims = verifyRenderToken(token);
    expect(claims?.cvId).toBe('cv-1');
    expect(claims?.cvId).not.toBe('cv-2');
  });

  it('expires', () => {
    const token = createRenderToken('user-1', 'cv-1', 60);
    expect(verifyRenderToken(token)).not.toBeNull();

    vi.useFakeTimers();
    vi.setSystemTime(Date.now() + 61_000);
    expect(verifyRenderToken(token)).toBeNull();
  });

  it('is not valid before it is minted, in the sense that a past expiry never passes', () => {
    const token = createRenderToken('user-1', 'cv-1', -10);
    expect(verifyRenderToken(token)).toBeNull();
  });

  it('produces different tokens for different users', () => {
    const a = createRenderToken('user-1', 'cv-1');
    const b = createRenderToken('user-2', 'cv-1');
    expect(a).not.toBe(b);
    expect(verifyRenderToken(a)?.uid).toBe('user-1');
    expect(verifyRenderToken(b)?.uid).toBe('user-2');
  });
});
