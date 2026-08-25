import { NextResponse } from 'next/server';
import { z } from 'zod';

import { apiError, authedRoute, readJson } from '@/lib/api/handler';
import { createPromoCode, listPromoCodes, setPromoCodeActive } from '@/lib/db/promo';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * An ISO instant, or a bare `YYYY-MM-DD` from a date input.
 *
 * A `<input type="date">` submits `2026-09-01` with no time and no zone. Storing that
 * verbatim would make every comparison against `Date.now()` depend on the server's local
 * offset. The end of the window is normalised to the *end* of the day named rather than its
 * start, because "expires 1 September" means the code works on 1 September — reading it as
 * midnight would close the offer a day early, on the day it was advertised to run.
 */
function boundary(value: string | null | undefined, edge: 'start' | 'end'): string | null {
  if (!value) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return edge === 'start' ? `${value}T00:00:00.000Z` : `${value}T23:59:59.999Z`;
  }
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
}

const createSchema = z.object({
  code: z.string().trim().min(3).max(32),
  plan: z.enum(['pro', 'lifetime']),
  days: z.number().int().min(1).max(3650).nullable().default(null),
  maxRedemptions: z.number().int().min(1).max(1_000_000).nullable().default(null),
  startsAt: z.string().nullable().default(null),
  expiresAt: z.string().nullable().default(null),
  note: z.string().max(280).default(''),
});

const updateSchema = z.object({
  code: z.string().trim().min(1).max(64),
  active: z.boolean(),
});

/** Every code, newest first, with its redemption count. */
export const GET = authedRoute(
  { scope: 'admin-promo-list', requireAdmin: true, rateLimit: { max: 60, windowSeconds: 60 } },
  async () => NextResponse.json({ codes: await listPromoCodes() }),
);

export const POST = authedRoute(
  { scope: 'admin-promo-create', requireAdmin: true, rateLimit: { max: 20, windowSeconds: 60 } },
  async ({ request, profile }) => {
    const body = await readJson(request, createSchema);

    const startsAt = boundary(body.startsAt, 'start');
    const expiresAt = boundary(body.expiresAt, 'end');

    // A window that closes before it opens accepts nobody, and would sit in the list looking
    // live. Refused at creation rather than discovered by the first person who tries it.
    if (startsAt && expiresAt && new Date(startsAt) >= new Date(expiresAt)) {
      return apiError(422, 'invalid-window', 'The end of the window must come after the start.');
    }

    const result = await createPromoCode({
      code: body.code,
      plan: body.plan,
      days: body.days,
      maxRedemptions: body.maxRedemptions,
      startsAt,
      expiresAt,
      note: body.note,
      createdBy: profile.email || profile.uid,
    });

    if (!result.ok) {
      return result.reason === 'exists'
        ? apiError(409, 'code-exists', 'That code already exists. Pick another.')
        : apiError(
            422,
            'invalid-code',
            'Use 3–32 characters: letters, numbers and hyphens only.',
          );
    }

    return NextResponse.json({ ok: true, code: result.code }, { status: 201 });
  },
);

/**
 * Switches a code on or off.
 *
 * Deactivating rather than deleting, because the redemptions hang off the code document:
 * deleting it would orphan the record of who was granted what, which is the only audit
 * trail a comped account has.
 */
export const PATCH = authedRoute(
  { scope: 'admin-promo-update', requireAdmin: true, rateLimit: { max: 60, windowSeconds: 60 } },
  async ({ request }) => {
    const body = await readJson(request, updateSchema);
    const found = await setPromoCodeActive(body.code, body.active);

    if (!found) return apiError(404, 'not-found', 'That code does not exist.');
    return NextResponse.json({ ok: true });
  },
);
