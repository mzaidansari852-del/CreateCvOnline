'use client';

import { useId } from 'react';
import type {
  InputHTMLAttributes,
  LabelHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from 'react';

import { cn } from '@/lib/utils/cn';

const controlBase =
  'block w-full rounded-lg border bg-white text-sm text-ink-900 placeholder:text-ink-400 ' +
  'transition-[border-color,box-shadow] duration-150 ' +
  'focus:border-brand-500 focus:ring-4 focus:ring-brand-500/12 focus:outline-none ' +
  'disabled:cursor-not-allowed disabled:bg-ink-50 disabled:text-ink-500';

export function Label({
  className,
  required,
  children,
  ...props
}: LabelHTMLAttributes<HTMLLabelElement> & { required?: boolean }) {
  return (
    <label className={cn('text-sm font-medium text-ink-800', className)} {...props}>
      {children}
      {required ? (
        <span className="ml-0.5 text-danger-600" aria-hidden>
          *
        </span>
      ) : null}
    </label>
  );
}

export function FieldHint({ children }: { children: ReactNode }) {
  return <p className="text-xs leading-relaxed text-ink-500">{children}</p>;
}

export function FieldError({ children }: { children?: ReactNode }) {
  if (!children) return null;
  return (
    <p className="flex items-start gap-1.5 text-xs font-medium text-danger-600" role="alert">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="mt-px shrink-0" aria-hidden>
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
        <path d="M12 7.5v5.5M12 16.2v.3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
      {children}
    </p>
  );
}

export interface FieldProps {
  label?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  className?: string;
  children: (props: { id: string; describedBy: string | undefined; invalid: boolean }) => ReactNode;
}

/**
 * Wires up label / hint / error / aria plumbing once so no form in the app has to
 * remember `aria-describedby` again.
 */
export function Field({ label, hint, error, required, className, children }: FieldProps) {
  const id = useId();
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined;

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {label ? (
        <Label htmlFor={id} required={required}>
          {label}
        </Label>
      ) : null}
      {children({ id, describedBy, invalid: Boolean(error) })}
      {hint && !error ? <span id={hintId}><FieldHint>{hint}</FieldHint></span> : null}
      {error ? (
        <span id={errorId}>
          <FieldError>{error}</FieldError>
        </span>
      ) : null}
    </div>
  );
}

export function Input({
  className,
  invalid,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean }) {
  return (
    <input
      className={cn(
        controlBase,
        'h-10 px-3',
        invalid ? 'border-danger-500 focus:border-danger-500 focus:ring-danger-500/12' : 'border-ink-200',
        className,
      )}
      aria-invalid={invalid || undefined}
      {...props}
    />
  );
}

export function Textarea({
  className,
  invalid,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement> & { invalid?: boolean }) {
  return (
    <textarea
      className={cn(
        controlBase,
        'min-h-24 resize-y px-3 py-2 leading-relaxed',
        invalid ? 'border-danger-500 focus:border-danger-500 focus:ring-danger-500/12' : 'border-ink-200',
        className,
      )}
      aria-invalid={invalid || undefined}
      {...props}
    />
  );
}

export function Select({
  className,
  invalid,
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & { invalid?: boolean }) {
  return (
    <div className="relative">
      <select
        className={cn(
          controlBase,
          'h-10 cursor-pointer appearance-none pr-9 pl-3',
          invalid ? 'border-danger-500' : 'border-ink-200',
          className,
        )}
        aria-invalid={invalid || undefined}
        {...props}
      >
        {children}
      </select>
      <svg
        className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-ink-500"
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden
      >
        <path d="m6 9 6 6 6-6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

export function Checkbox({
  className,
  label,
  hint,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { label: ReactNode; hint?: string }) {
  const id = useId();
  return (
    <div className="flex items-start gap-2.5">
      <input
        id={id}
        type="checkbox"
        className={cn(
          'mt-0.5 size-4 shrink-0 cursor-pointer rounded border-ink-300 text-brand-600 accent-brand-600',
          'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600',
          className,
        )}
        {...props}
      />
      <div className="flex flex-col gap-0.5">
        <label htmlFor={id} className="cursor-pointer text-sm leading-snug text-ink-800">
          {label}
        </label>
        {hint ? <FieldHint>{hint}</FieldHint> : null}
      </div>
    </div>
  );
}

export function Switch({
  checked,
  onCheckedChange,
  label,
  hint,
  disabled,
  id: providedId,
}: {
  checked: boolean;
  onCheckedChange: (next: boolean) => void;
  label: ReactNode;
  hint?: string;
  disabled?: boolean;
  id?: string;
}) {
  const generatedId = useId();
  const id = providedId ?? generatedId;
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex flex-col gap-0.5">
        <label htmlFor={id} className="cursor-pointer text-sm font-medium text-ink-800">
          {label}
        </label>
        {hint ? <FieldHint>{hint}</FieldHint> : null}
      </div>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onCheckedChange(!checked)}
        className={cn(
          'relative mt-0.5 h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors duration-200',
          'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600',
          checked ? 'bg-brand-600' : 'bg-ink-300',
          disabled && 'cursor-not-allowed opacity-55',
        )}
      >
        <span
          className={cn(
            'absolute top-0.5 left-0.5 size-5 rounded-full bg-white shadow-sm transition-transform duration-200',
            checked && 'translate-x-5',
          )}
        />
      </button>
    </div>
  );
}

/** Segmented radio group — used for paper size, photo shape, skill display, etc. */
export function SegmentedControl<T extends string>({
  value,
  onChange,
  options,
  label,
  size = 'md',
  className,
}: {
  value: T;
  onChange: (next: T) => void;
  options: { value: T; label: ReactNode; title?: string }[];
  label: string;
  size?: 'sm' | 'md';
  className?: string;
}) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={cn('inline-flex rounded-lg border border-ink-200 bg-ink-50 p-0.5', className)}
    >
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={active}
            title={option.title}
            onClick={() => onChange(option.value)}
            className={cn(
              'flex-1 cursor-pointer rounded-md font-medium transition-colors duration-150',
              size === 'sm' ? 'px-2.5 py-1 text-xs' : 'px-3 py-1.5 text-[13px]',
              active
                ? 'bg-white text-ink-950 shadow-sm'
                : 'text-ink-600 hover:text-ink-900',
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

/** Accessible colour picker with a text field for exact hex entry. */
export function ColorField({
  value,
  onChange,
  label,
  presets,
}: {
  value: string;
  onChange: (next: string) => void;
  label: string;
  presets?: string[];
}) {
  const id = useId();
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      <div className="flex items-center gap-2">
        <span className="relative size-9 shrink-0 overflow-hidden rounded-lg border border-ink-200">
          <input
            id={id}
            type="color"
            value={value}
            onChange={(event) => onChange(event.target.value)}
            className="absolute -inset-2 h-[calc(100%+16px)] w-[calc(100%+16px)] cursor-pointer border-0 p-0"
            aria-label={`${label} colour picker`}
          />
        </span>
        <Input
          value={value.toUpperCase()}
          onChange={(event) => {
            const next = event.target.value.trim();
            if (/^#?[0-9a-fA-F]{0,6}$/.test(next)) {
              onChange(next.startsWith('#') ? next : `#${next}`);
            }
          }}
          className="h-9 font-mono text-xs uppercase"
          aria-label={`${label} hex value`}
          maxLength={7}
        />
      </div>
      {presets && presets.length > 0 ? (
        <div className="mt-1 flex flex-wrap gap-1.5">
          {presets.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => onChange(preset)}
              title={preset}
              aria-label={`Use ${preset}`}
              aria-pressed={preset.toLowerCase() === value.toLowerCase()}
              className={cn(
                'size-6 cursor-pointer rounded-full border transition-transform hover:scale-110',
                preset.toLowerCase() === value.toLowerCase()
                  ? 'border-ink-900 ring-2 ring-ink-900/15'
                  : 'border-ink-200',
              )}
              style={{ background: preset }}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

/** Labelled slider with a live numeric read-out. */
export function RangeField({
  value,
  onChange,
  min,
  max,
  step,
  label,
  format,
}: {
  value: number;
  onChange: (next: number) => void;
  min: number;
  max: number;
  step: number;
  label: string;
  format?: (value: number) => string;
}) {
  const id = useId();
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <Label htmlFor={id}>{label}</Label>
        <span className="font-mono text-xs text-ink-600">{format ? format(value) : value}</span>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-ink-200 accent-brand-600 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-600"
      />
    </div>
  );
}
