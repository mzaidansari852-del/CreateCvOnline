import 'server-only';

import { FieldValue } from 'firebase-admin/firestore';

import { adminAuth, adminDb, COLLECTIONS, toIso, userDoc } from '@/lib/firebase/admin';
import { serverEnv } from '@/lib/env';
import { defaultEntitlement, downloadPeriodKey, limitsFor } from '@/lib/plans';
import {
  userProfileSchema,
  type SessionUser,
  type UserEntitlement,
  type UserProfile,
} from '@/types/user';
import { DEFAULT_LOCALE, type Locale } from '@/lib/i18n/locales';

/**
 * User profile repository.
 *
 * Firestore documents are read through `userProfileSchema`, so a document written by an
 * older version of the app, or hand-edited in the console, is coerced into a valid shape
 * instead of crashing a page.
 */

function normalise(uid: string, raw: Record<string, unknown> | undefined): UserProfile {
  const parsed = userProfileSchema.safeParse({
    uid,
    email: raw?.email ?? '',
    displayName: raw?.displayName ?? '',
    photoURL: raw?.photoURL ?? '',
    role: raw?.role ?? 'user',
    emailVerified: raw?.emailVerified ?? false,
    entitlement: raw?.entitlement ?? defaultEntitlement(),
    createdAt: toIso(raw?.createdAt),
    updatedAt: toIso(raw?.updatedAt),
    lastLoginAt: raw?.lastLoginAt ? toIso(raw.lastLoginAt) : null,
    cvCount: raw?.cvCount ?? 0,
    downloadsThisMonth: raw?.downloadsThisMonth ?? 0,
    downloadsPeriod: raw?.downloadsPeriod ?? '',
    marketingOptIn: raw?.marketingOptIn ?? false,
    locale: raw?.locale ?? 'en',
  });

  if (parsed.success) return parsed.data;

  // A document we cannot parse must not take a page down: fall back to a safe profile.
  return userProfileSchema.parse({
    uid,
    email: typeof raw?.email === 'string' ? raw.email : '',
    displayName: '',
    photoURL: '',
    role: 'user',
    emailVerified: false,
    entitlement: defaultEntitlement(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const snapshot = await userDoc(uid).get();
  if (!snapshot.exists) return null;
  return normalise(uid, snapshot.data());
}

/** Creates the profile document on first sign-in, or refreshes it on subsequent ones. */
export async function ensureUserProfile(
  user: SessionUser,
  /**
   * The language the visitor signed up in, carried across the sign-up boundary by the
   * `cvo_locale` cookie. Only used when the profile is being created — a returning user's
   * saved preference must never be overwritten by whichever page they happened to land on.
   */
  signupLocale?: Locale,
): Promise<UserProfile> {
  const ref = userDoc(user.uid);
  const snapshot = await ref.get();
  const now = new Date().toISOString();

  if (!snapshot.exists) {
    const bootstrapAdmin =
      user.email.length > 0 && serverEnv().adminEmails.includes(user.email.toLowerCase());

    const profile: UserProfile = userProfileSchema.parse({
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      role: bootstrapAdmin ? 'admin' : 'user',
      emailVerified: user.emailVerified,
      entitlement: defaultEntitlement(),
      createdAt: now,
      updatedAt: now,
      lastLoginAt: now,
      cvCount: 0,
      downloadsThisMonth: 0,
      downloadsPeriod: downloadPeriodKey(),
      marketingOptIn: false,
      locale: signupLocale ?? DEFAULT_LOCALE,
    });

    await ref.set(profile);

    if (bootstrapAdmin) {
      await adminAuth().setCustomUserClaims(user.uid, { admin: true, role: 'admin' });
    }
    return profile;
  }

  // ADMIN_EMAILS is reconciled on every sign-in, not only on the first one.
  //
  // Granting it only at account creation made the variable a trap: adding your address
  // after you had already signed up did nothing, and the only route to a first admin was
  // the CLI script — which needs the service-account key working on your own machine,
  // precisely the setup someone deploying from a hosting dashboard has not done. The
  // custom claim is the authority (`roleFromClaims` in lib/auth/session.ts), so it is the
  // claim that has to be set, not just the mirrored Firestore field.
  //
  // Cheap: the branch only runs for an address explicitly listed in the variable, and
  // only when that account is not already an admin.
  const shouldBeAdmin =
    user.email.length > 0 && serverEnv().adminEmails.includes(user.email.toLowerCase());

  if (shouldBeAdmin && user.role !== 'admin') {
    await adminAuth().setCustomUserClaims(user.uid, { admin: true, role: 'admin' });
  }

  await ref.update({
    email: user.email,
    displayName: user.displayName || (snapshot.data()?.displayName ?? ''),
    photoURL: user.photoURL || (snapshot.data()?.photoURL ?? ''),
    emailVerified: user.emailVerified,
    ...(shouldBeAdmin ? { role: 'admin' } : {}),
    lastLoginAt: now,
    updatedAt: now,
  });

  return normalise(user.uid, {
    ...snapshot.data(),
    ...(shouldBeAdmin ? { role: 'admin' } : {}),
    lastLoginAt: now,
    updatedAt: now,
  });
}

export async function updateUserProfile(
  uid: string,
  patch: Partial<Pick<UserProfile, 'displayName' | 'photoURL' | 'marketingOptIn' | 'locale'>>,
): Promise<void> {
  await userDoc(uid).update({ ...patch, updatedAt: new Date().toISOString() });
}

export async function setEntitlement(uid: string, entitlement: UserEntitlement): Promise<void> {
  await userDoc(uid).set(
    {
      entitlement: { ...entitlement, updatedAt: new Date().toISOString() },
      updatedAt: new Date().toISOString(),
    },
    { merge: true },
  );
}

/**
 * Atomically increments the monthly download counter, resetting it when the calendar
 * month has rolled over. Returns the new count.
 */
export async function recordDownload(uid: string): Promise<number> {
  const ref = userDoc(uid);
  const period = downloadPeriodKey();

  return adminDb().runTransaction(async (transaction) => {
    const snapshot = await transaction.get(ref);
    const data = snapshot.data() ?? {};
    const samePeriod = data.downloadsPeriod === period;
    const next = (samePeriod ? Number(data.downloadsThisMonth ?? 0) : 0) + 1;

    transaction.set(
      ref,
      { downloadsThisMonth: next, downloadsPeriod: period, updatedAt: new Date().toISOString() },
      { merge: true },
    );
    return next;
  });
}

/** Downloads already used in the current calendar month. */
export function downloadsUsed(profile: UserProfile): number {
  return profile.downloadsPeriod === downloadPeriodKey() ? profile.downloadsThisMonth : 0;
}

export async function adjustCvCount(uid: string, delta: number): Promise<void> {
  await userDoc(uid).set(
    { cvCount: FieldValue.increment(delta), updatedAt: new Date().toISOString() },
    { merge: true },
  );
}

/* -------------------------------------------------------------------------- */
/* Admin operations                                                            */
/* -------------------------------------------------------------------------- */

export interface UserListPage {
  users: UserProfile[];
  nextCursor: string | null;
}

export async function listUsers(options: {
  limit?: number;
  cursor?: string | null;
  search?: string;
}): Promise<UserListPage> {
  const limit = Math.min(Math.max(options.limit ?? 25, 1), 100);
  const search = options.search?.trim().toLowerCase();

  // Firestore has no substring search; an exact e-mail match covers the realistic
  // admin use case ("find this customer") without adding a search dependency.
  if (search && search.includes('@')) {
    const snapshot = await adminDb()
      .collection(COLLECTIONS.users)
      .where('email', '==', search)
      .limit(limit)
      .get();
    return {
      users: snapshot.docs.map((doc) => normalise(doc.id, doc.data())),
      nextCursor: null,
    };
  }

  let query = adminDb()
    .collection(COLLECTIONS.users)
    .orderBy('createdAt', 'desc')
    .limit(limit + 1);

  if (options.cursor) query = query.startAfter(options.cursor);

  const snapshot = await query.get();
  const docs = snapshot.docs.slice(0, limit);
  const hasMore = snapshot.docs.length > limit;

  return {
    users: docs.map((doc) => normalise(doc.id, doc.data())),
    nextCursor: hasMore ? (docs[docs.length - 1]?.data()?.createdAt ?? null) : null,
  };
}

export async function countUsers(): Promise<number> {
  const snapshot = await adminDb().collection(COLLECTIONS.users).count().get();
  return snapshot.data().count;
}

/**
 * Free-plan accounts that have used up, or nearly used up, this month's PDF exports.
 *
 * The most commercially interesting list the admin area can show. Everyone on it has
 * written a CV, exported it as many times as the free plan allows, and then been stopped —
 * they are not browsing, they are mid-task and blocked, which is the one moment an upgrade
 * is obviously worth something to them rather than to us.
 *
 * Only the current period counts. `downloadsThisMonth` is a meter that resets on the 1st,
 * and a stale `downloadsPeriod` means the stored figure belongs to a month that has already
 * ended — reading it as current would fill this list every month with people who are not
 * blocked at all. `downloadsUsed()` already encodes that rule, so the filter runs in memory
 * after the query rather than as a `where` clause that cannot express it.
 *
 * Sorted by how far over the line they are, so the account that hit the wall hardest is
 * first.
 */
export interface BlockedByDownloadLimit {
  uid: string;
  email: string;
  displayName: string | null;
  used: number;
  limit: number;
  createdAt: string;
}

export async function usersAtDownloadLimit(
  options: {
    limit: number;
    /** Include accounts within this many exports of the cap. 0 = only those fully blocked. */
    within?: number;
    scan?: number;
  } = { limit: 10 },
): Promise<BlockedByDownloadLimit[]> {
  const within = options.within ?? 1;

  /*
   * Firestore cannot answer "used >= their plan's limit" — the limit lives in `lib/plans.ts`,
   * not in the document — so the most recent accounts are scanned and filtered here. A cap
   * keeps this bounded on an admin page that also runs several other aggregates; it is a
   * prompt list, not a report, and the users page is where an exhaustive answer belongs.
   */
  const snapshot = await adminDb()
    .collection(COLLECTIONS.users)
    .orderBy('createdAt', 'desc')
    .limit(Math.min(options.scan ?? 500, 1000))
    .get();

  const rows: BlockedByDownloadLimit[] = [];

  for (const doc of snapshot.docs) {
    const profile = normalise(doc.id, doc.data());
    const limit = limitsFor(profile.entitlement).maxDownloadsPerMonth;
    // `null` is unlimited — a paying customer can never be blocked, so never listed.
    if (limit === null) continue;

    const used = downloadsUsed(profile);
    if (used < limit - within) continue;

    rows.push({
      uid: profile.uid,
      email: profile.email,
      displayName: profile.displayName || null,
      used,
      limit,
      createdAt: profile.createdAt,
    });
  }

  return rows.sort((a, b) => b.used - a.used || b.limit - a.limit).slice(0, options.limit);
}

/** Grants or revokes administrator access. Custom claims are the authoritative source. */
export async function setUserRole(uid: string, role: 'user' | 'admin'): Promise<void> {
  const isAdmin = role === 'admin';
  await adminAuth().setCustomUserClaims(uid, isAdmin ? { admin: true, role: 'admin' } : {});
  await userDoc(uid).set({ role, updatedAt: new Date().toISOString() }, { merge: true });
  // Force the change to take effect on the next request rather than at token expiry.
  await adminAuth().revokeRefreshTokens(uid);
}

/** Deletes the auth record, the profile and every subcollection document. */
export async function deleteUserCompletely(uid: string): Promise<void> {
  const db = adminDb();
  const ref = userDoc(uid);

  for (const sub of [COLLECTIONS.cvs, COLLECTIONS.payments]) {
    const snapshot = await ref.collection(sub).get();
    let batch = db.batch();
    let operations = 0;
    for (const doc of snapshot.docs) {
      batch.delete(doc.ref);
      operations += 1;
      if (operations === 400) {
        await batch.commit();
        batch = db.batch();
        operations = 0;
      }
    }
    if (operations > 0) await batch.commit();
  }

  await ref.delete();
  await adminAuth()
    .deleteUser(uid)
    .catch(() => {
      /* Already gone — deleting the data is what matters. */
    });
}
