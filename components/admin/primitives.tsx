import type { ReactNode } from 'react';

import { Alert } from '@/components/ui/feedback';
import { Badge, type BadgeTone } from '@/components/ui/feedback';
import { cn } from '@/lib/utils/cn';
import type { PaymentStatus } from '@/types/payment';
import type { PlanId, SubscriptionStatus } from '@/types/user';

/**
 * Presentational building blocks shared by the admin console.
 *
 * Nothing here touches Firestore or holds state — the pages stay readable and every
 * table in the console gets the same overflow behaviour, empty state and typography.
 */

/* -------------------------------------------------------------------------- */
/* Page chrome                                                                 */
/* -------------------------------------------------------------------------- */

export function AdminPageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div className="min-w-0">
        <h1 className="font-display text-2xl font-bold tracking-tight text-ink-950">{title}</h1>
        {description ? (
          <p className="mt-1.5 max-w-3xl text-sm leading-relaxed text-ink-600">{description}</p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Numbers                                                                     */
/* -------------------------------------------------------------------------- */

/** `1,284` · `12.9K` · `3.4M` — compact above ten thousand, exact below it. */
export function formatCount(value: number): string {
  if (!Number.isFinite(value)) return '—';
  const absolute = Math.abs(value);
  if (absolute >= 1_000_000) return `${trimZero(value / 1_000_000)}M`;
  if (absolute >= 10_000) return `${trimZero(value / 1_000)}K`;
  return new Intl.NumberFormat('en').format(value);
}

function trimZero(value: number): string {
  return value.toFixed(1).replace(/\.0$/, '');
}

export function formatMoney(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat('en', {
      style: 'currency',
      currency,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    // An unrecognised ISO code must not take the page down.
    return `${amount.toFixed(2)} ${currency}`;
  }
}

/** Shortens an opaque identifier for a table cell, keeping both ends recognisable. */
export function shortId(value: string, keep = 8): string {
  if (value.length <= keep * 2 + 1) return value;
  return `${value.slice(0, keep)}…${value.slice(-4)}`;
}

/* -------------------------------------------------------------------------- */
/* Stat tiles                                                                  */
/* -------------------------------------------------------------------------- */

export function StatTile({
  label,
  value,
  hint,
  footer,
}: {
  label: string;
  value: string;
  hint?: string;
  footer?: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-ink-200 bg-white p-4 shadow-card">
      <p className="text-2xs font-semibold tracking-wide text-ink-500 uppercase">{label}</p>
      <p className="mt-2 text-3xl leading-none font-semibold text-ink-950">{value}</p>
      {hint ? <p className="mt-2 text-xs leading-relaxed text-ink-500">{hint}</p> : null}
      {footer ? <div className="mt-3">{footer}</div> : null}
    </div>
  );
}

export function StatTileGrid({ children }: { children: ReactNode }) {
  return <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{children}</div>;
}

/* -------------------------------------------------------------------------- */
/* Sparkline                                                                   */
/* -------------------------------------------------------------------------- */

export interface SparkPoint {
  label: string;
  value: number;
}

/**
 * A single-series trend drawn as inline SVG — no charting library, no client JavaScript.
 *
 * Marks follow the house chart specs: a 2px line over a 10%-opacity wash of the same
 * hue, a marker on the most recent point in the accent colour with a 2px surface ring so
 * it stays legible where it sits on the line. Each bucket carries an invisible hit area
 * with a `<title>`, which gives a native hover tooltip without shipping any JS.
 */
export function Sparkline({
  points,
  ariaLabel,
  width = 320,
  height = 56,
}: {
  points: SparkPoint[];
  ariaLabel: string;
  width?: number;
  height?: number;
}) {
  if (points.length < 2) return null;

  const inset = 5;
  const max = Math.max(...points.map((point) => point.value), 1);
  const stepX = (width - inset * 2) / (points.length - 1);
  const x = (index: number) => inset + index * stepX;
  const y = (value: number) => inset + (1 - value / max) * (height - inset * 2);

  const path = points
    .map((point, index) => `${index === 0 ? 'M' : 'L'}${x(index).toFixed(1)} ${y(point.value).toFixed(1)}`)
    .join(' ');
  const area = `${path} L${x(points.length - 1).toFixed(1)} ${height} L${x(0).toFixed(1)} ${height} Z`;

  const lastIndex = points.length - 1;
  const last = points[lastIndex]!;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width="100%"
      height={height}
      role="img"
      aria-label={ariaLabel}
      className="block overflow-visible"
      preserveAspectRatio="none"
    >
      <title>{ariaLabel}</title>
      <path d={area} fill="var(--color-brand-600)" fillOpacity="0.1" />
      <path
        d={path}
        fill="none"
        stroke="var(--color-brand-600)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
      <circle
        cx={x(lastIndex)}
        cy={y(last.value)}
        r="4"
        fill="var(--color-accent-500)"
        stroke="#ffffff"
        strokeWidth="2"
      />
      {points.map((point, index) => (
        <rect
          key={point.label}
          x={x(index) - stepX / 2}
          y={0}
          width={stepX}
          height={height}
          fill="transparent"
        >
          <title>{`${point.label}: ${point.value}`}</title>
        </rect>
      ))}
    </svg>
  );
}

/* -------------------------------------------------------------------------- */
/* Share bar                                                                   */
/* -------------------------------------------------------------------------- */

export interface ShareSegment {
  label: string;
  value: number;
  /** CSS colour for the mark. Text never wears it — the swatch carries identity. */
  color: string;
}

/**
 * A part-to-whole row: one stacked bar plus a legend that always names every segment,
 * so identity is never carried by colour alone.
 */
export function ShareBar({ segments, total }: { segments: ShareSegment[]; total: number }) {
  if (total <= 0) {
    return (
      <p className="text-sm text-ink-500">
        Nothing to split yet — no accounts have been created.
      </p>
    );
  }

  return (
    <div>
      <div className="flex h-3 w-full gap-[2px] overflow-hidden rounded-full bg-ink-100">
        {segments
          .filter((segment) => segment.value > 0)
          .map((segment) => (
            <div
              key={segment.label}
              style={{
                width: `${(segment.value / total) * 100}%`,
                backgroundColor: segment.color,
              }}
            />
          ))}
      </div>
      <ul className="mt-4 grid gap-2 sm:grid-cols-2">
        {segments.map((segment) => (
          <li key={segment.label} className="flex items-center gap-2 text-sm">
            <span
              aria-hidden
              className="size-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: segment.color }}
            />
            <span className="text-ink-700">{segment.label}</span>
            <span className="ml-auto tabular-nums text-ink-950">
              {formatCount(segment.value)}
            </span>
            <span className="w-12 text-right tabular-nums text-ink-500">
              {total > 0 ? `${Math.round((segment.value / total) * 100)}%` : '—'}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Tables                                                                      */
/* -------------------------------------------------------------------------- */

/**
 * Horizontal-scroll wrapper. Admin tables are wide by nature; on a narrow screen the
 * first column stays pinned so a row never loses the name it belongs to.
 */
export function AdminTable({
  children,
  minWidth = 880,
  className,
}: {
  children: ReactNode;
  minWidth?: number;
  className?: string;
}) {
  return (
    <div className={cn('overflow-x-auto overscroll-x-contain', className)}>
      <table
        className="w-full border-separate border-spacing-0 text-left text-sm"
        style={{ minWidth }}
      >
        {children}
      </table>
    </div>
  );
}

const stickyShadow = 'shadow-[1px_0_0_0_var(--color-ink-200)]';

export function Th({
  children,
  sticky = false,
  align = 'left',
  ariaSort,
  className,
}: {
  children?: ReactNode;
  sticky?: boolean;
  align?: 'left' | 'right';
  ariaSort?: 'ascending' | 'descending' | 'none';
  className?: string;
}) {
  return (
    <th
      scope="col"
      aria-sort={ariaSort}
      className={cn(
        'border-b border-ink-200 bg-ink-50 px-3 py-2.5 text-2xs font-semibold tracking-wide whitespace-nowrap text-ink-600 uppercase',
        align === 'right' && 'text-right',
        sticky && cn('sticky left-0 z-20', stickyShadow),
        className,
      )}
    >
      {children}
    </th>
  );
}

export function Td({
  children,
  sticky = false,
  align = 'left',
  className,
}: {
  children?: ReactNode;
  sticky?: boolean;
  align?: 'left' | 'right';
  className?: string;
}) {
  return (
    <td
      className={cn(
        'border-b border-ink-100 px-3 py-2.5 align-middle text-ink-800',
        align === 'right' && 'text-right tabular-nums',
        sticky && cn('sticky left-0 z-10 bg-white', stickyShadow),
        className,
      )}
    >
      {children}
    </td>
  );
}

/** A full-width row used when a table has no data to show. */
export function TableEmptyRow({ colSpan, children }: { colSpan: number; children: ReactNode }) {
  return (
    <tr>
      <td colSpan={colSpan} className="border-b border-ink-100 px-3 py-10 text-center">
        <p className="text-sm text-ink-600">{children}</p>
      </td>
    </tr>
  );
}

/* -------------------------------------------------------------------------- */
/* Key/value list                                                              */
/* -------------------------------------------------------------------------- */

export function KeyValueList({ rows }: { rows: { label: string; value: ReactNode }[] }) {
  return (
    <dl className="divide-y divide-ink-100">
      {rows.map((row) => (
        <div key={row.label} className="flex flex-wrap items-baseline gap-x-4 gap-y-1 py-2.5">
          <dt className="w-44 shrink-0 text-xs font-semibold tracking-wide text-ink-500 uppercase">
            {row.label}
          </dt>
          <dd className="min-w-0 flex-1 text-sm break-words text-ink-800">{row.value}</dd>
        </div>
      ))}
    </dl>
  );
}

/* -------------------------------------------------------------------------- */
/* Badges                                                                      */
/* -------------------------------------------------------------------------- */

const planTones: Record<PlanId, BadgeTone> = {
  free: 'neutral',
  pro: 'brand',
  lifetime: 'accent',
};

export function PlanBadge({ planId, label }: { planId: PlanId; label: string }) {
  return <Badge tone={planTones[planId]}>{label}</Badge>;
}

const subscriptionTones: Record<SubscriptionStatus, BadgeTone> = {
  none: 'neutral',
  active: 'success',
  pending: 'warning',
  expired: 'warning',
  cancelled: 'danger',
};

export function SubscriptionBadge({ status }: { status: SubscriptionStatus }) {
  return <Badge tone={subscriptionTones[status]}>{status}</Badge>;
}

const paymentTones: Record<PaymentStatus, BadgeTone> = {
  created: 'neutral',
  approved: 'brand',
  completed: 'success',
  failed: 'danger',
  cancelled: 'neutral',
  refunded: 'warning',
};

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  return <Badge tone={paymentTones[status]}>{status}</Badge>;
}

/* -------------------------------------------------------------------------- */
/* Data-load failure states                                                    */
/* -------------------------------------------------------------------------- */

/**
 * Rendered in place of a panel whose data could not be read. The console must stay
 * usable — and explain itself — when Firebase Admin is missing or a query fails.
 */
export function AdminDataAlert({
  configured,
  error,
  what,
}: {
  configured: boolean;
  error: string | null;
  what: string;
}) {
  if (!configured) {
    return (
      <Alert tone="warning" title="Firebase Admin is not configured">
        <p>
          {what} cannot be read because this deployment has no service-account credentials.
          Set <Env>FIREBASE_PROJECT_ID</Env>, <Env>FIREBASE_CLIENT_EMAIL</Env> and{' '}
          <Env>FIREBASE_PRIVATE_KEY</Env> — or a single <Env>FIREBASE_SERVICE_ACCOUNT_JSON</Env> —
          then restart the server.
        </p>
      </Alert>
    );
  }

  return (
    <Alert tone="danger" title={`${what} could not be loaded`}>
      <p>
        Firestore returned an error. The full stack trace is in the server log.
        {error ? (
          <>
            {' '}
            <span className="font-mono text-xs break-words">{error}</span>
          </>
        ) : null}
      </p>
    </Alert>
  );
}

/** Inline environment-variable name. Never renders a value — only the key. */
export function Env({ children }: { children: ReactNode }) {
  return (
    <code className="rounded bg-ink-100 px-1 py-0.5 font-mono text-[0.8em] text-ink-800">
      {children}
    </code>
  );
}
