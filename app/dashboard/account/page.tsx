import type { Metadata } from 'next';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { BadgeCheck, CreditCard, Lock, MailWarning } from 'lucide-react';

import { DashboardShell } from '@/components/dashboard/DashboardShell';
import { UpgradeCard } from '@/components/dashboard/UpgradeCard';
import { ButtonLink } from '@/components/ui/button';
import { Alert, Badge, EmptyState } from '@/components/ui/feedback';
import { Panel } from '@/components/ui/card';
import { requireViewer } from '@/lib/auth/guards';
import { listUserPayments } from '@/lib/db/payments';
import { formatDateTime } from '@/lib/cv/format';
import { appCopy } from '@/lib/i18n/app-copy';
import { LOCALE_COOKIE, resolveLocale } from '@/lib/i18n/resolve';
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
  const locale = resolveLocale({
    profileLocale: viewer.profile.locale,
    cookieLocale: (await cookies()).get(LOCALE_COOKIE)?.value,
  });
  const copy = appCopy(locale);

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
    <DashboardShell viewer={viewer} title={copy.nav.account} description={copy.account.lede}>
      <div className="flex flex-col gap-5">
        {!viewer.user.emailVerified ? (
          <Alert
            tone="warning"
            title={copy.account.unverifiedTitle}
            action={
              <ButtonLink href="/verify-email" size="sm">
                {copy.account.verifyNow}
              </ButtonLink>
            }
          >
            {copy.account.unverifiedBody}
          </Alert>
        ) : null}

        <Panel title={copy.settings.profileHeading} description={copy.account.profileHint}>
          <dl className="flex flex-col divide-y divide-ink-100">
            <div className="flex flex-wrap items-baseline justify-between gap-2 pb-3">
              <dt className="text-sm text-ink-500">{copy.account.displayName}</dt>
              <dd className="text-sm font-medium text-ink-900">
                {displayName || <span className="text-ink-400">{copy.account.notSet}</span>}
              </dd>
            </div>
            <div className="flex flex-wrap items-baseline justify-between gap-2 py-3">
              <dt className="text-sm text-ink-500">{copy.account.email}</dt>
              <dd className="flex flex-wrap items-center justify-end gap-2 text-sm font-medium text-ink-900">
                <span className="break-all">{viewer.user.email}</span>
                {viewer.user.emailVerified ? (
                  <Badge tone="success">
                    <BadgeCheck size={11} aria-hidden />
                    {copy.account.verified}
                  </Badge>
                ) : (
                  <Badge tone="warning">
                    <MailWarning size={11} aria-hidden />
                    {copy.account.unverified}
                  </Badge>
                )}
              </dd>
            </div>
            <div className="flex flex-wrap items-baseline justify-between gap-2 py-3">
              <dt className="text-sm text-ink-500">{copy.account.memberSince}</dt>
              <dd className="text-sm font-medium text-ink-900">
                {formatDateTime(viewer.profile.createdAt, locale)}
              </dd>
            </div>
            <div className="flex flex-wrap items-baseline justify-between gap-2 pt-3">
              <dt className="text-sm text-ink-500">{copy.account.lastSignIn}</dt>
              <dd className="text-sm font-medium text-ink-900">
                {viewer.profile.lastLoginAt
                  ? formatDateTime(viewer.profile.lastLoginAt, locale)
                  : '—'}
              </dd>
            </div>
          </dl>

          <div className="mt-4 flex items-start gap-2.5 rounded-lg bg-ink-50 p-3 text-xs leading-relaxed text-ink-600">
            <Lock size={14} aria-hidden className="mt-0.5 shrink-0 text-ink-400" />
            <p>
              {copy.account.profileLockedLead(site.name)}{' '}
              <Link href="/contact" className="font-semibold text-brand-700 underline">
                {copy.account.askSupport}
              </Link>
              {copy.account.profileLockedTail}
            </p>
          </div>
        </Panel>

        <Panel
          title={copy.settings.planHeading}
          description={copy.account.planHint}
          action={
            viewer.isPremium ? (
              <Badge tone="accent">{viewer.plan.name}</Badge>
            ) : (
              <ButtonLink href="/payment/checkout?plan=pro" size="sm">
                {copy.common.upgrade}
              </ButtonLink>
            )
          }
        >
          <dl className="flex flex-col divide-y divide-ink-100">
            <div className="flex flex-wrap items-baseline justify-between gap-2 pb-3">
              <dt className="text-sm text-ink-500">{copy.settings.currentPlan}</dt>
              <dd className="text-sm font-medium text-ink-900">
                {viewer.plan.name} — {viewer.plan.tagline}
              </dd>
            </div>
            <div className="flex flex-wrap items-baseline justify-between gap-2 py-3">
              <dt className="text-sm text-ink-500">{copy.account.statusLabel}</dt>
              {/* No `capitalize`: the label now comes from the copy table already cased for
                  its language, and forcing initial capitals mangles French and German. */}
              <dd className="text-sm font-medium text-ink-900">
                {copy.account.subscriptionStatus[entitlement.status]}
              </dd>
            </div>
            <div className="flex flex-wrap items-baseline justify-between gap-2 py-3">
              <dt className="text-sm text-ink-500">
                {entitlement.plan === 'lifetime' ? copy.account.expires : copy.account.renews}
              </dt>
              <dd className="text-sm font-medium text-ink-900">
                {entitlement.currentPeriodEnd
                  ? formatDateTime(entitlement.currentPeriodEnd, locale)
                  : viewer.isPremium
                    ? copy.account.neverPermanent
                    : copy.account.notApplicableFree}
              </dd>
            </div>
            <div className="flex flex-wrap items-baseline justify-between gap-2 pt-3">
              <dt className="text-sm text-ink-500">{copy.account.cvsAndDownloads}</dt>
              <dd className="text-sm font-medium text-ink-900">
                {copy.account.cvAllowance(viewer.limits.maxCvs)} ·{' '}
                {copy.account.downloadAllowance(viewer.limits.maxDownloadsPerMonth)}
              </dd>
            </div>
          </dl>
        </Panel>

        <Panel title={copy.account.billingHeading} description={copy.account.billingHint}>
          {charged.length === 0 ? (
            <EmptyState
              icon={<CreditCard size={20} aria-hidden />}
              title={copy.account.noPaymentsTitle}
              description={
                viewer.isPremium
                  ? copy.account.noPaymentsPremium
                  : unfinished.length > 0
                    ? copy.account.noPaymentsAbandoned
                    : copy.account.noPaymentsFree
              }
              action={
                viewer.isPremium ? undefined : (
                  <ButtonLink href="/pricing">{copy.dashboard.seePlans}</ButtonLink>
                )
              }
              className="border-0 bg-transparent py-8"
            />
          ) : (
            <div className="-mx-5 overflow-x-auto px-5">
              <table className="w-full min-w-[520px] text-sm">
                <thead>
                  <tr className="border-b border-ink-200 text-left text-xs tracking-wide text-ink-500 uppercase">
                    <th scope="col" className="py-2 pr-3 font-semibold">
                      {copy.account.colDate}
                    </th>
                    <th scope="col" className="py-2 pr-3 font-semibold">
                      {copy.account.colPlan}
                    </th>
                    <th scope="col" className="py-2 pr-3 font-semibold">
                      {copy.account.colAmount}
                    </th>
                    <th scope="col" className="py-2 pr-3 font-semibold">
                      {copy.account.colStatus}
                    </th>
                    <th scope="col" className="py-2 font-semibold">
                      {copy.account.colOrder}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink-100">
                  {charged.map((payment) => (
                    <tr key={payment.id}>
                      <td className="py-3 pr-3 whitespace-nowrap text-ink-700">
                        {formatDateTime(payment.createdAt, locale)}
                      </td>
                      <td className="py-3 pr-3 font-medium text-ink-900">
                        {getPlan(payment.planId).name}
                      </td>
                      <td className="py-3 pr-3 font-mono text-ink-900">
                        {payment.amount} {payment.currency}
                      </td>
                      <td className="py-3 pr-3">
                        <Badge tone={STATUS_TONES[payment.status]}>
                          {copy.account.paymentStatus[payment.status]}
                        </Badge>
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
              {/*
                The reassurance is the point of this block, not decoration: an abandoned
                PayPal order looks like a charge to anyone scanning a billing page, and the
                support cost of that mistake is high. `tests/lib/billing-history.test.ts`
                holds the copy table to saying so in every language.
              */}
              <h3 className="text-sm font-bold text-ink-900">{copy.account.unfinishedHeading}</h3>
              <p className="mt-1 text-xs leading-relaxed text-ink-600">
                {copy.account.unfinishedBody(unfinished.length)}
              </p>

              <ul className="mt-3 flex flex-col divide-y divide-ink-200">
                {unfinished.map((payment) => (
                  <li
                    key={payment.id}
                    className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 py-2 text-xs"
                  >
                    <span className="text-ink-600">
                      {formatDateTime(payment.createdAt, locale)} · {getPlan(payment.planId).name}
                    </span>
                    <span className="flex items-center gap-2">
                      <span className="text-ink-500 line-through">
                        {payment.amount} {payment.currency}
                      </span>
                      <Badge tone={STATUS_TONES[payment.status]}>
                        {copy.account.paymentStatus[payment.status]}
                      </Badge>
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
            {copy.account.invoiceLead}{' '}
            <Link href="/contact" className="font-semibold text-brand-700 underline">
              {copy.account.contactUs}
            </Link>
            {copy.account.invoiceTail}
          </p>
        </Panel>

        <UpgradeCard plan={viewer.plan} />
      </div>
    </DashboardShell>
  );
}
