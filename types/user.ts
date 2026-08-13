import { z } from 'zod';

export const planIdSchema = z.enum(['free', 'pro', 'lifetime']);
export type PlanId = z.infer<typeof planIdSchema>;

export const userRoleSchema = z.enum(['user', 'admin']);
export type UserRole = z.infer<typeof userRoleSchema>;

export const subscriptionStatusSchema = z.enum([
  'none',
  'active',
  'expired',
  'cancelled',
  'pending',
]);
export type SubscriptionStatus = z.infer<typeof subscriptionStatusSchema>;

export const userEntitlementSchema = z.object({
  plan: planIdSchema.default('free'),
  status: subscriptionStatusSchema.default('none'),
  /** ISO-8601. `null` for the free plan and for lifetime access. */
  currentPeriodEnd: z.string().nullable().default(null),
  /** Last successful payment id, for support/audit. */
  lastPaymentId: z.string().nullable().default(null),
  updatedAt: z.string().nullable().default(null),
});
export type UserEntitlement = z.infer<typeof userEntitlementSchema>;

export const userProfileSchema = z.object({
  uid: z.string(),
  email: z.string(),
  displayName: z.string().default(''),
  photoURL: z.string().default(''),
  role: userRoleSchema.default('user'),
  emailVerified: z.boolean().default(false),
  entitlement: userEntitlementSchema,
  createdAt: z.string(),
  updatedAt: z.string(),
  lastLoginAt: z.string().nullable().default(null),
  /** Denormalised counters kept in sync by the CV repository. */
  cvCount: z.number().int().min(0).default(0),
  downloadsThisMonth: z.number().int().min(0).default(0),
  downloadsPeriod: z.string().default(''),
  marketingOptIn: z.boolean().default(false),
  locale: z.string().default('en'),
});
export type UserProfile = z.infer<typeof userProfileSchema>;

/** What a server component / route handler knows about the caller. */
export interface SessionUser {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  emailVerified: boolean;
  role: UserRole;
}
