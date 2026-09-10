import Link from 'next/link';

import { readLaunchOffer } from '@/lib/db/offers';
import { PLANS, listPrice, offerSavingAmount, offerSavingPercent } from '@/lib/plans';
import { publicEnv } from '@/lib/env';
import { DEFAULT_LOCALE, type Locale } from '@/lib/i18n/locales';
import { cn } from '@/lib/utils/cn';

/**
 * The running offer, wherever it is worth mentioning.
 *
 * One component rather than a banner written into each page, because an offer that appears
 * in five places is an offer that has to be *ended* in five places — and the one left
 * behind advertises a price the checkout no longer honours. This reads
 * `/admin/offers` like everything else, so switching the offer off removes it everywhere at
 * once and there is nothing to remember.
 *
 * Renders `null` when no offer is running, so a page can mount it unconditionally.
 *
 * ## Why the copy lives here
 *
 * Four short strings in four languages, used only by this component. Threading them through
 * the shared copy modules would mean four files edited to change a banner, and every page
 * that renders it passing strings it does not otherwise care about.
 */

const CHECKOUT_PATH: Record<Locale, string> = {
  en: '/pricing',
  fr: '/fr/tarifs',
  de: '/de/preise',
  nl: '/nl/prijzen',
};

interface BannerCopy {
  /** "Launch offer" — falls back to the label set in the admin panel. */
  lead: (label: string) => string;
  /** "Lifetime is $10 instead of $69 — 86% off" */
  headline: (plan: string, now: string, was: string, percent: number) => string;
  /** "for the first 500 members" — appended only when the offer states a limit. */
  seats: (count: string) => string;
  cta: string;
}

const COPY: Record<Locale, BannerCopy> = {
  en: {
    lead: (label) => label,
    headline: (plan, now, was, percent) => `${plan} is ${now} instead of ${was} — ${percent}% off`,
    seats: (count) => `for the first ${count} members`,
    cta: 'See the offer',
  },
  fr: {
    lead: (label) => label,
    headline: (plan, now, was, percent) =>
      `${plan} à ${now} au lieu de ${was} — ${percent} % de remise`,
    seats: (count) => `pour les ${count} premiers membres`,
    cta: 'Voir l’offre',
  },
  de: {
    lead: (label) => label,
    headline: (plan, now, was, percent) => `${plan} für ${now} statt ${was} — ${percent} % Rabatt`,
    seats: (count) => `für die ersten ${count} Mitglieder`,
    cta: 'Angebot ansehen',
  },
  nl: {
    lead: (label) => label,
    headline: (plan, now, was, percent) => `${plan} voor ${now} in plaats van ${was} — ${percent}% korting`,
    seats: (count) => `voor de eerste ${count} leden`,
    cta: 'Bekijk de aanbieding',
  },
};

const LOCALE_TAG: Record<Locale, string> = {
  en: 'en',
  fr: 'fr-FR',
  de: 'de-DE',
  nl: 'nl-NL',
};

function money(amount: string): string {
  const symbols: Record<string, string> = { USD: '$', EUR: '€', GBP: '£' };
  const symbol = symbols[publicEnv.storeCurrency];
  const trimmed = amount.endsWith('.00') ? amount.slice(0, -3) : amount;
  return symbol ? `${symbol}${trimmed}` : `${trimmed} ${publicEnv.storeCurrency}`;
}

export async function OfferBanner({
  locale = DEFAULT_LOCALE,
  variant = 'strip',
  className,
}: {
  locale?: Locale;
  /**
   * `strip` is the full-width bar above a marketing page. `card` is the boxed version for
   * a dashboard column, where a full-bleed bar would fight the panels around it.
   */
  variant?: 'strip' | 'card';
  className?: string;
}) {
  const offer = await readLaunchOffer();
  if (!offer) return null;

  const plan = PLANS[offer.planId];
  const copy = COPY[locale];
  const percent = offerSavingPercent(offer, offer.planId);

  /*
   * A saving of zero would render "0% off", which is worse than rendering nothing — it
   * advertises an offer while admitting it saves nothing. The admin API refuses to store
   * such an offer, so this only fires if one was written another way.
   */
  if (percent <= 0 || Number.parseFloat(offerSavingAmount(offer, offer.planId)) <= 0) return null;

  const headline = copy.headline(
    plan.name,
    money(offer.price),
    money(listPrice(offer.planId)),
    percent,
  );
  const seats = offer.seats ? copy.seats(offer.seats.toLocaleString(LOCALE_TAG[locale])) : null;
  const href = CHECKOUT_PATH[locale];

  if (variant === 'card') {
    return (
      <div
        className={cn(
          'rounded-xl border border-accent-200 bg-accent-50/70 p-4 sm:p-5',
          className,
        )}
      >
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-accent-600 px-2.5 py-1 text-[10.5px] font-extrabold tracking-[0.08em] text-white uppercase">
            {copy.lead(offer.label)}
          </span>
          <span className="text-sm font-bold text-ink-950">{headline}</span>
        </div>
        {seats ? <p className="mt-1.5 text-xs text-ink-600">{seats}</p> : null}
        <Link
          href={href}
          className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-accent-700 underline underline-offset-2 hover:text-accent-800"
        >
          {copy.cta}
          <span aria-hidden>→</span>
        </Link>
      </div>
    );
  }

  return (
    <div className={cn('bg-accent-600 text-white', className)}>
      <Link
        href={href}
        className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-3 gap-y-1 px-5 py-2.5 text-center transition-colors hover:bg-accent-700"
      >
        <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-[10.5px] font-extrabold tracking-[0.08em] uppercase">
          {copy.lead(offer.label)}
        </span>
        <span className="text-[13.5px] font-semibold">{headline}</span>
        {seats ? <span className="text-[13.5px] opacity-80">{seats}</span> : null}
        <span className="text-[13.5px] font-bold underline underline-offset-2">
          {copy.cta} →
        </span>
      </Link>
    </div>
  );
}
