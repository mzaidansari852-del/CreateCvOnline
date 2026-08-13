import type { Metadata } from 'next';
import Link from 'next/link';

import {
  AdminDataAlert,
  AdminPageHeader,
  AdminTable,
  KeyValueList,
  PaymentStatusBadge,
  PlanBadge,
  SubscriptionBadge,
  TableEmptyRow,
  Td,
  Th,
  shortId,
} from '@/components/admin/primitives';
import { UserActions } from '@/components/admin/UserActions';
import { loadAdmin } from '@/components/admin/data';
import { Alert, Badge } from '@/components/ui/feedback';
import { Card, Panel } from '@/components/ui/card';
import { requireAdmin } from '@/lib/auth/guards';
import { listCVs } from '@/lib/db/cvs';
import { listUserPayments } from '@/lib/db/payments';
import { getUserProfile } from '@/lib/db/users';
import { formatDateTime, formatRelativeTime } from '@/lib/cv/format';
import { getTemplate } from '@/lib/cv/template-registry';
import { effectivePlan, getPlan } from '@/lib/plans';
import { privateMetadata } from '@/lib/seo/metadata';

export const metadata: Metadata = privateMetadata('Account', 'Full account detail.');

export default async function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ uid: string }>;
}) {
  const [admin, { uid }] = await Promise.all([requireAdmin(), params]);

  const result = await loadAdmin(async () => {
    const profile = await getUserProfile(uid);
    if (!profile) return { profile: null, cvs: [], payments: [] };

    const [cvs, payments] = await Promise.all([listCVs(uid), listUserPayments(uid)]);
    return { profile, cvs, payments };
  });

  if (!result.data) {
    return (
      <div className="space-y-6">
        <BackLink />
        <AdminDataAlert
          configured={result.configured}
          error={result.error}
          what="This account"
        />
      </div>
    );
  }

  const { profile, cvs, payments } = result.data;

  if (!profile) {
    return (
      <div className="space-y-6">
        <BackLink />
        <Alert tone="warning" title="No such account">
          <p>
            There is no profile document at <code className="font-mono text-xs">users/{uid}</code>.
            It may have been deleted, or the identifier may be wrong.
          </p>
        </Alert>
      </div>
    );
  }

  const stored = getPlan(profile.entitlement.plan);
  const active = effectivePlan(profile.entitlement);
  const isSelf = profile.uid === admin.uid;

  return (
    <div className="space-y-6">
      <BackLink />

      <AdminPageHeader
        title={profile.email || shortId(profile.uid, 12)}
        description={
          profile.displayName
            ? `${profile.displayName} · joined ${formatDateTime(profile.createdAt)}`
            : `Joined ${formatDateTime(profile.createdAt)}`
        }
        action={
          <UserActions
            uid={profile.uid}
            email={profile.email}
            role={profile.role}
            planId={profile.entitlement.plan}
            isSelf={isSelf}
            afterDelete="list"
          />
        }
      />

      {isSelf ? (
        <Alert tone="info" title="This is your own account">
          <p>
            To avoid locking the last operator out, the console refuses to revoke your own
            administrator claim or delete your own account. Ask another administrator, or run{' '}
            <code className="font-mono text-xs">npm run set-admin</code> from a machine with
            service-account credentials.
          </p>
        </Alert>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Profile">
          <KeyValueList
            rows={[
              { label: 'UID', value: <span className="font-mono text-xs">{profile.uid}</span> },
              { label: 'E-mail', value: profile.email || '—' },
              {
                label: 'E-mail verified',
                value: profile.emailVerified ? (
                  <Badge tone="success">Verified</Badge>
                ) : (
                  <Badge tone="warning">Unverified</Badge>
                ),
              },
              { label: 'Display name', value: profile.displayName || '—' },
              {
                label: 'Role',
                value:
                  profile.role === 'admin' ? (
                    <Badge tone="accent">Administrator</Badge>
                  ) : (
                    <Badge>User</Badge>
                  ),
              },
              { label: 'Locale', value: profile.locale },
              { label: 'Marketing opt-in', value: profile.marketingOptIn ? 'Yes' : 'No' },
              { label: 'Created', value: formatDateTime(profile.createdAt) },
              { label: 'Updated', value: formatDateTime(profile.updatedAt) },
              {
                label: 'Last login',
                value: profile.lastLoginAt ? formatDateTime(profile.lastLoginAt) : 'Never',
              },
            ]}
          />
          <p className="mt-4 text-xs leading-relaxed text-ink-500">
            The role shown here is the copy stored on the profile document. Access is granted
            by the Firebase custom claim, which is set at the same time and is what every
            request is checked against.
          </p>
        </Panel>

        <Panel title="Entitlement">
          <KeyValueList
            rows={[
              {
                label: 'Stored plan',
                value: <PlanBadge planId={stored.id} label={stored.name} />,
              },
              {
                label: 'Plan in effect',
                value: (
                  <span className="flex flex-wrap items-center gap-2">
                    <PlanBadge planId={active.id} label={active.name} />
                    {active.id !== stored.id ? (
                      <span className="text-xs text-ink-500">
                        The stored plan has lapsed, so free limits apply.
                      </span>
                    ) : null}
                  </span>
                ),
              },
              {
                label: 'Status',
                value: <SubscriptionBadge status={profile.entitlement.status} />,
              },
              {
                label: 'Access until',
                value: profile.entitlement.currentPeriodEnd
                  ? `${formatDateTime(profile.entitlement.currentPeriodEnd)} (${formatRelativeTime(profile.entitlement.currentPeriodEnd)})`
                  : stored.id === 'free'
                    ? '—'
                    : 'No expiry',
              },
              {
                label: 'Last payment',
                value: profile.entitlement.lastPaymentId ? (
                  <span className="font-mono text-xs">{profile.entitlement.lastPaymentId}</span>
                ) : (
                  '—'
                ),
              },
              {
                label: 'Entitlement updated',
                value: profile.entitlement.updatedAt
                  ? formatDateTime(profile.entitlement.updatedAt)
                  : '—',
              },
              { label: 'CVs saved', value: String(profile.cvCount) },
              {
                label: 'Downloads this month',
                value: `${profile.downloadsThisMonth}${profile.downloadsPeriod ? ` (period ${profile.downloadsPeriod})` : ''}`,
              },
            ]}
          />
        </Panel>
      </div>

      <Card>
        <div className="border-b border-ink-100 p-5">
          <h2 className="text-base font-semibold text-ink-950">
            CVs <span className="text-ink-500">({cvs.length})</span>
          </h2>
          <p className="mt-1 text-sm text-ink-600">
            Read from this account&rsquo;s <code className="font-mono text-xs">cvs</code>{' '}
            subcollection, newest edit first. The console does not open a customer&rsquo;s CV
            in the editor — that would write to their document as them.
          </p>
        </div>
        <AdminTable minWidth={860}>
          <thead>
            <tr>
              <Th sticky>Title</Th>
              <Th>Template</Th>
              <Th align="right">Complete</Th>
              <Th>Sharing</Th>
              <Th align="right">Created</Th>
              <Th align="right">Updated</Th>
            </tr>
          </thead>
          <tbody>
            {cvs.length === 0 ? (
              <TableEmptyRow colSpan={6}>
                This account has not created a CV yet.
              </TableEmptyRow>
            ) : (
              cvs.map((cv) => (
                <tr key={cv.id}>
                  <Td sticky className="max-w-64 truncate font-medium text-ink-900">
                    {cv.title}
                  </Td>
                  <Td>{getTemplate(cv.templateId).name}</Td>
                  <Td align="right">{cv.completeness}%</Td>
                  <Td>
                    {cv.isPublic && cv.shareId ? (
                      <span className="flex items-center gap-2">
                        <Badge tone="warning">Public</Badge>
                        <span className="font-mono text-2xs text-ink-500" title={cv.shareId}>
                          {shortId(cv.shareId, 6)}
                        </span>
                      </span>
                    ) : (
                      <span className="text-ink-500">Private</span>
                    )}
                  </Td>
                  <Td align="right" className="whitespace-nowrap text-ink-600">
                    {formatDateTime(cv.createdAt)}
                  </Td>
                  <Td align="right" className="whitespace-nowrap text-ink-600">
                    {formatDateTime(cv.updatedAt)}
                  </Td>
                </tr>
              ))
            )}
          </tbody>
        </AdminTable>
      </Card>

      <Card>
        <div className="border-b border-ink-100 p-5">
          <h2 className="text-base font-semibold text-ink-950">
            Payment history <span className="text-ink-500">({payments.length})</span>
          </h2>
          <p className="mt-1 text-sm text-ink-600">
            Every order recorded for this account, including ones that were never completed.
            Refunds are marked from the{' '}
            <Link href="/admin/payments" className="font-semibold text-brand-700 hover:text-brand-800">
              payments ledger
            </Link>
            .
          </p>
        </div>
        <AdminTable minWidth={860}>
          <thead>
            <tr>
              <Th sticky>Order id</Th>
              <Th>Plan</Th>
              <Th align="right">Amount</Th>
              <Th>Status</Th>
              <Th>Payer e-mail</Th>
              <Th align="right">Created</Th>
            </tr>
          </thead>
          <tbody>
            {payments.length === 0 ? (
              <TableEmptyRow colSpan={6}>
                This account has never started a checkout.
              </TableEmptyRow>
            ) : (
              payments.map((payment) => (
                <tr key={payment.id}>
                  <Td sticky>
                    <span className="font-mono text-xs">{payment.providerOrderId}</span>
                  </Td>
                  <Td>{getPlan(payment.planId).name}</Td>
                  <Td align="right">
                    {payment.amount} {payment.currency}
                  </Td>
                  <Td>
                    <PaymentStatusBadge status={payment.status} />
                  </Td>
                  <Td className="max-w-56 truncate">{payment.payerEmail || '—'}</Td>
                  <Td align="right" className="whitespace-nowrap text-ink-600">
                    {formatDateTime(payment.createdAt)}
                  </Td>
                </tr>
              ))
            )}
          </tbody>
        </AdminTable>
      </Card>
    </div>
  );
}

function BackLink() {
  return (
    <Link
      href="/admin/users"
      className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 hover:text-brand-800"
    >
      <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
        <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      All users
    </Link>
  );
}
