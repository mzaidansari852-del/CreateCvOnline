import 'server-only';

import { cert, getApp, getApps, initializeApp, type App } from 'firebase-admin/app';
import { getAuth, type Auth } from 'firebase-admin/auth';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';
import { getStorage, type Storage } from 'firebase-admin/storage';

import { requireFirebaseAdminEnv, serverEnv } from '@/lib/env';

/**
 * Server-side Firebase (Admin SDK).
 *
 * This module is `server-only`: importing it from a client component is a build error,
 * which is the guarantee that a service-account key can never reach the browser.
 *
 * Initialisation is lazy so that `next build` succeeds on a machine with no credentials —
 * only a request that actually needs Firestore will fail, and it fails with a message
 * naming the missing variables.
 */

const APP_NAME = 'createcvonline-admin';

function adminApp(): App {
  const existing = getApps().find((app) => app.name === APP_NAME);
  if (existing) return existing;

  const credentials = requireFirebaseAdminEnv();
  return initializeApp(
    {
      credential: cert({
        projectId: credentials.projectId,
        clientEmail: credentials.clientEmail,
        privateKey: credentials.privateKey,
      }),
      projectId: credentials.projectId,
      storageBucket: serverEnv().storageBucket,
    },
    APP_NAME,
  );
}

let firestoreInstance: Firestore | null = null;

export function adminDb(): Firestore {
  if (firestoreInstance) return firestoreInstance;
  const instance = getFirestore(adminApp());
  try {
    instance.settings({ ignoreUndefinedProperties: true });
  } catch {
    // `settings` throws if the instance has already been used; harmless on hot reload.
  }
  firestoreInstance = instance;
  return firestoreInstance;
}

export function adminAuth(): Auth {
  return getAuth(adminApp());
}

export function adminStorage(): Storage {
  return getStorage(adminApp());
}

/** True when the Admin SDK can be initialised. Never throws. */
export function hasAdminCredentials(): boolean {
  try {
    requireFirebaseAdminEnv();
    return true;
  } catch {
    return false;
  }
}

/** Used by tests and by `getApp` consumers that must not create a second app. */
export function existingAdminApp(): App | null {
  try {
    return getApp(APP_NAME);
  } catch {
    return null;
  }
}

/* -------------------------------------------------------------------------- */
/* Collection paths — the only place these strings are written                 */
/* -------------------------------------------------------------------------- */

export const COLLECTIONS = {
  users: 'users',
  cvs: 'cvs',
  payments: 'payments',
  blogPosts: 'blogPosts',
  settings: 'settings',
  templates: 'templates',
} as const;

export function userDoc(uid: string) {
  return adminDb().collection(COLLECTIONS.users).doc(uid);
}

export function cvCollection(uid: string) {
  return userDoc(uid).collection(COLLECTIONS.cvs);
}

export function paymentCollection(uid: string) {
  return userDoc(uid).collection(COLLECTIONS.payments);
}

/** Firestore `Timestamp` | `Date` | ISO string → ISO string. */
export function toIso(value: unknown): string {
  if (!value) return new Date(0).toISOString();
  if (typeof value === 'string') return value;
  if (value instanceof Date) return value.toISOString();
  if (
    typeof value === 'object' &&
    value !== null &&
    'toDate' in value &&
    typeof (value as { toDate: () => Date }).toDate === 'function'
  ) {
    return (value as { toDate: () => Date }).toDate().toISOString();
  }
  return new Date(0).toISOString();
}
