import type { ReactNode } from 'react';

import { ProgressBar } from '@/components/ui/feedback';
import { cn } from '@/lib/utils/cn';

/**
 * One number on the overview.
 *
 * A tile with a quota shows the meter and the remaining allowance *before* the user hits
 * it, which is the whole point: a limit discovered at the moment it blocks you is a bug
 * in the interface, not a feature of the plan.
 */
export function StatTile({
  label,
  value,
  hint,
  icon,
  meter,
  className,
}: {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  icon?: ReactNode;
  /** Omit for an unmetered figure such as the plan name. */
  meter?: { used: number; limit: number | null };
  className?: string;
}) {
  const percent =
    meter && meter.limit !== null && meter.limit > 0
      ? Math.min(100, Math.round((meter.used / meter.limit) * 100))
      : null;

  const tone = percent === null ? 'brand' : percent >= 100 ? 'warning' : percent >= 75 ? 'warning' : 'brand';

  return (
    <div className={cn('rounded-xl border border-ink-200 bg-white p-4 shadow-card', className)}>
      <div className="flex items-center gap-2">
        {icon ? <span className="text-ink-400">{icon}</span> : null}
        <p className="text-xs font-semibold tracking-wide text-ink-500 uppercase">{label}</p>
      </div>

      <p className="mt-2 font-display text-2xl font-extrabold tracking-tight text-ink-950">
        {value}
      </p>

      {percent !== null ? (
        <ProgressBar value={percent} tone={tone} showValue={false} className="mt-3" />
      ) : null}

      {hint ? <p className="mt-2 text-xs leading-relaxed text-ink-500">{hint}</p> : null}
    </div>
  );
}
