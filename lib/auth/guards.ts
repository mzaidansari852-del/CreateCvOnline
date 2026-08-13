import 'server-only';

import { cache } from 'react';
import { redirect } from 'next/navigation';

import { getSessionUser } from './session';
import { ensureUserProfile, getUserProfile } from '@/lib/db/users';
import { effectivePlan, limitsFor, type Plan, type PlanLimits } from '@/lib/plans';
import type { SessionUser, UserProfile } from '@/types/user';

/**
 * Route guards for server components and server actions.
 *
 * Route handlers use `lib/api/handler.ts` instead — they need to return a 401 JSON body
 * rather than perform a redirect.
 */

export class UnauthorizedError extends Error {
  readonly status = 401;
  constructor(message = 'You must be signed in to do that.') {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends Error {
  readonly status = 403;
  constructor(message = 'You do not have access to that.') {
    super(message);
    this.name = 'ForbiddenError';
  }
}

/** Redirects to `/login?next=…` when signed out. */
export async function requireUser(nextPath?: string): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) {
    const target = nextPath ? `/login?next=${encodeURIComponent(nextPath)}` : '/login';
    redirect(target);
  }
  return user;
}

/** Redirects to `/dashboard` when the signed-in user is not an administrator. */
export async function requireAdmin(): Promise<SessionUser> {
  const user = await requireUser('/admin');
  if (user.role !== 'admin') redirect('/dashboard?error=admin-only');
  return user;
}

export interface Viewer {
  user: SessionUser;
  profile: UserProfile;
  plan: Plan;
  limits: PlanLimits;
  isPremium: boolean;
  isAdmin: boolean;
}

/**
 * The full picture of the current user — session, stored profile, resolved plan and
 * limits — created on first access and memoised for the rest of the request.
 */
export const getViewer = cache(async (): Promise<Viewer | null> => {
  const user = await getSessionUser();
  if (!user) return null;

  const profile = (await getUserProfile(user.uid)) ?? (await ensureUserProfile(user));
  const plan = effectivePlan(profile.entitlement);

  return {
    user,
    profile,
    plan,
    limits: limitsFor(profile.entitlement),
    isPremium: plan.id !== 'free',
    isAdmin: user.role === 'admin',
  };
});

export async function requireViewer(nextPath?: string): Promise<Viewer> {
  const viewer = await getViewer();
  if (!viewer) {
    const target = nextPath ? `/login?next=${encodeURIComponent(nextPath)}` : '/login';
    redirect(target);
  }
  return viewer;
}
