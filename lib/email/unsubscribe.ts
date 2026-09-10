import 'server-only';

import { createHmac, timingSafeEqual } from 'node:crypto';

import { serverEnv } from '@/lib/env';
import { absoluteUrl } from '@/lib/site';

/**
 * Unsubscribe links.
 *
 * Every marketing e-mail carries one, and it has to work without a login. Somebody who
 * wants out is frequently somebody who has forgotten they have an account, and putting a
 * sign-in form between them and the exit is how a mildly annoyed reader becomes a spam
 * complaint — which costs the domain's deliverability far more than the subscriber was
 * worth.
 *
 * So the link is a capability: a signed token naming one account and one purpose. It does
 * not expire. An unsubscribe link from a two-year-old e-mail must still work, because that
 * is exactly the e-mail somebody digs up when they have finally had enough — and the worst
 * a leaked one can do is stop marketing to its owner.
 *
 * ## Scope
 *
 * `unsubscribe` is the only purpose this signs, and the token grants nothing else: it
 * cannot read a profile, change a plan or authenticate a session. That is deliberate.
 * A token that travels in the clear through a dozen mail servers should be able to do
 * exactly one harmless thing.
 */

const PURPOSE = 'unsubscribe';

function sign(payload: string): string {
  /*
   * Shares the render secret rather than adding a variable. Both are server-side HMAC keys
   * with no external counterpart, and the purpose string keeps their token spaces disjoint:
   * a print token cannot be replayed here, because the payload it signed does not begin
   * with `unsubscribe.`.
   */
  return createHmac('sha256', serverEnv().pdf.renderSecret).update(payload).digest('base64url');
}

export function createUnsubscribeToken(uid: string): string {
  const payload = `${PURPOSE}.${uid}`;
  return `${Buffer.from(payload).toString('base64url')}.${sign(payload)}`;
}

/** The uid the token names, or `null` if it is not one of ours. */
export function verifyUnsubscribeToken(token: string | null | undefined): string | null {
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
  // Constant-time, and length-checked first because `timingSafeEqual` throws on a mismatch.
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

  const [purpose, uid] = payload.split('.');
  if (purpose !== PURPOSE || !uid) return null;
  return uid;
}

/** The absolute URL to put in an e-mail. */
export function unsubscribeUrl(uid: string): string {
  return absoluteUrl(`/unsubscribe?token=${createUnsubscribeToken(uid)}`);
}
