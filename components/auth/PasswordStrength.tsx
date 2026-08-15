import type { AppCopy } from '@/lib/i18n/app-copy';
import { cn } from '@/lib/utils/cn';

/**
 * A live password strength meter.
 *
 * Four independent requirements, not an opaque score: a person can see exactly what is
 * still missing and fix it. Only the summary sentence lives in an `aria-live` region, so
 * a screen reader is told "Fair — still missing a number and a symbol" when the state
 * actually changes, instead of being interrupted on every keystroke.
 *
 * The strings arrive as a prop rather than from `useCopy()`, which would need this file
 * to be a client module and would make the exported `passwordChecks` unusable from the
 * server. The rules themselves are language-independent; only their names are not.
 */

export interface PasswordCheck {
  id: 'length' | 'case' | 'digit' | 'symbol';
  /** Rendered in the checklist. */
  label: string;
  /** Used inside the spoken summary, e.g. "still missing a number". */
  missingLabel: string;
  met: boolean;
}

export function passwordChecks(password: string, copy: AppCopy): PasswordCheck[] {
  return [
    {
      id: 'length',
      label: copy.auth.checkLength,
      missingLabel: copy.auth.checkLengthMissing,
      met: password.length >= 8,
    },
    {
      id: 'case',
      label: copy.auth.checkCase,
      missingLabel: copy.auth.checkCaseMissing,
      met: /[a-z]/.test(password) && /[A-Z]/.test(password),
    },
    {
      id: 'digit',
      label: copy.auth.checkDigit,
      missingLabel: copy.auth.checkDigitMissing,
      met: /\d/.test(password),
    },
    {
      id: 'symbol',
      label: copy.auth.checkSymbol,
      missingLabel: copy.auth.checkSymbolMissing,
      met: /[^A-Za-z0-9]/.test(password),
    },
  ];
}

/** Colour per met-requirement count. The label for each band comes from the copy table. */
const LEVELS = [
  { bar: 'bg-danger-500', text: 'text-danger-600' },
  { bar: 'bg-danger-500', text: 'text-danger-600' },
  { bar: 'bg-warning-500', text: 'text-warning-700' },
  { bar: 'bg-brand-500', text: 'text-brand-700' },
  { bar: 'bg-success-500', text: 'text-success-700' },
] as const;

function listMissing(labels: string[], and: string): string {
  if (labels.length <= 1) return labels[0] ?? '';
  return `${labels.slice(0, -1).join(', ')} ${and} ${labels[labels.length - 1]}`;
}

export function PasswordStrength({
  password,
  copy,
  id,
  className,
}: {
  password: string;
  copy: AppCopy;
  /** So the password input can point `aria-describedby` here. */
  id?: string;
  className?: string;
}) {
  const checks = passwordChecks(password, copy);
  const met = checks.filter((check) => check.met).length;
  const score = password.length === 0 ? 0 : met;
  const level = LEVELS[score] ?? LEVELS[0];
  const missing = checks.filter((check) => !check.met).map((check) => check.missingLabel);

  const labels = [
    copy.auth.passwordStrengthTooShort,
    copy.auth.passwordStrengthWeak,
    copy.auth.passwordStrengthFair,
    copy.auth.passwordStrengthGood,
    copy.auth.passwordStrengthStrong,
  ] as const;
  const levelLabel = labels[score] ?? labels[0];

  const summary =
    password.length === 0
      ? copy.auth.passwordStrengthEmpty
      : `${copy.auth.passwordStrengthSummary(levelLabel)} ${
          missing.length
            ? copy.auth.passwordStrengthMissing(listMissing(missing, copy.auth.listAnd))
            : copy.auth.passwordStrengthAllMet
        }`;

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
        <span
          className={cn(
            'w-16 text-right text-xs font-semibold',
            password ? level.text : 'text-ink-400',
          )}
          aria-hidden
        >
          {password ? levelLabel : '—'}
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
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                aria-hidden
              >
                <path d="m5 12.5 4.5 4.5L19 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            ) : (
              <span className="grid size-[13px] place-items-center" aria-hidden>
                <span className="size-1.5 rounded-full bg-ink-300" />
              </span>
            )}
            {check.label}
            <span className="sr-only">{` ${check.met ? copy.auth.checkMet : copy.auth.checkNotMet}`}</span>
          </li>
        ))}
      </ul>

      <p className="sr-only" aria-live="polite">
        {summary}
      </p>
    </div>
  );
}
