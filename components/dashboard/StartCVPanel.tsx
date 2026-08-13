'use client';

import { FilePlus2, LayoutTemplate, Sparkles } from 'lucide-react';
import Link from 'next/link';

import { Spinner } from '@/components/ui/button';
import { useCreateCV } from './create-cv';
import { cn } from '@/lib/utils/cn';

/**
 * The three ways to start a CV, on the overview.
 *
 * Blank and worked-example create the document immediately and open the editor; the
 * third hands over to the full flow at `/dashboard/cvs/new` where the template picker
 * lives. Disabled while a creation is in flight so a double tap cannot burn two of a
 * free plan's two CV slots.
 */
export function StartCVPanel({
  atCvLimit,
  className,
}: {
  /** Free plans that are already at their CV quota. */
  atCvLimit: boolean;
  className?: string;
}) {
  const { create, creating } = useCreateCV();

  const tileClasses = cn(
    'group flex flex-col items-start gap-2 rounded-xl border border-ink-200 bg-white p-4 text-left transition-all duration-200',
    'hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-card-hover',
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600',
    'disabled:pointer-events-none disabled:opacity-55',
  );

  return (
    <div className={cn('grid gap-3 sm:grid-cols-3', className)}>
      <button
        type="button"
        className={tileClasses}
        disabled={creating || atCvLimit}
        onClick={() => void create({ starter: 'blank' })}
      >
        <span className="grid size-9 place-items-center rounded-lg bg-brand-50 text-brand-600">
          {creating ? <Spinner size={16} /> : <FilePlus2 size={18} aria-hidden />}
        </span>
        <span className="text-sm font-semibold text-ink-950">Start blank</span>
        <span className="text-xs leading-relaxed text-ink-600">
          An empty CV in your default template. Fastest if you already know what to write.
        </span>
      </button>

      <button
        type="button"
        className={tileClasses}
        disabled={creating || atCvLimit}
        onClick={() => void create({ starter: 'sample' })}
      >
        <span className="grid size-9 place-items-center rounded-lg bg-accent-50 text-accent-600">
          {creating ? <Spinner size={16} /> : <Sparkles size={18} aria-hidden />}
        </span>
        <span className="text-sm font-semibold text-ink-950">Use a worked example</span>
        <span className="text-xs leading-relaxed text-ink-600">
          A complete, realistic CV you edit down to your own history.
        </span>
      </button>

      <Link
        href="/dashboard/cvs/new"
        className={cn(tileClasses, atCvLimit && 'pointer-events-none opacity-55')}
        aria-disabled={atCvLimit || undefined}
      >
        <span className="grid size-9 place-items-center rounded-lg bg-ink-100 text-ink-700">
          <LayoutTemplate size={18} aria-hidden />
        </span>
        <span className="text-sm font-semibold text-ink-950">Pick a template first</span>
        <span className="text-xs leading-relaxed text-ink-600">
          Browse every design, filter by style, then start from the one you like.
        </span>
      </Link>
    </div>
  );
}
