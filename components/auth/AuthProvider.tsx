'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  onIdTokenChanged,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  updateProfile,
  type User,
} from 'firebase/auth';

import { firebaseAuth, isFirebaseClientConfigured } from '@/lib/firebase/client';
import { trackEvent } from '@/lib/analytics/events';
import type { AppCopy } from '@/lib/i18n/app-copy';
import type { SessionUser } from '@/types/user';

/**
 * Client-side authentication.
 *
 * The Firebase SDK owns the sign-in ceremony; the server owns the session. After any
 * successful sign-in the fresh ID token is exchanged, once, for an httpOnly cookie via
 * `/api/auth/session`, and the router is refreshed so server components re-render with
 * the new identity. The SDK's own token is never used for authorisation.
 */

export interface AuthContextValue {
  /**
   * The signed-in user, derived from the Firebase client SDK.
   *
   * `null` both when signed out *and* while the SDK is still resolving — check `ready`
   * before rendering anything that depends on the difference. `role` is always `'user'`
   * here and must never be used to authorise anything; the server decides that.
   */
  sessionUser: SessionUser | null;
  /** The live Firebase user. `undefined` while the SDK is still resolving. */
  firebaseUser: User | null | undefined;
  /** `false` until the Firebase SDK has reported once. */
  ready: boolean;
  configured: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (input: { email: string; password: string; displayName: string }) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  resendVerificationEmail: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * An error whose *code* carries the meaning, for the failures this module raises itself.
 *
 * A finished English sentence thrown from here would be a user-visible string in the one
 * place that cannot reach the copy table — this component tree is shared by all three
 * languages. `authErrorMessage` renders the code instead, next to the Firebase ones.
 */
function codedError(code: string): Error {
  return Object.assign(new Error(code), { code });
}

async function postSession(idToken: string): Promise<void> {
  const response = await fetch('/api/auth/session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idToken }),
  });
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as {
      error?: { message?: string };
    } | null;
    // The API's own message wins when there is one: it is more specific than anything
    // this side could say. Only the generic fallback is ours to translate.
    if (body?.error?.message) throw new Error(body.error.message);
    throw codedError('app/session-failed');
  }
}

/**
 * The provider takes no server-rendered user, by design.
 *
 * Accepting one meant the root layout had to read `cookies()`, and that single read opted
 * every route in the application out of static rendering — see the note in `app/layout.tsx`.
 * The user is resolved from the Firebase client SDK instead, which costs a brief moment of
 * "not yet known" on first paint and buys back a fully static marketing site.
 *
 * Server components that need an authoritative user do not go through this context at all;
 * they call `requireViewer()` / `requireUser()`, which keeps the cookie read inside the
 * private routes where per-request rendering is the correct behaviour anyway.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();

  const [firebaseUser, setFirebaseUser] = useState<User | null | undefined>(undefined);
  const [ready, setReady] = useState(!isFirebaseClientConfigured);
  /** Set on sign-out so the UI updates before `onIdTokenChanged` reports the change. */
  const [signedOut, setSignedOut] = useState(false);

  /**
   * The current user in the shape the rest of the app expects.
   *
   * `role` is deliberately fixed at `'user'`: a client-derived value can never authorise
   * anything, and nothing in the UI may gate on it. Administrator access is decided by
   * `requireAdmin()` on the server, against the Firebase custom claim.
   */
  const sessionUser = useMemo<SessionUser | null>(() => {
    if (signedOut || !firebaseUser) return null;
    return {
      uid: firebaseUser.uid,
      email: firebaseUser.email ?? '',
      displayName: firebaseUser.displayName ?? '',
      photoURL: firebaseUser.photoURL ?? '',
      emailVerified: firebaseUser.emailVerified,
      role: 'user',
    };
  }, [firebaseUser, signedOut]);

  useEffect(() => {
    if (!isFirebaseClientConfigured) return;
    const unsubscribe = onIdTokenChanged(firebaseAuth(), (user) => {
      setFirebaseUser(user);
      if (user) setSignedOut(false);
      setReady(true);
    });
    return unsubscribe;
  }, []);

  const establishSession = useCallback(
    async (user: User) => {
      const idToken = await user.getIdToken(true);
      await postSession(idToken);
      router.refresh();
    },
    [router],
  );

  const signIn = useCallback<AuthContextValue['signIn']>(
    async (email, password) => {
      const credential = await signInWithEmailAndPassword(firebaseAuth(), email.trim(), password);
      await establishSession(credential.user);
      trackEvent('login', { method: 'password' });
    },
    [establishSession],
  );

  const signUp = useCallback<AuthContextValue['signUp']>(
    async ({ email, password, displayName }) => {
      const credential = await createUserWithEmailAndPassword(
        firebaseAuth(),
        email.trim(),
        password,
      );
      const name = displayName.trim();
      if (name) await updateProfile(credential.user, { displayName: name });
      await establishSession(credential.user);
      // Best effort: an unverifiable mail server must not block account creation.
      await sendEmailVerification(credential.user).catch(() => undefined);
      trackEvent('signup', { method: 'password' });
    },
    [establishSession],
  );

  const signInWithGoogle = useCallback<AuthContextValue['signInWithGoogle']>(async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    const credential = await signInWithPopup(firebaseAuth(), provider);
    await establishSession(credential.user);
    trackEvent('login', { method: 'google' });
  }, [establishSession]);

  const signOut = useCallback<AuthContextValue['signOut']>(async () => {
    // Clear the server session first: if the request fails the user is still signed in
    // rather than being left in a half-signed-out state.
    await fetch('/api/auth/session', { method: 'DELETE' }).catch(() => undefined);
    if (isFirebaseClientConfigured) await firebaseSignOut(firebaseAuth()).catch(() => undefined);
    setSignedOut(true);
    router.refresh();
    router.push('/');
  }, [router]);

  const resetPassword = useCallback<AuthContextValue['resetPassword']>(async (email) => {
    await sendPasswordResetEmail(firebaseAuth(), email.trim());
  }, []);

  const resendVerificationEmail = useCallback<
    AuthContextValue['resendVerificationEmail']
  >(async () => {
    const user = firebaseAuth().currentUser;
    if (!user) throw codedError('app/resend-signed-out');
    await sendEmailVerification(user);
  }, []);

  const refreshSession = useCallback<AuthContextValue['refreshSession']>(async () => {
    const user = firebaseAuth().currentUser;
    if (!user) return;
    await establishSession(user);
  }, [establishSession]);

  const value = useMemo<AuthContextValue>(
    () => ({
      sessionUser,
      firebaseUser,
      ready,
      configured: isFirebaseClientConfigured,
      signIn,
      signUp,
      signInWithGoogle,
      signOut,
      resetPassword,
      resendVerificationEmail,
      refreshSession,
    }),
    [
      sessionUser,
      firebaseUser,
      ready,
      signIn,
      signUp,
      signInWithGoogle,
      signOut,
      resetPassword,
      resendVerificationEmail,
      refreshSession,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside <AuthProvider>.');
  return context;
}

/**
 * Turns a Firebase error code into something a person can act on, in their language.
 * The SDK's own messages leak implementation detail, read like stack traces, and are
 * only ever in English.
 *
 * The codes are the SDK's and are never translated; only the sentence shown for each is.
 */
export function authErrorMessage(error: unknown, copy: AppCopy): string {
  const code =
    error && typeof error === 'object' && 'code' in error
      ? String((error as { code: unknown }).code)
      : '';

  switch (code) {
    case 'auth/invalid-email':
      return copy.auth.emailInvalid;
    case 'auth/user-disabled':
      return copy.auth.errorUserDisabled;
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return copy.auth.errorBadCredentials;
    case 'auth/email-already-in-use':
      return copy.auth.errorEmailInUse;
    case 'auth/weak-password':
      return copy.auth.errorWeakPassword;
    case 'auth/too-many-requests':
      return copy.auth.errorTooManyRequests;
    case 'auth/popup-closed-by-user':
    case 'auth/cancelled-popup-request':
      return copy.auth.errorPopupClosed;
    case 'auth/popup-blocked':
      return copy.auth.errorPopupBlocked;
    case 'auth/operation-not-allowed':
      return copy.auth.errorOperationNotAllowed;
    case 'auth/network-request-failed':
      return copy.auth.errorNetwork;
    case 'app/session-failed':
      return copy.auth.errorSessionFailed;
    case 'app/resend-signed-out':
      return copy.auth.errorResendSignedOut;
    default:
      if (error instanceof Error && error.message) return error.message;
      return copy.common.somethingWentWrong;
  }
}
