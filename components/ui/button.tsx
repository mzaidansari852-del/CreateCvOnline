import type { ButtonHTMLAttributes, ReactNode } from 'react';
import Link from 'next/link';

import { cn } from '@/lib/utils/cn';

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'outline'
  | 'ghost'
  | 'danger'
  | 'accent'
  | 'link';
export type ButtonSize = 'sm' | 'md' | 'lg' | 'xl' | 'icon';

const base =
  'relative inline-flex items-center justify-center gap-2 rounded-lg font-semibold whitespace-nowrap ' +
  'transition-[background-color,border-color,color,box-shadow,transform] duration-150 ' +
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 ' +
  'disabled:pointer-events-none disabled:opacity-55 active:translate-y-px select-none';

const variants: Record<ButtonVariant, string> = {
  primary:
    'bg-brand-600 text-white shadow-sm hover:bg-brand-700 active:bg-brand-800 ' +
    'shadow-[0_1px_2px_rgba(10,14,24,.16),inset_0_1px_0_rgba(255,255,255,.14)]',
  secondary: 'bg-ink-900 text-white hover:bg-ink-800 active:bg-ink-950 shadow-sm',
  accent: 'bg-accent-500 text-white hover:bg-accent-600 active:bg-accent-700 shadow-sm',
  outline: 'border border-ink-200 bg-white text-ink-800 hover:bg-ink-50 hover:border-ink-300',
  ghost: 'text-ink-700 hover:bg-ink-100 hover:text-ink-900',
  danger: 'bg-danger-600 text-white hover:bg-danger-700 active:bg-danger-700 shadow-sm',
  link: 'text-brand-700 underline underline-offset-4 hover:text-brand-800 rounded-sm',
};

const sizes: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-[13px]',
  md: 'h-10 px-4 text-sm',
  lg: 'h-11 px-5 text-[15px]',
  xl: 'h-13 px-7 text-base',
  icon: 'h-10 w-10 p-0',
};

export interface ButtonBaseProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
}

export function buttonClasses({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className,
}: ButtonBaseProps & { className?: string }): string {
  return cn(
    base,
    variants[variant],
    variant === 'link' ? 'h-auto px-0' : sizes[size],
    fullWidth && 'w-full',
    className,
  );
}

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    ButtonBaseProps {}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth,
  leadingIcon,
  trailingIcon,
  className,
  children,
  disabled,
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={buttonClasses({ variant, size, fullWidth, className })}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? (
        <span
          className="absolute inset-0 grid place-items-center"
          aria-hidden
        >
          <Spinner className={variant === 'outline' || variant === 'ghost' ? 'text-ink-600' : 'text-current'} />
        </span>
      ) : null}
      <span className={cn('contents', loading && 'invisible')}>
        {leadingIcon}
        {children}
        {trailingIcon}
      </span>
    </button>
  );
}

/** A `next/link` styled as a button. Use for navigation; use `Button` for actions. */
export function ButtonLink({
  href,
  variant = 'primary',
  size = 'md',
  fullWidth,
  leadingIcon,
  trailingIcon,
  className,
  children,
  prefetch,
  target,
  rel,
  'aria-label': ariaLabel,
}: ButtonBaseProps & {
  href: string;
  className?: string;
  children?: ReactNode;
  prefetch?: boolean;
  target?: string;
  rel?: string;
  'aria-label'?: string;
}) {
  const isExternal = /^https?:\/\//i.test(href) || href.startsWith('mailto:');
  const classes = buttonClasses({ variant, size, fullWidth, className });

  if (isExternal) {
    return (
      <a
        href={href}
        className={classes}
        target={target ?? '_blank'}
        rel={rel ?? 'noopener noreferrer'}
        aria-label={ariaLabel}
      >
        {leadingIcon}
        {children}
        {trailingIcon}
      </a>
    );
  }

  return (
    <Link
      href={href}
      className={classes}
      prefetch={prefetch}
      target={target}
      rel={rel}
      aria-label={ariaLabel}
    >
      {leadingIcon}
      {children}
      {trailingIcon}
    </Link>
  );
}

export function Spinner({ className, size = 16 }: { className?: string; size?: number }) {
  return (
    <svg
      className={cn('animate-spin', className)}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
    >
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="3" opacity="0.25" />
      <path
        d="M21 12a9 9 0 0 0-9-9"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}
