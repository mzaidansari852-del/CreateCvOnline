'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Crown,
  FileText,
  LayoutDashboard,
  LayoutTemplate,
  LogOut,
  Plus,
  Settings,
  Shield,
  User,
  type LucideIcon,
} from 'lucide-react';

import { useAuth } from '@/components/auth/AuthProvider';
import { LanguageSwitcher } from '@/components/i18n/LanguageSwitcher';
import { useCopy } from '@/components/i18n/LocaleProvider';
import { Logo, LogoMark } from '@/components/brand/Logo';
import { ButtonLink } from '@/components/ui/button';
import { Badge } from '@/components/ui/feedback';
import { DropdownMenu, type MenuItem } from '@/components/ui/overlays';
import { dashboardNav } from '@/lib/site';
import { cn } from '@/lib/utils/cn';
import type { Viewer } from '@/lib/auth/guards';

/**
 * The dashboard chrome.
 *
 * Deliberately *not* rendered by `app/dashboard/layout.tsx`: the CV editor lives under
 * `/dashboard/cvs/[id]/edit` and needs the whole viewport with no top bar and no
 * sidebar. Every other page opts in by wrapping its content in this component, which
 * also owns the page's single `<h1>`.
 *
 * At `lg` and up the navigation is a fixed left rail. Below that it becomes a bottom tab
 * bar — five destinations, thumb-height targets, safe-area aware — because a shrunken
 * desktop sidebar is unusable at 375px.
 */

const NAV_ICONS: Record<string, LucideIcon> = {
  '/dashboard': LayoutDashboard,
  '/dashboard/cvs': FileText,
  '/dashboard/templates': LayoutTemplate,
  '/dashboard/account': User,
  '/dashboard/settings': Settings,
};

export interface DashboardShellProps {
  viewer: Viewer;
  title: string;
  description?: string;
  /** Page-level actions rendered beside the heading. */
  actions?: ReactNode;
  children: ReactNode;
}

function initialsOf(viewer: Viewer): string {
  const source = viewer.profile.displayName || viewer.user.displayName || viewer.user.email;
  const parts = source.split(/[\s@._-]+/).filter(Boolean);
  const first = parts[0]?.[0] ?? '';
  const second = parts.length > 1 ? (parts[1]?.[0] ?? '') : '';
  return (first + second).toUpperCase() || '?';
}

export function DashboardShell({
  viewer,
  title,
  description,
  actions,
  children,
}: DashboardShellProps) {
  const pathname = usePathname();
  const { signOut } = useAuth();
  const copy = useCopy();

  /*
   * The rail labels come from the copy table keyed by href, not from `dashboardNav`'s
   * own `label`. `lib/site.ts` is shared with the marketing chrome and the sitemap, where
   * the English label is the right thing; translating it there would change what those
   * emit. Keyed by href so a route added to the nav without a translation is a type error.
   */
  const NAV_LABEL: Record<string, string> = {
    '/dashboard': copy.nav.dashboard,
    '/dashboard/cvs': copy.nav.myCvs,
    '/dashboard/templates': copy.nav.templates,
    '/dashboard/account': copy.nav.account,
    '/dashboard/settings': copy.nav.settings,
  };

  const isActive = (href: string) =>
    href === '/dashboard'
      ? pathname === href
      : pathname === href || pathname.startsWith(`${href}/`);

  const menuItems: MenuItem[] = [
    { label: copy.nav.account, href: '/dashboard/account', icon: <User size={16} aria-hidden /> },
    {
      label: copy.nav.settings,
      href: '/dashboard/settings',
      icon: <Settings size={16} aria-hidden />,
    },
    ...(viewer.isAdmin
      ? [
          {
            label: copy.dashboard.adminConsole,
            href: '/admin',
            icon: <Shield size={16} aria-hidden />,
            separatorBefore: true,
          } satisfies MenuItem,
        ]
      : []),
    {
      label: copy.nav.signOut,
      onSelect: () => void signOut(),
      icon: <LogOut size={16} aria-hidden />,
      tone: 'danger',
      separatorBefore: true,
    },
  ];

  return (
    <div className="min-h-dvh bg-ink-50">
      <header className="sticky top-0 z-70 border-b border-ink-200 bg-white/90 backdrop-blur-lg">
        <div className="flex h-14 items-center gap-3 px-4 lg:px-6">
          <Logo href="/dashboard" className="hidden sm:inline-flex" />
          <Link
            href="/dashboard"
            aria-label={copy.nav.dashboard}
            className="inline-flex rounded-lg sm:hidden"
          >
            <LogoMark size={28} />
          </Link>

          <Badge tone={viewer.isPremium ? 'accent' : 'neutral'} className="hidden sm:inline-flex">
            {viewer.isPremium ? <Crown size={11} aria-hidden /> : null}
            {viewer.plan.name}
          </Badge>

          <div className="ml-auto flex items-center gap-2">
            {/*
              In the header rather than only in Settings, because "where do I change the
              language?" was a question a user had to ask — the marketing header has had
              this control since the French release and the dashboard renders no marketing
              header, so signing in used to remove the only way to change language.
            */}
            <LanguageSwitcher className="hidden sm:flex" />

            <ButtonLink
              href="/dashboard/cvs/new"
              size="sm"
              leadingIcon={<Plus size={16} aria-hidden />}
            >
              <span className="hidden sm:inline">{copy.nav.newCv}</span>
              <span className="sm:hidden">{copy.nav.newCvShort}</span>
            </ButtonLink>

            <DropdownMenu
              ariaLabel={copy.nav.account}
              items={menuItems}
              trigger={() => (
                <span className="flex items-center gap-2 rounded-full p-0.5 pr-1 transition-colors hover:bg-ink-100">
                  <span className="grid size-8 place-items-center rounded-full bg-brand-600 text-xs font-bold text-white">
                    {initialsOf(viewer)}
                  </span>
                  <span className="hidden max-w-36 truncate text-sm font-medium text-ink-700 lg:inline">
                    {viewer.profile.displayName || viewer.user.email}
                  </span>
                </span>
              )}
            />
          </div>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-[1440px]">
        <aside className="sticky top-14 hidden h-[calc(100dvh-3.5rem)] w-60 shrink-0 border-r border-ink-200 bg-white px-3 py-5 lg:block">
          <nav aria-label={copy.nav.dashboard}>
            <ul className="flex flex-col gap-0.5">
              {dashboardNav.map((link) => {
                const Icon = NAV_ICONS[link.href] ?? FileText;
                const active = isActive(link.href);
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      aria-current={active ? 'page' : undefined}
                      className={cn(
                        'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                        active
                          ? 'bg-brand-50 text-brand-700'
                          : 'text-ink-700 hover:bg-ink-100 hover:text-ink-950',
                      )}
                    >
                      <Icon size={17} aria-hidden className="shrink-0" />
                      {NAV_LABEL[link.href] ?? link.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {!viewer.isPremium ? (
            <div className="mt-6 rounded-xl border border-brand-200 bg-brand-50 p-3.5">
              <p className="text-sm font-semibold text-brand-900">{copy.dashboard.onFreePlan}</p>
              <p className="mt-1 text-xs leading-relaxed text-brand-800/80">
                {copy.dashboard.freePlanLimits(
                  viewer.limits.maxCvs,
                  viewer.limits.maxDownloadsPerMonth,
                )}
              </p>
              <ButtonLink href="/pricing" size="sm" fullWidth className="mt-3">
                {copy.dashboard.comparePlans}
              </ButtonLink>
            </div>
          ) : null}
        </aside>

        <main id="main" className="min-w-0 flex-1 px-4 pt-6 pb-24 sm:px-6 lg:px-8 lg:pb-12">
          <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <h1 className="font-display text-2xl font-extrabold tracking-tight text-ink-950 sm:text-[28px]">
                {title}
              </h1>
              {description ? (
                <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-ink-600">
                  {description}
                </p>
              ) : null}
            </div>
            {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
          </div>

          {children}
        </main>
      </div>

      <nav
        aria-label={copy.dashboard.tabBarAria}
        className="fixed inset-x-0 bottom-0 z-70 border-t border-ink-200 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-lg lg:hidden"
      >
        <ul className="flex items-stretch">
          {dashboardNav.map((link) => {
            const Icon = NAV_ICONS[link.href] ?? FileText;
            const active = isActive(link.href);
            return (
              <li key={link.href} className="flex-1">
                <Link
                  href={link.href}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'flex h-14 flex-col items-center justify-center gap-1 px-1 text-[11px] font-medium transition-colors',
                    active ? 'text-brand-700' : 'text-ink-500 hover:text-ink-900',
                  )}
                >
                  <Icon size={19} aria-hidden />
                  <span className="max-w-full truncate">{NAV_LABEL[link.href] ?? link.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
