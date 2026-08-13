import Link from 'next/link';

import { site } from '@/lib/site';
import { cn } from '@/lib/utils/cn';

/**
 * The CreateCVOnline mark.
 *
 * A document sheet with a folded corner and a rising baseline inside it — "a CV that
 * moves you forward". Drawn as inline SVG so it is crisp at every size, themeable via
 * `currentColor`, and costs no network request.
 */
export function LogoMark({
  size = 32,
  className,
  title,
}: {
  size?: number;
  className?: string;
  title?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      className={cn('shrink-0', className)}
      role={title ? 'img' : 'presentation'}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      <rect width="40" height="40" rx="10" fill="url(#ccoGradient)" />
      <path
        d="M13 10.5h9.4L28 16.1V29a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 12 29V12a1.5 1.5 0 0 1 1-1.5Z"
        fill="#fff"
        fillOpacity="0.95"
      />
      <path d="M22 10.6V16a.9.9 0 0 0 .9.9h5.05" stroke="#1f3af5" strokeWidth="1.5" strokeLinejoin="round" opacity="0.35" />
      <path
        d="m15.6 25.4 3-3.6 2.5 2 3.4-4.6"
        stroke="#1f3af5"
        strokeWidth="2.1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="24.5" cy="19.2" r="1.55" fill="#f95c33" />
      <defs>
        <linearGradient id="ccoGradient" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop stopColor="#3b5cff" />
          <stop offset="1" stopColor="#1b27b6" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function Logo({
  href = '/',
  size = 32,
  showWordmark = true,
  className,
  wordmarkClassName,
}: {
  href?: string | null;
  size?: number;
  showWordmark?: boolean;
  className?: string;
  wordmarkClassName?: string;
}) {
  const content = (
    <>
      <LogoMark size={size} />
      {showWordmark ? (
        <span
          className={cn(
            'font-display text-[17px] leading-none font-extrabold tracking-tight text-ink-950',
            wordmarkClassName,
          )}
        >
          Create<span className="text-brand-600">CV</span>Online
        </span>
      ) : null}
    </>
  );

  if (!href) {
    return <span className={cn('inline-flex items-center gap-2.5', className)}>{content}</span>;
  }

  return (
    <Link
      href={href}
      className={cn(
        'inline-flex items-center gap-2.5 rounded-lg transition-opacity hover:opacity-85',
        className,
      )}
      aria-label={`${site.name} home`}
    >
      {content}
    </Link>
  );
}
