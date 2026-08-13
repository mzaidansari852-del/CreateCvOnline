'use client';

import { useState } from 'react';
import type { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { adminNav, site } from '@/lib/site';
import { cn } from '@/lib/utils/cn';

/**
 * The admin console shell.
 *
 * Deliberately *not* the dashboard chrome: the top bar is near-black and labelled, so an
 * operator can never mistake a page that can delete accounts for their own dashboard.
 * The signed-in address is always on screen for the same reason — everything in here is
 * done as that person.
 */
export function AdminShell({
  email,
  displayName,
  children,
}: {
  email: string;
  displayName: string;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const isActive = (href: string) =>
    href === '/admin' ? pathname === '/admin' : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <div className="flex min-h-dvh flex-col bg-ink-50">
      <header className="sticky top-0 z-60 border-b border-ink-800 bg-ink-950 text-white">
        <div className="mx-auto flex h-14 w-full max-w-[1400px] items-center gap-3 px-4 sm:px-6">
          <button
            type="button"
            className="-ml-1 grid size-9 shrink-0 place-items-center rounded-lg text-ink-300 hover:bg-ink-900 hover:text-white lg:hidden"
            aria-expanded={mobileNavOpen}
            aria-controls="admin-mobile-nav"
            onClick={() => setMobileNavOpen((open) => !open)}
          >
            <span className="sr-only">{mobileNavOpen ? 'Close admin menu' : 'Open admin menu'}</span>
            <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              {mobileNavOpen ? (
                <path d="m6 6 12 12M18 6 6 18" strokeLinecap="round" />
              ) : (
                <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
              )}
            </svg>
          </button>

          <Link href="/admin" className="flex min-w-0 items-center gap-2.5 rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">
            <span className="grid size-7 shrink-0 place-items-center rounded-md bg-accent-500 text-[13px] font-bold text-white">
              A
            </span>
            <span className="truncate font-display text-sm font-bold tracking-tight">
              {site.name}
            </span>
            <span className="hidden rounded-full bg-white/10 px-2 py-0.5 text-2xs font-semibold tracking-wide text-white uppercase sm:inline">
              Admin console
            </span>
          </Link>

          <div className="ml-auto flex items-center gap-3">
            <span className="hidden max-w-[22ch] truncate text-xs text-ink-300 md:inline" title={email}>
              {displayName ? `${displayName} · ` : ''}
              {email}
            </span>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 rounded-lg border border-ink-700 px-3 py-1.5 text-xs font-semibold text-ink-100 transition-colors hover:border-ink-500 hover:bg-ink-900 hover:text-white"
            >
              <svg viewBox="0 0 24 24" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Back to dashboard
            </Link>
          </div>
        </div>

        {mobileNavOpen ? (
          <nav
            id="admin-mobile-nav"
            aria-label="Admin sections"
            className="border-t border-ink-800 bg-ink-950 px-4 pb-3 lg:hidden"
          >
            <ul className="grid gap-0.5 pt-2">
              {adminNav.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => setMobileNavOpen(false)}
                    aria-current={isActive(link.href) ? 'page' : undefined}
                    className={cn(
                      'block rounded-lg px-3 py-2 text-sm font-medium',
                      isActive(link.href)
                        ? 'bg-white/10 text-white'
                        : 'text-ink-300 hover:bg-white/5 hover:text-white',
                    )}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ) : null}
      </header>

      <div className="mx-auto flex w-full max-w-[1400px] flex-1 gap-8 px-4 py-6 sm:px-6 lg:py-8">
        <nav aria-label="Admin sections" className="hidden w-52 shrink-0 lg:block">
          <ul className="sticky top-20 grid gap-0.5">
            {adminNav.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  aria-current={isActive(link.href) ? 'page' : undefined}
                  className={cn(
                    'block rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    isActive(link.href)
                      ? 'bg-white text-ink-950 shadow-card'
                      : 'text-ink-600 hover:bg-white/70 hover:text-ink-900',
                  )}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <main id="main" className="min-w-0 flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
