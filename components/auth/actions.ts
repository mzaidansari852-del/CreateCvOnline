'use server';

import { getSessionUser } from '@/lib/auth/session';
import { updateUserProfile } from '@/lib/db/users';

/**
 * Stores the marketing opt-in chosen on the sign-up form.
 *
 * Runs after the session cookie exists (the sign-up flow POSTs the ID token first, which
 * also creates the profile document), and only ever writes the *caller's own* profile —
 * the uid comes from the verified session cookie, never from the client.
 *
 * Failing to record a newsletter preference must never fail a sign-up, so the write is
 * best effort and the action resolves either way.
 */
export async function setMarketingOptIn(optIn: boolean): Promise<void> {
  if (typeof optIn !== 'boolean') return;

  const user = await getSessionUser();
  if (!user) return;

  try {
    await updateUserProfile(user.uid, { marketingOptIn: optIn });
  } catch {
    /* The account exists; the preference can be changed later in Settings. */
  }
}
