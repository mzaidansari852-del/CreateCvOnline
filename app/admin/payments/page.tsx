import type { Metadata } from 'next';
import Link from 'next/link';

import {
  AdminDataAlert,
  AdminPageHeader,
  AdminTable,
  PaymentStatusBadge,
  TableEmptyRow,
  Td,
  Th,
  formatMoney,
  shortId,
} from '@/components/admin/primitives';
import { PaymentActions } from '@/components/admin/PaymentActions';
import { loadAdmin } from '@/components/admin/data';
import { Alert } from '@/components/ui/feedback';
import { Card } from '@/components/ui/card';
import { listAllPayments } from '@/lib/db/payments';
import { formatDateTime } from '@/lib/cv/format';
import { getPlan } from '@/lib/plans';
import { privateMetadata } from '@/lib/seo/metadata';
import { cn } from '@/lib/utils/cn';
import { paymentStatusSchema, type PaymentStatus } from '@/types/payment';

export const metadata: Metadata = privateMetadata(
  'Payments',
  'The payment ledger and refund bookkeeping.',
);

const LEDGER_LIMIT = 200;

function first(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? '';
  return value ?? '';
}

export default async function AdminPaymentsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const query = await searchParams;
  const parsed = paymentStatusSchema.safeParse(first(query.status));
  const statusFilter: PaymentStatus | null = parsed.success ? parsed.data : null;

  const result = await loadAdmin(() => listAllPayments(LEDGER_LIMIT));
  const all = result.data ?? [];
  const rows = statusFilter ? all.filter((payment) => payment.status === statusFilter) : all;

  const totals = new Map<string, number>();
  for (const payment of rows) {
    if (payment.status !== 'completed') continue;
    const amount = Number.parseFloat(payment.amount);
    if (!Number.isFinite(amount)) continue;
    totals.set(payment.currency, (totals.get(payment.currency) ?? 0) + amount);
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Payments"
        description={`The ${LEDGER_LIMIT} most recent orders across every account, newest first. An order is written the moment checkout starts, so rows with status “created” are abandoned carts rather than failures.`}
      />

      <Alert tone="warning" title="Refunds here are bookkeeping only">
        <p>
          Marking an order as refunded rewrites the status on our ledger document. It does
          not call Paddle, no money moves, and the customer is not notified. Issue the actual
          refund in the Paddle dashboard, then record it here so the two agree. Changing the
          status also leaves the account&rsquo;s plan alone — end access from the user&rsquo;s
          page if that is part of the refund.
        </p>
      </Alert>

      <Card className="p-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-1 text-sm font-medium text-ink-700">Status</span>
          <FilterChip label="All" href="/admin/payments" active={statusFilter === null} />
          {paymentStatusSchema.options.map((status) => (
            <FilterChip
              key={status}
              label={status}
              href={`/admin/payments?status=${status}`}
              active={statusFilter === status}
            />
          ))}
        </div>
        {totals.size > 0 ? (
          <p className="mt-3 text-xs text-ink-500">
            Completed in this view:{' '}
            {Array.from(totals, ([currency, amount]) => formatMoney(amount, currency)).join(' · ')}
          </p>
        ) : null}
      </Card>

      {result.data ? (
        <Card>
          <AdminTable minWidth={1100}>
            <thead>
              <tr>
                <Th sticky>Order id</Th>
                <Th>User</Th>
                <Th>Plan</Th>
                <Th align="right">Amount</Th>
                <Th>Currency</Th>
                <Th>Status</Th>
                <Th align="right">Created</Th>
                <Th align="right">Action</Th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <TableEmptyRow colSpan={8}>
                  {statusFilter
                    ? `No order in the last ${LEDGER_LIMIT} has status “${statusFilter}”.`
                    : 'No orders have been recorded yet. The first checkout will appear here.'}
                </TableEmptyRow>
              ) : (
                rows.map((payment) => (
                  <tr key={`${payment.userId}-${payment.id}`}>
                    <Td sticky>
                      <span className="font-mono text-xs" title={payment.providerOrderId}>
                        {payment.providerOrderId}
                      </span>
                    </Td>
                    <Td>
                      {payment.userId ? (
                        <Link
                          href={`/admin/users/${payment.userId}`}
                          className="font-mono text-xs text-brand-700 hover:text-brand-800"
                          title={payment.userId}
                        >
                          {shortId(payment.userId, 10)}
                        </Link>
                      ) : (
                        <span className="text-ink-500">Unknown</span>
                      )}
                      {payment.payerEmail ? (
                        <span className="mt-0.5 block max-w-56 truncate text-2xs text-ink-500">
                          {payment.payerEmail}
                        </span>
                      ) : null}
                    </Td>
                    <Td>{getPlan(payment.planId).name}</Td>
                    <Td align="right">{payment.amount}</Td>
                    <Td>{payment.currency}</Td>
                    <Td>
                      <PaymentStatusBadge status={payment.status} />
                    </Td>
                    <Td align="right" className="whitespace-nowrap text-ink-600">
                      {formatDateTime(payment.createdAt)}
                    </Td>
                    <Td align="right">
                      <PaymentActions
                        orderId={payment.id}
                        userId={payment.userId}
                        status={payment.status}
                        amount={payment.amount}
                        currency={payment.currency}
                      />
                    </Td>
                  </tr>
                ))
              )}
            </tbody>
          </AdminTable>

          <p className="border-t border-ink-100 px-4 py-3 text-xs text-ink-500">
            Showing {rows.length} of the {all.length} most recent orders. Filtering happens
            over that window, not the whole collection, so an old order will not appear here
            even if its status matches.
          </p>
        </Card>
      ) : (
        <AdminDataAlert
          configured={result.configured}
          error={result.error}
          what="The payment ledger"
        />
      )}
    </div>
  );
}

function FilterChip({
  label,
  href,
  active,
}: {
  label: string;
  href: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? 'true' : undefined}
      className={cn(
        'rounded-full border px-3 py-1 text-xs font-semibold capitalize transition-colors',
        active
          ? 'border-ink-900 bg-ink-900 text-white'
          : 'border-ink-200 text-ink-700 hover:bg-ink-50',
      )}
    >
      {label}
    </Link>
  );
}
