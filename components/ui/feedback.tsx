import type { HTMLAttributes, ReactNode } from 'react';

import { cn } from '@/lib/utils/cn';

/* -------------------------------------------------------------------------- */
/* Badge                                                                       */
/* -------------------------------------------------------------------------- */

export type BadgeTone = 'neutral' | 'brand' | 'success' | 'warning' | 'danger' | 'accent';

const badgeTones: Record<BadgeTone, string> = {
  neutral: 'bg-ink-100 text-ink-700 ring-ink-200',
  brand: 'bg-brand-50 text-brand-700 ring-brand-200',
  success: 'bg-success-50 text-success-700 ring-success-500/25',
  warning: 'bg-warning-50 text-warning-700 ring-warning-500/25',
  danger: 'bg-danger-50 text-danger-700 ring-danger-500/25',
  accent: 'bg-accent-50 text-accent-700 ring-accent-300',
};

export function Badge({
  tone = 'neutral',
  className,
  children,
  ...props
}: HTMLAttributes<HTMLSpanElement> & { tone?: BadgeTone }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-2xs font-semibold ring-1 ring-inset',
        badgeTones[tone],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/* Alert                                                                       */
/* -------------------------------------------------------------------------- */

export type AlertTone = 'info' | 'success' | 'warning' | 'danger';

const alertTones: Record<AlertTone, { wrap: string; icon: string; path: ReactNode }> = {
  info: {
    wrap: 'border-brand-200 bg-brand-50 text-brand-900',
    icon: 'text-brand-600',
    path: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 11v5M12 8v.3" strokeLinecap="round" />
      </>
    ),
  },
  success: {
    wrap: 'border-success-500/25 bg-success-50 text-success-700',
    icon: 'text-success-600',
    path: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="m8.5 12.3 2.4 2.4 4.6-4.9" strokeLinecap="round" strokeLinejoin="round" />
      </>
    ),
  },
  warning: {
    wrap: 'border-warning-500/30 bg-warning-50 text-warning-700',
    icon: 'text-warning-600',
    path: (
      <>
        <path d="M10.3 3.9 2.4 17.5A2 2 0 0 0 4.1 20.5h15.8a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
        <path d="M12 9.5v4M12 16.7v.3" strokeLinecap="round" />
      </>
    ),
  },
  danger: {
    wrap: 'border-danger-500/25 bg-danger-50 text-danger-700',
    icon: 'text-danger-600',
    path: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="m15 9-6 6M9 9l6 6" strokeLinecap="round" />
      </>
    ),
  },
};

export function Alert({
  tone = 'info',
  title,
  children,
  className,
  action,
}: {
  tone?: AlertTone;
  title?: string;
  children?: ReactNode;
  className?: string;
  action?: ReactNode;
}) {
  const config = alertTones[tone];
  return (
    <div
      role={tone === 'danger' ? 'alert' : 'status'}
      className={cn('flex gap-3 rounded-xl border p-4', config.wrap, className)}
    >
      <svg
        className={cn('mt-0.5 size-[18px] shrink-0', config.icon)}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        aria-hidden
      >
        {config.path}
      </svg>
      <div className="min-w-0 flex-1 text-sm leading-relaxed">
        {title ? <p className="font-semibold">{title}</p> : null}
        {children ? <div className={cn(title && 'mt-0.5 opacity-90')}>{children}</div> : null}
      </div>
      {action ? <div className="shrink-0 self-center">{action}</div> : null}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Skeletons                                                                   */
/* -------------------------------------------------------------------------- */

export function Skeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('skeleton', className)} aria-hidden {...props} />;
}

export function SkeletonText({ lines = 3, className }: { lines?: number; className?: string }) {
  return (
    <div className={cn('flex flex-col gap-2', className)} aria-hidden>
      {Array.from({ length: lines }, (_, index) => (
        <Skeleton
          key={index}
          className="h-3.5"
          style={{ width: index === lines - 1 ? '62%' : '100%' }}
        />
      ))}
    </div>
  );
}

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn('rounded-xl border border-ink-200 bg-white p-4', className)} aria-hidden>
      <Skeleton className="mb-4 aspect-[210/297] w-full rounded-lg" />
      <Skeleton className="mb-2 h-4 w-3/5" />
      <Skeleton className="h-3 w-2/5" />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Empty state                                                                 */
/* -------------------------------------------------------------------------- */

export function EmptyState({
  icon,
  title,
  description,
  action,
  secondaryAction,
  className,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  secondaryAction?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-xl border border-dashed border-ink-200 bg-ink-50/60 px-6 py-14 text-center',
        className,
      )}
    >
      {icon ? (
        <div className="mb-4 grid size-12 place-items-center rounded-full bg-white text-brand-600 shadow-sm ring-1 ring-ink-200">
          {icon}
        </div>
      ) : null}
      <h3 className="text-base font-semibold text-ink-950">{title}</h3>
      {description ? (
        <p className="mt-1.5 max-w-md text-sm leading-relaxed text-ink-600">{description}</p>
      ) : null}
      {action || secondaryAction ? (
        <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
          {action}
          {secondaryAction}
        </div>
      ) : null}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Progress                                                                    */
/* -------------------------------------------------------------------------- */

export function ProgressBar({
  value,
  label,
  tone = 'brand',
  className,
  showValue = true,
}: {
  value: number;
  label?: string;
  tone?: 'brand' | 'success' | 'warning';
  className?: string;
  showValue?: boolean;
}) {
  const clamped = Math.max(0, Math.min(100, Math.round(value)));
  const fill =
    tone === 'success' ? 'bg-success-500' : tone === 'warning' ? 'bg-warning-500' : 'bg-brand-600';

  return (
    <div className={className}>
      {label || showValue ? (
        <div className="mb-1.5 flex items-center justify-between text-xs">
          {label ? <span className="font-medium text-ink-700">{label}</span> : <span />}
          {showValue ? <span className="font-mono text-ink-600">{clamped}%</span> : null}
        </div>
      ) : null}
      <div
        className="h-2 overflow-hidden rounded-full bg-ink-200"
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label ?? 'Progress'}
      >
        <div
          className={cn('h-full rounded-full transition-[width] duration-500', fill)}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}
