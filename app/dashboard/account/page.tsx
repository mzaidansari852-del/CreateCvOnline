import type { Metadata } from 'next';
import Link from 'next/link';
import { BadgeCheck, CreditCard, Lock, MailWarning } from 'lucide-react';

import { DashboardShell } from '@/components/dashboard/DashboardShell';
import { UpgradeCard } from '@/components/dashboard/UpgradeCard';
import { ButtonLink } from '@/components/ui/button';
import { Alert, Badge, EmptyState } from '@/components/ui/feedback';
import { Panel } from '@/components/ui/card';
import { requireViewer } from '@/lib/auth/guards';
import { listUserPayments } from '@/lib/db/payments';
import { formatDateTime } from '@/lib/cv/format';
import { getPlan } from '@/lib/plans';
import { privateMetadata } from '@/lib/seo/metadata';
import { site } from '@/lib/site';
import type { BadgeTone } from '@/components/ui/feedback';
import type { PaymentStatus } from '@/types/payment';

export const metadata: Metadata = privateMetadata(
  'Account',
  'Your profile, plan and billing history.',
);

const STATUS_TONES: Record<PaymentStatus, BadgeTone> = {
  created: 'neutral',
  approved: 'warning',
  completed: 'success',
  failed: 'danger',
  cancelled: 'neutral',
  refunded: 'warning',
};

export default async function AccountPage() {
  const viewer = await requireViewer('/dashboard/account');
  const payments = await listUserPayments(viewer.user.uid).catch(() => []);

  // An order that never captured is not a payment, and showing one in a table headed
  // "Billing history" next to a currency amount reads as a charge no matter what the
  // status chip says. The records are worth keeping — they are how support traces an
  // abandoned checkout — but they belong under their own heading that says, in words,
  // that no money moved.
  const charged = payments.filter(
    (payment) => payment.status === 'completed' || payment.status === 'refunded',
  );
  const unfinished = payments.filter(
    (payment) => payment.status !== 'completed' && payment.status !== 'refunded',
  );

  const { entitlement } = viewer.profile;
  const displayName = viewer.profile.displayName || viewer.user.displayName;

  return (
    <DashboardShell
      viewer={viewer}
      title="Account"
      description="Who you are signed in as, what your plan allows, and what you have paid for."
    >
      <div className="flex flex-col gap-5">
        {!viewer.user.emailVerified ? (
          <Alert
            tone="warning"
            title="Your e-mail address is not verified"
            action={
              <ButtonLink href="/verify-email" size="sm">
                Verify now
              </ButtonLink>
            }
          >
            Verifying protects your account and makes password recovery possible.
          </Alert>
        ) : null}

        <Panel
          title="Profile"
          description="These details come from the account you sign in with."
        >
          <dl className="flex flex-col divide-y divide-ink-100">
            <div className="flex flex-wrap items-baseline justify-between gap-2 pb-3">
              <dt className="text-sm text-ink-500">Display name</dt>
              <dd className="text-sm font-medium text-ink-900">
                {displayName || <span className="text-ink-400">Not set</span>}
              </dd>
            </div>
            <div className="flex flex-wrap items-baseline justify-between gap-2 py-3">
              <dt className="text-sm text-ink-500">E-mail</dt>
              <dd className="flex flex-wrap items-center justify-end gap-2 text-sm font-medium text-ink-900">
                <span className="break-all">{viewer.user.email}</span>
                {viewer.user.emailVerified ? (
                  <Badge tone="success">
                    <BadgeCheck size={11} aria-hidden />
                    Verified
                  </Badge>
                ) : (
                  <Badge tone="warning">
                    <MailWarning size={11} aria-hidden />
                    Unverified
                  </Badge>
                )}
              </dd>
            </div>
            <div className="flex flex-wrap items-baseline justify-between gap-2 py-3">
              <dt className="text-sm text-ink-500">Member since</dt>
              <dd className="text-sm font-medium text-ink-900">
                {formatDateTime(viewer.profile.createdAt)}
              </dd>
            </div>
            <div className="flex flex-wrap items-baseline justify-between gap-2 pt-3">
              <dt className="text-sm text-ink-500">Last sign-in</dt>
              <dd className="text-sm font-medium text-ink-900">
                {viewer.profile.lastLoginAt ? formatDateTime(viewer.profile.lastLoginAt) : '—'}
              </dd>
            </div>
          </dl>

          <div className="mt-4 flex items-start gap-2.5 rounded-lg bg-ink-50 p-3 text-xs leading-relaxed text-ink-600">
            <Lock size={14} aria-hidden className="mt-0.5 shrink-0 text-ink-400" />
            <p>
              Read-only for now. Your display name and e-mail are taken from your sign-in
              provider and refreshed every time you sign in — {site.name} has no
              profile-editing endpoint yet, so changing them here would not persist. Change
              them with your provider, or{' '}
              <Link href="/contact" className="font-semibold text-brand-700 underline">
                ask support
              </Link>{' '}
              to do it for you.
            </p>
          </div>
        </Panel>

        <Panel
          title="Plan"
          description="What your account can do right now."
          action={
            viewer.isPremium ? (
              <Badge tone="accent">{viewer.plan.name}</Badge>
            ) : (
              <ButtonLink href="/payment/checkout?plan=pro" size="sm">
                Upgrade
              </ButtonLink>
            )
          }
        >
          <dl className="flex flex-col divide-y divide-ink-100">
            <div className="flex flex-wrap items-baseline justify-between gap-2 pb-3">
              <dt className="text-sm text-ink-500">Current plan</dt>
              <dd className="text-sm font-medium text-ink-900">
                {viewer.plan.name} — {viewer.plan.tagline}
              </dd>
            </div>
            <div className="flex flex-wrap items-baseline justify-between gap-2 py-3">
              <dt className="text-sm text-ink-500">Status</dt>
              <dd className="text-sm font-medium text-ink-900 capitalize">
                {entitlement.status === 'none' ? 'No subscription' : entitlement.status}
              </dd>
            </div>
            <div className="flex flex-wrap items-baseline justify-between gap-2 py-3">
              <dt className="text-sm text-ink-500">
                {entitlement.plan === 'lifetime' ? 'Expires' : 'Renews'}
              </dt>
              <dd className="text-sm font-medium text-ink-900">
                {entitlement.currentPeriodEnd
                  ? formatDateTime(entitlement.currentPeriodEnd)
                  : viewer.isPremium
                    ? 'Never — permanent access'
                    : 'Not applicable on Free'}
              </dd>
            </div>
            <div className="flex flex-wrap items-baseline justify-between gap-2 pt-3">
              <dt className="text-sm text-ink-500">CVs / downloads</dt>
              <dd className="text-sm font-medium text-ink-900">
                {viewer.limits.maxCvs === null ? 'Unlimited' : `${viewer.limits.maxCvs} CVs`} ·{' '}
                {viewer.limits.maxDownloadsPerMonth === null
                  ? 'unlimited downloads'
                  : `${viewer.limits.maxDownloadsPerMonth} downloads a month`}
              </dd>
            </div>
          </dl>
        </Panel>

        <Panel title="Billing history" description="Payments actually taken from this account.">
          {charged.length === 0 ? (
            <EmptyState
              icon={<CreditCard size={20} aria-hidden />}
              title="No payments yet"
              description={
                viewer.isPremium
                  ? 'Your access was granted without a recorded payment. Contact support if that looks wrong.'
                  : unfinished.length > 0
                    ? 'You have started a checkout but never completed one, so nothing has been charged.'
                    : 'You are on the Free plan, so there is nothing to bill.'
              }
              action={
                viewer.isPremium ? undefined : <ButtonLink href="/pricing">See plans</ButtonLink>
              }
              className="border-0 bg-transparent py-8"
            />
          ) : (
            <div className="-mx-5 overflow-x-auto px-5">
              <table className="w-full min-w-[520px] text-sm">
                <thead>
                  <tr className="border-b border-ink-200 text-left text-xs tracking-wide text-ink-500 uppercase">
                    <th scope="col" className="py-2 pr-3 font-semibold">
                      Date
                    </th>
                    <th scope="col" className="py-2 pr-3 font-semibold">
                      Plan
                    </th>
                    <th scope="col" className="py-2 pr-3 font-semibold">
                      Amount
                    </th>
                    <th scope="col" className="py-2 pr-3 font-semibold">
                      Status
                    </th>
                    <th scope="col" className="py-2 font-semibold">
                      Order
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink-100">
                  {charged.map((payment) => (
                    <tr key={payment.id}>
                      <td className="py-3 pr-3 whitespace-nowrap text-ink-700">
                        {formatDateTime(payment.createdAt)}
                      </td>
                      <td className="py-3 pr-3 font-medium text-ink-900">
                        {getPlan(payment.planId).name}
                      </td>
                      <td className="py-3 pr-3 font-mono text-ink-900">
                        {payment.amount} {payment.currency}
                      </td>
                      <td className="py-3 pr-3">
                        <Badge tone={STATUS_TONES[payment.status]}>{payment.status}</Badge>
                      </td>
                      <td className="py-3 font-mono text-[11px] break-all text-ink-500">
                        {payment.providerOrderId}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {unfinished.length > 0 ? (
            <div className="mt-6 rounded-xl border border-ink-200 bg-ink-50 p-4">
              <h3 className="text-sm font-bold text-ink-900">
                Unfinished checkouts · nothing was charged
              </h3>
              <p className="mt-1 text-xs leading-relaxed text-ink-600">
                {unfinished.length === 1 ? 'This checkout was' : 'These checkouts were'} started
                but never completed — the order was opened with PayPal and abandoned before
                payment. No money left your account and no plan was granted. We keep the
                reference so support can trace it if you think otherwise.
              </p>

              <ul className="mt-3 flex flex-col divide-y divide-ink-200">
                {unfinished.map((payment) => (
                  <li
                    key={payment.id}
                    className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 py-2 text-xs"
                  >
                    <span className="text-ink-600">
                      {formatDateTime(payment.createdAt)} · {getPlan(payment.planId).name}
                    </span>
                    <span className="flex items-center gap-2">
                      <span className="text-ink-500 line-through">
                        {payment.amount} {payment.currency}
                      </span>
                      <Badge tone={STATUS_TONES[payment.status]}>{payment.status}</Badge>
                    </span>
                    <span className="w-full font-mono text-[11px] break-all text-ink-400">
                      {payment.providerOrderId}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <p className="mt-4 text-xs leading-relaxed text-ink-500">
            Need an invoice, a refund or a receipt re-sent?{' '}
            <Link href="/contact" className="font-semibold text-brand-700 underline">
              Contact us
            </Link>{' '}
            with the order id.
          </p>
        </Panel>

        <UpgradeCard plan={viewer.plan} />
      </div>
    </DashboardShell>
  );
}
