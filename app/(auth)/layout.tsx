import Link from 'next/link';
import { cookies } from 'next/headers';

import { Logo } from '@/components/brand/Logo';
import { CVThumbnail } from '@/components/cv/CVThumbnail';
import { LocaleProvider } from '@/components/i18n/LocaleProvider';
import { createDefaultCustomization, createSampleCV } from '@/lib/cv/defaults';
import {
  getTemplate,
  templateDefaults,
  DEFAULT_TEMPLATE_ID,
  TEMPLATES,
} from '@/lib/cv/template-registry';
import { appCopy } from '@/lib/i18n/app-copy';
import { LOCALE_COOKIE, resolveLocale } from '@/lib/i18n/resolve';
import { site } from '@/lib/site';

/**
 * The authentication shell.
 *
 * Deliberately outside the marketing group: no site header, no footer navigation, no
 * mega-menu. Someone who arrived to sign in should have exactly two things in front of
 * them — the form, and a reason to finish it.
 *
 * The right-hand panel is a real CV, rendered by the same components that produce the
 * PDF, not a stock illustration. It costs no client JavaScript (`CVThumbnail` is a server
 * component) and it is honest: that is precisely what the product makes. Below `lg` it is
 * dropped entirely so a phone gets the form and nothing else.
 *
 * The language comes from the cookie alone: nobody here is signed in, so there is no
 * profile to prefer over it. That cookie is the whole reason someone who read the French
 * marketing pages and clicked "Créer mon CV" gets a French sign-up form instead of being
 * dropped into English at the one moment they are deciding whether to bother.
 */

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const cv = createSampleCV();
  const template = getTemplate(DEFAULT_TEMPLATE_ID);
  const customization = createDefaultCustomization({
    ...templateDefaults(template),
  });
  const year = new Date().getFullYear();

  const locale = resolveLocale({
    profileLocale: null,
    cookieLocale: (await cookies()).get(LOCALE_COOKIE)?.value,
  });
  const copy = appCopy(locale);

  const valuePoints = [
    {
      title: copy.auth.pointTemplatesTitle(TEMPLATES.length),
      body: copy.auth.pointTemplatesBody,
    },
    { title: copy.auth.pointPrintTitle, body: copy.auth.pointPrintBody },
    { title: copy.auth.pointFreeTitle, body: copy.auth.pointFreeBody },
  ];

  return (
    <LocaleProvider locale={locale}>
      <div lang={locale} className="grid min-h-dvh lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        {/* ---------------------------------------------------------------- form */}
        <div className="flex min-h-dvh flex-col px-5 py-6 sm:px-8 lg:min-h-0">
          <header className="flex items-center justify-between gap-4">
            <Logo href="/" />
            <Link
              href="/templates"
              className="rounded-lg px-2 py-1 text-sm font-medium text-ink-600 transition-colors hover:text-ink-900"
            >
              {copy.auth.browseTemplates}
            </Link>
          </header>

          <main id="main" className="flex flex-1 items-center justify-center py-10">
            <div className="w-full max-w-[26rem]">{children}</div>
          </main>

          <footer className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-ink-500">
            <span>
              © {year} {site.name}
            </span>
            <Link href="/privacy" className="underline-offset-4 hover:text-ink-800 hover:underline">
              {copy.auth.footerPrivacy}
            </Link>
            <Link href="/terms" className="underline-offset-4 hover:text-ink-800 hover:underline">
              {copy.auth.footerTerms}
            </Link>
            <Link href="/contact" className="underline-offset-4 hover:text-ink-800 hover:underline">
              {copy.auth.footerContact}
            </Link>
          </footer>
        </div>

        {/* ------------------------------------------------------------- preview */}
        <aside className="relative hidden overflow-hidden bg-ink-950 lg:flex lg:flex-col lg:justify-center">
          <div
            aria-hidden
            className="pointer-events-none absolute -top-40 -right-24 size-[30rem] rounded-full bg-brand-600/30 blur-3xl"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-48 -left-32 size-[32rem] rounded-full bg-accent-500/15 blur-3xl"
          />

          <div className="relative z-10 mx-auto flex w-full max-w-xl flex-col gap-10 px-12 py-16">
            <div className="flex items-end gap-5">
              <CVThumbnail
                cv={cv}
                customization={customization}
                width={252}
                className="-rotate-2 ring-1 ring-white/10"
              />
              <div className="flex flex-col gap-3 pb-2">
                <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-2xs font-semibold text-white ring-1 ring-white/15 ring-inset">
                  <span className="size-1.5 rounded-full bg-success-500" aria-hidden />
                  {copy.auth.livePreview}
                </span>
                <p className="text-sm leading-relaxed text-ink-300">{copy.auth.livePreviewNote}</p>
              </div>
            </div>

            <div>
              <h2 className="font-display text-2xl leading-tight font-extrabold tracking-tight text-white">
                {copy.auth.panelHeading}
              </h2>
              <ul className="mt-6 flex flex-col gap-5">
                {valuePoints.map((point) => (
                  <li key={point.title} className="flex gap-3">
                    <span
                      aria-hidden
                      className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-brand-500/20 text-brand-300"
                    >
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                      >
                        <path
                          d="m5 12.5 4.5 4.5L19 7"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                    <span>
                      <span className="block text-sm font-semibold text-white">{point.title}</span>
                      <span className="mt-0.5 block text-sm leading-relaxed text-ink-400">
                        {point.body}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <p className="border-t border-white/10 pt-6 text-xs leading-relaxed text-ink-400">
              {copy.auth.panelSecurityNote(site.name)}
            </p>
          </div>
        </aside>
      </div>
    </LocaleProvider>
  );
}
