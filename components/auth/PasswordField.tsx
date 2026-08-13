'use client';

import { useState } from 'react';

import { Field, Input } from '@/components/ui/form';

/**
 * A password input with a show/hide toggle.
 *
 * The toggle is a real button with an `aria-label` that states the *action* and
 * `aria-pressed` that states the current state, so a screen-reader user is told both
 * "Show password" and whether the password is currently revealed. It never renders as an
 * icon-only control without a name.
 */
export function PasswordField({
  label = 'Password',
  value,
  onChange,
  error,
  hint,
  autoComplete,
  disabled = false,
  required = true,
  autoFocus = false,
  name,
  describedBy,
}: {
  label?: string;
  value: string;
  onChange: (next: string) => void;
  error?: string;
  hint?: string;
  /** `current-password` when signing in, `new-password` when choosing one. */
  autoComplete: 'current-password' | 'new-password';
  disabled?: boolean;
  required?: boolean;
  autoFocus?: boolean;
  name: string;
  /** Extra element id to associate — the strength meter, for instance. */
  describedBy?: string;
}) {
  const [visible, setVisible] = useState(false);
  const action = visible ? 'Hide password' : 'Show password';

  return (
    <Field label={label} error={error} hint={hint} required={required}>
      {({ id, describedBy: fieldDescribedBy, invalid }) => (
        <div className="relative">
          <Input
            id={id}
            name={name}
            type={visible ? 'text' : 'password'}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            invalid={invalid}
            aria-describedby={[fieldDescribedBy, describedBy].filter(Boolean).join(' ') || undefined}
            autoComplete={autoComplete}
            autoFocus={autoFocus}
            disabled={disabled}
            required={required}
            spellCheck={false}
            autoCapitalize="off"
            className="pr-11"
          />
          <button
            type="button"
            onClick={() => setVisible((current) => !current)}
            disabled={disabled}
            aria-label={action}
            aria-pressed={visible}
            aria-controls={id}
            title={action}
            className={
              'absolute inset-y-px right-px grid w-10 place-items-center rounded-r-lg text-ink-500 ' +
              'transition-colors hover:text-ink-900 disabled:cursor-not-allowed disabled:text-ink-400 ' +
              'focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-brand-600'
            }
          >
            {visible ? <EyeOffIcon /> : <EyeIcon />}
          </button>
        </div>
      )}
    </Field>
  );
}

function EyeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <path
        d="M2.6 12s3.4-6.2 9.4-6.2S21.4 12 21.4 12s-3.4 6.2-9.4 6.2S2.6 12 2.6 12Z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="2.8" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <path
        d="M9.9 5.9A9.7 9.7 0 0 1 12 5.8c6 0 9.4 6.2 9.4 6.2a17 17 0 0 1-3.2 4.1M6.5 7.6A16.7 16.7 0 0 0 2.6 12S6 18.2 12 18.2a9.6 9.6 0 0 0 4-.85"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M10.1 10.1a2.8 2.8 0 0 0 3.8 3.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="m4 4 16 16" strokeLinecap="round" />
    </svg>
  );
}
