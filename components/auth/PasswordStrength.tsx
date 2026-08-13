import { cn } from '@/lib/utils/cn';

/**
 * A live password strength meter.
 *
 * Four independent requirements, not an opaque score: a person can see exactly what is
 * still missing and fix it. Only the summary sentence lives in an `aria-live` region, so
 * a screen reader is told "Fair — still missing a number and a symbol" when the state
 * actually changes, instead of being interrupted on every keystroke.
 */

export interface PasswordCheck {
  id: 'length' | 'case' | 'digit' | 'symbol';
  /** Rendered in the checklist. */
  label: string;
  /** Used inside the spoken summary, e.g. "still missing a number". */
  missingLabel: string;
  met: boolean;
}

export function passwordChecks(password: string): PasswordCheck[] {
  return [
    {
      id: 'length',
      label: 'At least 8 characters',
      missingLabel: '8 characters',
      met: password.length >= 8,
    },
    {
      id: 'case',
      label: 'Upper and lower case',
      missingLabel: 'an upper-case and a lower-case letter',
      met: /[a-z]/.test(password) && /[A-Z]/.test(password),
    },
    { id: 'digit', label: 'A number', missingLabel: 'a number', met: /\d/.test(password) },
    {
      id: 'symbol',
      label: 'A symbol (!, ?, £…)',
      missingLabel: 'a symbol',
      met: /[^A-Za-z0-9]/.test(password),
    },
  ];
}

const LEVELS = [
  { label: 'Too short', bar: 'bg-danger-500', text: 'text-danger-600' },
  { label: 'Weak', bar: 'bg-danger-500', text: 'text-danger-600' },
  { label: 'Fair', bar: 'bg-warning-500', text: 'text-warning-700' },
  { label: 'Good', bar: 'bg-brand-500', text: 'text-brand-700' },
  { label: 'Strong', bar: 'bg-success-500', text: 'text-success-700' },
] as const;

function listMissing(labels: string[]): string {
  if (labels.length <= 1) return labels[0] ?? '';
  return `${labels.slice(0, -1).join(', ')} and ${labels[labels.length - 1]}`;
}

export function PasswordStrength({
  password,
  id,
  className,
}: {
  password: string;
  /** So the password input can point `aria-describedby` here. */
  id?: string;
  className?: string;
}) {
  const checks = passwordChecks(password);
  const met = checks.filter((check) => check.met).length;
  const score = password.length === 0 ? 0 : met;
  const level = LEVELS[score] ?? LEVELS[0];
  const missing = checks.filter((check) => !check.met).map((check) => check.missingLabel);

  const summary =
    password.length === 0
      ? 'Password strength: nothing typed yet.'
      : `Password strength: ${level.label}.${missing.length ? ` Still missing ${listMissing(missing)}.` : ' All four requirements met.'}`;

  return (
    <div id={id} className={cn('flex flex-col gap-2', className)}>
      <div className="flex items-center gap-3">
        <div className="flex flex-1 gap-1" aria-hidden>
          {[0, 1, 2, 3].map((index) => (
            <span
              key={index}
              className={cn(
                'h-1.5 flex-1 rounded-full transition-colors duration-200',
                index < score ? level.bar : 'bg-ink-200',
              )}
            />
          ))}
        </div>
        <span className={cn('w-16 text-right text-xs font-semibold', password ? level.text : 'text-ink-400')} aria-hidden>
          {password ? level.label : '—'}
        </span>
      </div>

      <ul className="grid grid-cols-2 gap-x-3 gap-y-1">
        {checks.map((check) => (
          <li
            key={check.id}
            className={cn(
              'flex items-center gap-1.5 text-xs transition-colors',
              check.met ? 'text-success-700' : 'text-ink-500',
            )}
          >
            {check.met ? (
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden>
                <path d="m5 12.5 4.5 4.5L19 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            ) : (
              <span className="grid size-[13px] place-items-center" aria-hidden>
                <span className="size-1.5 rounded-full bg-ink-300" />
              </span>
            )}
            {check.label}
            <span className="sr-only">{check.met ? ' — met' : ' — not met'}</span>
          </li>
        ))}
      </ul>

      <p className="sr-only" aria-live="polite">
        {summary}
      </p>
    </div>
  );
}
