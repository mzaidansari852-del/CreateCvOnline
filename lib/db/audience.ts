import 'server-only';

import { adminDb, COLLECTIONS } from '@/lib/firebase/admin';
import { DEFAULT_LOCALE, LOCALES, type Locale } from '@/lib/i18n/locales';

/**
 * Who may be sent an announcement.
 *
 * ## The rule, and why it is not configurable
 *
 * `marketingOptIn === true`. Always. There is no "send to everyone" option on the admin
 * page and there is no flag here to add one.
 *
 * That is a product decision with a legal floor under it. This site sells into Germany,
 * France and the Netherlands, where marketing e-mail needs consent that was freely given
 * and specific — and the signup form asks for exactly that, storing the answer in
 * `marketingOptIn`. Sending to the people who said no, or who were never asked, is
 * unlawful there regardless of how the message is worded.
 *
 * The practical argument points the same way. A list of people who asked to hear from you
 * outperforms a list of everyone, and the mailbox this sends through is a shared one: a
 * handful of spam complaints from unwilling recipients degrades delivery of password
 * resets and payment receipts for everybody else. There is no version of "just this once"
 * that is worth that.
 *
 * A service announcement that genuinely must reach every user — a breach, a shutdown, a
 * change of terms — is a different kind of message with a different lawful basis, and it
 * should be a different, deliberate piece of code rather than a checkbox here that gets
 * used for marketing on a quiet afternoon.
 */

export interface AudienceMember {
  uid: string;
  email: string;
  name: string;
  locale: Locale;
  plan: string;
}

export interface AudienceSummary {
  total: number;
  /** How the audience splits by language, so a sender knows what they are sending. */
  byLocale: Record<Locale, number>;
  /** Recipients with no usable address, excluded and counted so the number is explicable. */
  skipped: number;
}

function readLocale(raw: unknown): Locale {
  return LOCALES.includes(raw as Locale) ? (raw as Locale) : DEFAULT_LOCALE;
}

/** A first name for the greeting. `Sara Bennani` → `Sara`; an empty display name → ''. */
function firstName(displayName: unknown): string {
  if (typeof displayName !== 'string') return '';
  return displayName.trim().split(/\s+/)[0] ?? '';
}

/**
 * Everyone opted in, with the fields a template needs.
 *
 * Deliberately reads whole documents rather than a projection: Firestore charges per
 * document read either way, the audience is small by design, and a projection here would
 * be an optimisation paid for in a second place to keep in step with the profile schema.
 */
export async function marketingAudience(): Promise<AudienceMember[]> {
  const snapshot = await adminDb()
    .collection(COLLECTIONS.users)
    .where('marketingOptIn', '==', true)
    .get();

  const members: AudienceMember[] = [];

  for (const doc of snapshot.docs) {
    const raw = doc.data() ?? {};
    const email = typeof raw.email === 'string' ? raw.email.trim().toLowerCase() : '';

    /*
     * No address, no send. A profile can legitimately reach this state — an account deleted
     * from Firebase Auth but not from Firestore, or an older document written before the
     * field was required — and nodemailer would throw on it mid-run.
     */
    if (!email || !email.includes('@')) continue;

    members.push({
      uid: doc.id,
      email,
      name: firstName(raw.displayName),
      locale: readLocale(raw.locale),
      plan: typeof raw.entitlement === 'object' && raw.entitlement !== null
        ? String((raw.entitlement as Record<string, unknown>).plan ?? 'free')
        : 'free',
    });
  }

  return members;
}

/** The counts the admin page shows before anything is sent. */
export async function audienceSummary(): Promise<AudienceSummary> {
  const snapshot = await adminDb()
    .collection(COLLECTIONS.users)
    .where('marketingOptIn', '==', true)
    .get();

  const byLocale = LOCALES.reduce(
    (acc, locale) => ({ ...acc, [locale]: 0 }),
    {} as Record<Locale, number>,
  );

  let total = 0;
  let skipped = 0;

  for (const doc of snapshot.docs) {
    const raw = doc.data() ?? {};
    const email = typeof raw.email === 'string' ? raw.email.trim() : '';
    if (!email || !email.includes('@')) {
      skipped += 1;
      continue;
    }
    total += 1;
    byLocale[readLocale(raw.locale)] += 1;
  }

  return { total, byLocale, skipped };
}

/**
 * Records that someone opted out, from an unsubscribe link.
 *
 * Writes the same field the settings page writes, rather than a separate suppression list.
 * One field means one answer to "is this person opted in", and no possibility of a list
 * that says no while the profile says yes.
 *
 * Idempotent by construction — a second click writes the same false — which matters because
 * mail clients pre-fetch links and a one-click unsubscribe may be requested more than once
 * without a human ever seeing the page.
 */
export async function optOut(uid: string): Promise<{ found: boolean; email: string | null }> {
  const ref = adminDb().collection(COLLECTIONS.users).doc(uid);
  const snapshot = await ref.get();
  if (!snapshot.exists) return { found: false, email: null };

  await ref.set(
    { marketingOptIn: false, updatedAt: new Date().toISOString() },
    { merge: true },
  );

  const raw = snapshot.data() ?? {};
  return { found: true, email: typeof raw.email === 'string' ? raw.email : null };
}
