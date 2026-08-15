'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { Logo } from '@/components/brand/Logo';
import { Button, ButtonLink } from '@/components/ui/button';
import { useAuth } from '@/components/auth/AuthProvider';
import { useScrolledPast } from '@/hooks/browser';
import { CHROME, navFor, otherLocale } from '@/lib/i18n/nav';
import { LOCALE_META, alternatesFor, localeOf } from '@/lib/i18n/locales';
import { cn } from '@/lib/utils/cn';

/**
 * The public site header.
 *
 * Desktop: a menubar with hover/focus dropdowns for the three link groups.
 * Mobile: a full-height sheet with the same links, expanded rather than nested, because
 * a nested accordion inside a drawer is two taps to reach anything.
 */
export function SiteHeader() {
  const pathname = usePathname();
  /*
   * The header follows the page it is sitting on. A French page under an English nav reads
   * as a translated page rather than a French product, and it is the first thing on screen.
   */
  const locale = localeOf(pathname ?? '/');
  const chrome = CHROME[locale];
  const nav = navFor(locale);
  const alternate = alternatesFor(pathname ?? '/');
  const swapTo = otherLocale(locale);
  const { sessionUser, ready, signOut } = useAuth();
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [lastPath, setLastPath] = useState(pathname);
  const scrolled = useScrolledPast(8);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Close any open menu when the route changes. Adjusting state during render is the
  // supported pattern for reacting to a changed value without an extra commit.
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setMobileOpen(false);
    setOpenGroup(null);
  }

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  const openWithDelay = (label: string) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpenGroup(label);
  };
  const closeWithDelay = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpenGroup(null), 140);
  };

  const isActive = (href: string) =>
    pathname === href || (href !== '/' && pathname.startsWith(`${href}/`));

  return (
    <header
      className={cn(
        'sticky top-0 z-70 border-b bg-white/85 backdrop-blur-lg transition-[border-color,box-shadow]',
        scrolled ? 'border-ink-200 shadow-[0_1px_12px_rgba(10,14,24,.05)]' : 'border-transparent',
      )}
    >
      <div className="container-page">
        <div className="flex h-16 items-center justify-between gap-4">
          <Logo />

          <nav aria-label="Main" className="hidden lg:block">
            <ul className="flex items-center gap-1">
              {nav.map((group) => {
                const hasChildren = group.links.length > 0;
                const open = openGroup === group.label;

                return (
                  <li
                    key={group.label}
                    className="relative"
                    onMouseEnter={() => hasChildren && openWithDelay(group.label)}
                    onMouseLeave={closeWithDelay}
                  >
                    {hasChildren ? (
                      <button
                        type="button"
                        aria-expanded={open}
                        aria-haspopup="true"
                        onClick={() => setOpenGroup(open ? null : group.label)}
                        onFocus={() => openWithDelay(group.label)}
                        className={cn(
                          'flex cursor-pointer items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                          group.href && isActive(group.href)
                            ? 'text-brand-700'
                            : 'text-ink-700 hover:bg-ink-100 hover:text-ink-950',
                        )}
                      >
                        {group.label}
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          aria-hidden
                          className={cn('transition-transform', open && 'rotate-180')}
                        >
                          <path d="m6 9 6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </button>
                    ) : (
                      <Link
                        href={group.href ?? '#'}
                        className={cn(
                          'block rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                          group.href && isActive(group.href)
                            ? 'text-brand-700'
                            : 'text-ink-700 hover:bg-ink-100 hover:text-ink-950',
                        )}
                      >
                        {group.label}
                      </Link>
                    )}

                    {hasChildren && open ? (
                      <div
                        className="absolute top-full left-0 w-80 animate-[--animate-scale-in] pt-2"
                        onMouseEnter={() => openWithDelay(group.label)}
                        onMouseLeave={closeWithDelay}
                      >
                        <div className="overflow-hidden rounded-xl border border-ink-200 bg-white p-2 shadow-pop">
                          {group.links.map((link) => (
                            <Link
                              key={link.href}
                              href={link.href}
                              className="block rounded-lg px-3 py-2.5 transition-colors hover:bg-ink-50"
                            >
                              <span className="block text-sm font-semibold text-ink-950">
                                {link.label}
                              </span>
                              {link.description ? (
                                <span className="mt-0.5 block text-[13px] leading-snug text-ink-600">
                                  {link.description}
                                </span>
                              ) : null}
                            </Link>
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="hidden items-center gap-2 lg:flex">
            {/*
              The language toggle only appears where there is somewhere to go: it is driven
              by the same path map as `hreflang`, so it cannot offer a translation that does
              not exist. On an untranslated page it is simply absent.
            */}
            {alternate ? (
              <Link
                href={alternate[swapTo]}
                hrefLang={LOCALE_META[swapTo].tag}
                lang={LOCALE_META[swapTo].tag}
                aria-label={`${chrome.language} : ${LOCALE_META[swapTo].label}`}
                className="mr-1 rounded-lg px-2 py-1 text-[13px] font-medium text-ink-600 transition-colors hover:text-brand-700"
              >
                {LOCALE_META[swapTo].label}
              </Link>
            ) : null}
            {!ready ? (
              /*
               * The user is unknown for a moment because the marketing pages are static
               * and the Firebase SDK resolves in the browser. Rendering the signed-out
               * buttons during that moment would flash "Sign in" at every returning
               * visitor, which reads as having been logged out. A placeholder of roughly
               * the right footprint says "not yet known" instead of saying something wrong.
               */
              <span aria-hidden className="flex items-center gap-2">
                <span className="h-8 w-[74px] animate-pulse rounded-lg bg-ink-100" />
                <span className="h-8 w-[104px] animate-pulse rounded-lg bg-ink-100" />
              </span>
            ) : sessionUser ? (
              <>
                <ButtonLink href="/dashboard" variant="ghost" size="sm">
                  {chrome.dashboard}
                </ButtonLink>
                <ButtonLink href="/dashboard/cvs/new" size="sm">
                  {chrome.newCv}
                </ButtonLink>
              </>
            ) : (
              <>
                <ButtonLink href="/login" variant="ghost" size="sm">
                  {chrome.signIn}
                </ButtonLink>
                <ButtonLink href="/register" size="sm">
                  {chrome.newCv}
                </ButtonLink>
              </>
            )}
          </div>

          <button
            type="button"
            className="-mr-2 cursor-pointer rounded-lg p-2 text-ink-700 transition-colors hover:bg-ink-100 lg:hidden"
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setMobileOpen((open) => !open)}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
              {mobileOpen ? (
                <path d="m6 6 12 12M18 6 6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              ) : (
                <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {mobileOpen ? (
        <div
          id="mobile-nav"
          className="fixed inset-x-0 top-16 bottom-0 z-70 overflow-y-auto overscroll-contain border-t border-ink-200 bg-white lg:hidden"
        >
          <div className="container-page py-6">
            <nav aria-label="Mobile">
              {nav.map((group) => (
                <div key={group.label} className="mb-6">
                  {group.href ? (
                    <Link
                      href={group.href}
                      className="mb-2 block text-xs font-bold tracking-[0.12em] text-ink-500 uppercase"
                    >
                      {group.label}
                    </Link>
                  ) : (
                    <p className="mb-2 text-xs font-bold tracking-[0.12em] text-ink-500 uppercase">
                      {group.label}
                    </p>
                  )}
                  <ul className="flex flex-col">
                    {(group.links.length > 0
                      ? group.links
                      : [{ label: group.label, href: group.href ?? '#', description: undefined }]
                    ).map((link) => (
                      <li key={link.href}>
                        <Link
                          href={link.href}
                          className="block border-b border-ink-100 py-3 text-[15px] font-medium text-ink-800"
                        >
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </nav>

            <div className="mt-2 flex flex-col gap-3">
              {sessionUser ? (
                <>
                  <ButtonLink href="/dashboard" fullWidth size="lg">
                    Go to dashboard
                  </ButtonLink>
                  <Button variant="outline" fullWidth size="lg" onClick={() => void signOut()}>
                    Sign out
                  </Button>
                </>
              ) : (
                <>
                  <ButtonLink href="/register" fullWidth size="lg">
                    Create my CV — free
                  </ButtonLink>
                  <ButtonLink href="/login" variant="outline" fullWidth size="lg">
                    Sign in
                  </ButtonLink>
                </>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}
