'use client';

import { getApp, getApps, initializeApp, type FirebaseApp } from 'firebase/app';
import {
  browserLocalPersistence,
  getAuth,
  setPersistence,
  type Auth,
} from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from 'firebase/storage';

import { isFirebaseClientConfigured, publicEnv } from '@/lib/env';

/**
 * Browser-side Firebase.
 *
 * Initialisation is lazy and memoised: importing this module never touches the network,
 * and when the project has not been configured yet the getters throw a message that says
 * exactly which file to fill in rather than a stack trace from inside the SDK.
 */

let app: FirebaseApp | null = null;

function notConfigured(): never {
  throw new Error(
    'Firebase is not configured. Copy .env.example to .env.local and fill in the ' +
      'NEXT_PUBLIC_FIREBASE_* values from Firebase Console → Project settings → Your apps.',
  );
}

export function firebaseApp(): FirebaseApp {
  if (!isFirebaseClientConfigured) notConfigured();
  if (app) return app;
  app = getApps().length > 0 ? getApp() : initializeApp(publicEnv.firebase);
  return app;
}

let authInstance: Auth | null = null;

export function firebaseAuth(): Auth {
  if (authInstance) return authInstance;
  authInstance = getAuth(firebaseApp());
  // Persist across tabs and reloads; the httpOnly session cookie is the server's source
  // of truth, but keeping the client session avoids a flash of signed-out UI.
  void setPersistence(authInstance, browserLocalPersistence).catch(() => {
    /* Safari private mode and similar: fall back to the SDK default. */
  });
  return authInstance;
}

let firestoreInstance: Firestore | null = null;

export function firebaseDb(): Firestore {
  if (firestoreInstance) return firestoreInstance;
  firestoreInstance = getFirestore(firebaseApp());
  return firestoreInstance;
}

let storageInstance: FirebaseStorage | null = null;

export function firebaseStorage(): FirebaseStorage {
  if (storageInstance) return storageInstance;
  storageInstance = getStorage(firebaseApp());
  return storageInstance;
}

/** Firebase Analytics, when both configured and supported by the browser. */
export async function initFirebaseAnalytics(): Promise<void> {
  if (!isFirebaseClientConfigured || !publicEnv.firebase.measurementId) return;
  try {
    const { getAnalytics, isSupported } = await import('firebase/analytics');
    if (await isSupported()) getAnalytics(firebaseApp());
  } catch {
    /* Analytics is strictly optional — never let it break the app. */
  }
}

export { isFirebaseClientConfigured };
