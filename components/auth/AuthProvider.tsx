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
  /** From the server-verified session cookie — authoritative, available on first paint. */
  sessionUser: SessionUser | null;
  /** The live Firebase user. `undefined` while the SDK is still resolving. */
  firebaseUser: User | null | undefined;
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

async function postSession(idToken: string): Promise<void> {
  const response = await fetch('/api/auth/session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idToken }),
  });
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as
      | { error?: { message?: string } }
      | null;
    throw new Error(body?.error?.message ?? 'Could not start your session. Please try again.');
  }
}

export function AuthProvider({
  children,
  initialUser,
}: {
  children: ReactNode;
  initialUser: SessionUser | null;
}) {
  const router = useRouter();
  // Adjusting state during render (rather than in an effect) is React's documented
  // pattern for "reset local state when a prop changes": the server is the source of
  // truth for the session, and signing out clears it locally before the refresh lands.
  const [session, setSession] = useState<{ user: SessionUser | null; from: SessionUser | null }>({
    user: initialUser,
    from: initialUser,
  });
  if (session.from !== initialUser) {
    setSession({ user: initialUser, from: initialUser });
  }
  const sessionUser = session.user;
  const setSessionUser = (next: SessionUser | null) =>
    setSession((current) => ({ ...current, user: next }));

  const [firebaseUser, setFirebaseUser] = useState<User | null | undefined>(undefined);
  const [ready, setReady] = useState(!isFirebaseClientConfigured);

  useEffect(() => {
    if (!isFirebaseClientConfigured) return;
    const unsubscribe = onIdTokenChanged(firebaseAuth(), (user) => {
      setFirebaseUser(user);
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
    setSessionUser(null);
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
    if (!user) throw new Error('Sign in again to resend the verification e-mail.');
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
 * Turns a Firebase error code into something a person can act on.
 * The SDK's own messages leak implementation detail and read like stack traces.
 */
export function authErrorMessage(error: unknown): string {
  const code =
    error && typeof error === 'object' && 'code' in error ? String((error as { code: unknown }).code) : '';

  switch (code) {
    case 'auth/invalid-email':
      return 'That does not look like a valid e-mail address.';
    case 'auth/user-disabled':
      return 'This account has been disabled. Contact support if you think that is a mistake.';
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'That e-mail and password combination does not match an account.';
    case 'auth/email-already-in-use':
      return 'An account already exists with that e-mail. Try signing in instead.';
    case 'auth/weak-password':
      return 'Choose a password of at least 8 characters.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Wait a few minutes and try again, or reset your password.';
    case 'auth/popup-closed-by-user':
    case 'auth/cancelled-popup-request':
      return 'The Google sign-in window was closed before finishing.';
    case 'auth/popup-blocked':
      return 'Your browser blocked the Google sign-in window. Allow pop-ups for this site and try again.';
    case 'auth/operation-not-allowed':
      return 'That sign-in method is not enabled for this project yet.';
    case 'auth/network-request-failed':
      return 'Network problem — check your connection and try again.';
    default:
      if (error instanceof Error && error.message) return error.message;
      return 'Something went wrong. Please try again.';
  }
}
