import type { Metadata } from 'next';
import Link from 'next/link';

import {
  AdminDataAlert,
  AdminPageHeader,
  AdminTable,
  PaymentStatusBadge,
  PlanBadge,
  ShareBar,
  Sparkline,
  StatTile,
  StatTileGrid,
  TableEmptyRow,
  Td,
  Th,
  formatCount,
  formatMoney,
  shortId,
} from '@/components/admin/primitives';
import { loadAdmin, paymentsPerDay, planSplit } from '@/components/admin/data';
import { Panel } from '@/components/ui/card';
import { countAllCVs } from '@/lib/db/cvs';
import { listAllPayments, revenueSummary } from '@/lib/db/payments';
import { countUsers, listUsers } from '@/lib/db/users';
import { formatDateTime, formatRelativeTime } from '@/lib/cv/format';
import { getPlan, PLAN_ORDER } from '@/lib/plans';
import { privateMetadata } from '@/lib/seo/metadata';
import { site } from '@/lib/site';

export const metadata: Metadata = privateMetadata(
  'Overview',
  `Operational overview for ${site.name}.`,
);

/** Validated categorical steps — see the plan legend below; text never wears these. */
const PLAN_COLORS: Record<string, string> = {
  free: 'var(--color-brand-400)',
  pro: 'var(--color-brand-600)',
  lifetime: 'var(--color-accent-500)',
};

export default async function AdminOverviewPage() {
  const metrics = await loadAdmin(async () => {
    const [users, cvs, revenue] = await Promise.all([
      countUsers(),
      countAllCVs(),
      revenueSummary(),
    ]);
    return { users, cvs, revenue, split: await planSplit(users) };
  });

  const activity = await loadAdmin(async () => {
    const [signups, payments] = await Promise.all([
      listUsers({ limit: 10 }),
      listAllPayments(200),
    ]);
    return { signups: signups.users, payments };
  });

  // Bound to consts so the narrowing survives into the callbacks below.
  const summary = metrics.data;
  const recent = activity.data;

  const currencies = Object.entries(summary?.revenue.totalByCurrency ?? {}).sort(
    (a, b) => b[1] - a[1],
  );
  const trend = recent ? paymentsPerDay(recent.payments, 30) : [];
  const trendPeak = trend.reduce((peak, point) => Math.max(peak, point.value), 0);

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Overview"
        description={`Live operational figures for ${site.name}. Everything on this page is read straight from Firestore at request time — nothing here is cached.`}
      />

      {summary ? (
        <>
          <StatTileGrid>
            <StatTile
              label="Total users"
              value={formatCount(summary.users)}
              hint="Accounts with a profile document."
            />
            <StatTile
              label="Total CVs"
              value={formatCount(summary.cvs)}
              hint="Across every account, including drafts."
            />
            <StatTile
              label="Completed payments"
              value={formatCount(summary.revenue.completedCount)}
              hint="Orders that captured successfully."
            />
            <StatTile
              label="Payments, last 30 days"
              value={formatCount(summary.revenue.last30DaysCount)}
              hint="Completed orders created in the last 30 days."
            />
          </StatTileGrid>

          <div className="grid gap-6 lg:grid-cols-2">
            <Panel
              title="Revenue by currency"
              description="Summed from completed payments. Amounts are gross — Paddle fees, taxes and refunds recorded outside the app are not deducted."
            >
              {currencies.length === 0 ? (
                <p className="text-sm text-ink-600">
                  No completed payments yet, so there is nothing to total.
                </p>
              ) : (
                <ul className="divide-y divide-ink-100">
                  {currencies.map(([currency, amount]) => (
                    <li key={currency} className="flex items-baseline justify-between py-2.5">
                      <span className="text-sm font-medium text-ink-700">{currency}</span>
                      <span className="text-lg font-semibold tabular-nums text-ink-950">
                        {formatMoney(amount, currency)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
              <p className="mt-4 text-xs leading-relaxed text-ink-500">
                Based on the most recent 1,000 completed payments.
              </p>
            </Panel>

            <Panel
              title="Plan split"
              description="Counts the plan stored on each account. An expired paid entitlement still counts as paid here until it is renewed or reset."
            >
              <ShareBar
                total={summary.split.total}
                segments={[
                  ...PLAN_ORDER.map((planId) => ({
                    label: getPlan(planId).name,
                    value: summary.split.counts[planId],
                    color: PLAN_COLORS[planId] ?? 'var(--color-ink-300)',
                  })),
                  ...(summary.split.unassigned > 0
                    ? [
                        {
                          label: 'No plan recorded',
                          value: summary.split.unassigned,
                          color: 'var(--color-ink-300)',
                        },
                      ]
                    : []),
                ]}
              />
            </Panel>
          </div>
        </>
      ) : (
        <AdminDataAlert
          configured={metrics.configured}
          error={metrics.error}
          what="Overview figures"
        />
      )}

      {recent ? (
        <>
          <Panel
            title="Payments per day"
            description="One point per day for the last 30 days, drawn from the 200 most recent orders of any status. Hover a day to read its count."
          >
            {trendPeak === 0 ? (
              <p className="text-sm text-ink-600">
                No orders were created in the last 30 days, so there is no trend to draw.
              </p>
            ) : (
              <>
                <Sparkline
                  points={trend}
                  ariaLabel={`Orders created per day over the last 30 days. Peak ${trendPeak} in one day.`}
                />
                <div className="mt-2 flex items-baseline justify-between text-xs text-ink-500">
                  <span>{trend[0]?.label}</span>
                  <span className="text-ink-700">Peak {trendPeak}/day</span>
                  <span>{trend[trend.length - 1]?.label}</span>
                </div>
              </>
            )}
          </Panel>

          <div className="grid gap-6 xl:grid-cols-2">
            <Panel
              title="Newest accounts"
              description="The 10 most recent signups."
              bodyClassName="p-0"
              action={
                <Link
                  href="/admin/users"
                  className="text-sm font-semibold text-brand-700 hover:text-brand-800"
                >
                  All users
                </Link>
              }
            >
              <AdminTable minWidth={520}>
                <thead>
                  <tr>
                    <Th sticky>E-mail</Th>
                    <Th>Plan</Th>
                    <Th align="right">CVs</Th>
                    <Th align="right">Signed up</Th>
                  </tr>
                </thead>
                <tbody>
                  {recent.signups.length === 0 ? (
                    <TableEmptyRow colSpan={4}>
                      No accounts have been created yet.
                    </TableEmptyRow>
                  ) : (
                    recent.signups.map((user) => (
                      <tr key={user.uid}>
                        <Td sticky>
                          <Link
                            href={`/admin/users/${user.uid}`}
                            className="font-medium text-brand-700 hover:text-brand-800"
                          >
                            {user.email || shortId(user.uid)}
                          </Link>
                        </Td>
                        <Td>
                          <PlanBadge
                            planId={user.entitlement.plan}
                            label={getPlan(user.entitlement.plan).name}
                          />
                        </Td>
                        <Td align="right">{user.cvCount}</Td>
                        <Td align="right" className="whitespace-nowrap text-ink-600">
                          {formatRelativeTime(user.createdAt)}
                        </Td>
                      </tr>
                    ))
                  )}
                </tbody>
              </AdminTable>
            </Panel>

            <Panel
              title="Latest payments"
              description="The 10 most recent orders, whatever their status."
              bodyClassName="p-0"
              action={
                <Link
                  href="/admin/payments"
                  className="text-sm font-semibold text-brand-700 hover:text-brand-800"
                >
                  Full ledger
                </Link>
              }
            >
              <AdminTable minWidth={560}>
                <thead>
                  <tr>
                    <Th sticky>Order</Th>
                    <Th>Plan</Th>
                    <Th align="right">Amount</Th>
                    <Th>Status</Th>
                    <Th align="right">Created</Th>
                  </tr>
                </thead>
                <tbody>
                  {recent.payments.length === 0 ? (
                    <TableEmptyRow colSpan={5}>
                      No orders have been created yet. They appear here as soon as a
                      checkout starts.
                    </TableEmptyRow>
                  ) : (
                    recent.payments.slice(0, 10).map((payment) => (
                      <tr key={`${payment.userId}-${payment.id}`}>
                        <Td sticky>
                          <span className="font-mono text-xs" title={payment.providerOrderId}>
                            {shortId(payment.providerOrderId)}
                          </span>
                        </Td>
                        <Td>{getPlan(payment.planId).name}</Td>
                        <Td align="right">
                          {payment.amount} {payment.currency}
                        </Td>
                        <Td>
                          <PaymentStatusBadge status={payment.status} />
                        </Td>
                        <Td align="right" className="whitespace-nowrap text-ink-600">
                          {formatDateTime(payment.createdAt)}
                        </Td>
                      </tr>
                    ))
                  )}
                </tbody>
              </AdminTable>
            </Panel>
          </div>
        </>
      ) : (
        <AdminDataAlert
          configured={activity.configured}
          error={activity.error}
          what="Recent activity"
        />
      )}
    </div>
  );
}
