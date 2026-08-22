'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { Logo } from '@/components/brand/Logo';
import { footerNav, site } from '@/lib/site';
import { CHROME, FOOTER, NAV_CATEGORIES } from '@/lib/i18n/nav';
import { TEMPLATE_ROOT, localeOf } from '@/lib/i18n/locales';
import type { TemplateCategory } from '@/types/cv';
import {
  TEMPLATE_CATEGORIES,
  TEMPLATE_COUNT,
  categoryPath,
  templatesByCategory,
} from '@/lib/cv/template-registry';

export function SiteFooter() {
  const year = new Date().getFullYear();
  /*
   * Follows the page it sits on, like the header. A localised footer is a different shape
   * rather than a translation: the English one links fourteen guide pages that exist only
   * in English, and a French or German menu leading to English pages is worse than a
   * shorter menu.
   *
   * Keyed on whether a translation exists rather than on `locale === 'fr'`, which is what
   * it used to say. German copy was written at the same time as the German pages and then
   * never rendered — every German page shipped an English footer, down to a "Free CV
   * builder" link pointing at an English-only guide.
   */
  const locale = localeOf(usePathname() ?? '/');
  const copy = FOOTER[locale];
  const chrome = CHROME[locale];
  const groups = copy.columns.length > 0 ? copy.columns : footerNav;
  const navCategories = NAV_CATEGORIES[locale];
  const categoryHref = (id: TemplateCategory) =>
    navCategories
      ? `${TEMPLATE_ROOT[locale]}/${navCategories.find((entry) => entry.id === id)?.slug ?? id}`
      : categoryPath(id);
  const categoryLabel = (id: TemplateCategory, fallback: string) =>
    navCategories
      ? (navCategories.find((entry) => entry.id === id)?.label ?? fallback)
      : `${fallback} CV templates`;

  return (
    <footer className="border-t border-ink-200 bg-ink-50">
      <div className="container-page py-14">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,3fr)]">
          <div className="max-w-sm">
            <Logo homeLabel={chrome.homeLabel(site.name)} />
            {/* `FOOTER[locale].blurb` — the English wording, written out, was the reason
                this paragraph stayed English on the French and German pages. */}
            <p className="mt-4 text-sm leading-relaxed text-ink-600">
              {site.name} {copy.blurb(TEMPLATE_COUNT)}
            </p>
            <ul className="mt-5 flex items-center gap-3">
              <SocialLink href={site.social.linkedin} label="LinkedIn" newTab={chrome.newTab}>
                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6Z" />
                <rect x="2" y="9" width="4" height="12" />
                <circle cx="4" cy="4" r="2" />
              </SocialLink>
              <SocialLink href={site.social.x} label="X" newTab={chrome.newTab}>
                <path d="M4 4l7.5 9.6L4.4 20h2.2l5.8-6.2 4.8 6.2H20l-7.8-10 6.7-6h-2.2l-5.4 5.8L6.7 4H4Z" />
              </SocialLink>
              <SocialLink href={site.social.facebook} label="Facebook" newTab={chrome.newTab}>
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3Z" />
              </SocialLink>
              <SocialLink href={site.social.instagram} label="Instagram" newTab={chrome.newTab}>
                <rect x="2" y="2" width="20" height="20" rx="5" />
                <circle cx="12" cy="12" r="4" />
                <circle cx="17.5" cy="6.5" r="1" />
              </SocialLink>
            </ul>
          </div>

          <nav aria-label={chrome.footerNavLabel} className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            {groups.map((group) => (
              <div key={group.label}>
                <h2 className="text-xs font-bold tracking-[0.12em] text-ink-950 uppercase">
                  {group.label}
                </h2>
                <ul className="mt-3 flex flex-col gap-2">
                  {group.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-sm text-ink-600 transition-colors hover:text-brand-700"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        {/*
          The six category pages, on every page of the site.
          Each one is written to rank for "<category> CV templates" and each was previously
          reachable only from the homepage and from templates in its own family — the two
          places a crawler is least likely to need help getting to. A footer row is the
          cheapest way to give all six a site-wide internal link.
        */}
        <nav aria-label={chrome.footerCategoriesLabel} className="mt-12 border-t border-ink-200 pt-6">
          <h2 className="text-xs font-bold tracking-[0.12em] text-ink-950 uppercase">
            {copy.browseByCategory}
          </h2>
          <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-2">
            {TEMPLATE_CATEGORIES.map((category) => (
              <li key={category.id}>
                <Link
                  href={categoryHref(category.id)}
                  className="text-sm text-ink-600 transition-colors hover:text-brand-700"
                >
                  {categoryLabel(category.id, category.label)}
                  <span className="ml-1.5 text-ink-400">
                    ({templatesByCategory(category.id).length})
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="mt-8 flex flex-col gap-4 border-t border-ink-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[13px] text-ink-500">
            © {year} {site.legalName}. {copy.rights}
          </p>
          <p className="text-[13px] text-ink-500">
            {site.domain} — {copy.strapline}
          </p>
        </div>
      </div>
    </footer>
  );
}

function SocialLink({
  href,
  label,
  newTab,
  children,
}: {
  href: string;
  label: string;
  /** Wraps the label with this language's "opens in a new tab" warning. */
  newTab: (label: string) => string;
  children: React.ReactNode;
}) {
  return (
    <li>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={newTab(label)}
        className="grid size-9 place-items-center rounded-lg border border-ink-200 bg-white text-ink-600 transition-colors hover:border-brand-300 hover:text-brand-700"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          {children}
        </svg>
      </a>
    </li>
  );
}
