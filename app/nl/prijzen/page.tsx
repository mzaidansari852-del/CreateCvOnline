import Link from 'next/link';
import type { Metadata } from 'next';

import { NL } from '../nl-copy';
import { CtaBanner, FaqSection, Section, SectionHeading } from '@/components/marketing/primitives';
import { Badge } from '@/components/ui/feedback';
import { ButtonLink } from '@/components/ui/button';
import { JsonLd } from '@/components/seo/JsonLd';
import { PLANS, PLAN_ORDER } from '@/lib/plans';
import { pageMetadata } from '@/lib/seo/metadata';
import { faqSchema, webPageSchema } from '@/lib/seo/schema';

export const metadata: Metadata = pageMetadata({
  title: NL.pricing.metaTitle,
  description: NL.pricing.metaDescription,
  path: '/nl/prijzen',
  locale: 'nl',
  keywords: ['cv maker prijs', 'gratis cv maken', 'cv maken kosten'],
});

/**
 * Pricing, in Dutch.
 *
 * The prices, intervals and plan order come from `lib/plans.ts` — the same data the English
 * page and the checkout read — so a price change lands in one place and cannot leave one
 * language quoting last year's number. Only the words are Dutch.
 *
 * The amount is formatted `$ 29` rather than `$29`: Dutch puts a space between the currency
 * symbol and the number. The symbol itself stays a dollar because that is what the customer
 * is actually charged; `currencyNote` says so rather than quietly showing a euro sign over
 * a dollar transaction.
 */
export default function DutchPricingPage() {
  const copy = NL.pricing;

  const interval = (id: (typeof PLAN_ORDER)[number]) => {
    const plan = PLANS[id];
    if (plan.interval === 'month') return copy.perMonth;
    if (plan.interval === 'one-time') return copy.oneTime;
    return copy.forever;
  };

  return (
    <>
      <Section size="sm">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="font-display text-4xl font-extrabold tracking-tight text-balance text-ink-950 sm:text-5xl">
            {copy.heading}
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-pretty text-ink-600">{copy.lede}</p>
        </div>

        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          {PLAN_ORDER.map((id) => {
            const plan = PLANS[id];
            const words = copy.plans[id];
            const featured = id === 'pro';

            return (
              <div
                key={id}
                className={
                  featured
                    ? 'relative rounded-2xl border-2 border-brand-500 bg-white p-6 shadow-card'
                    : 'rounded-2xl border border-ink-200 bg-white p-6'
                }
              >
                {featured ? (
                  <span className="absolute -top-3 left-6">
                    <Badge tone="brand">Meest gekozen</Badge>
                  </span>
                ) : null}

                <h2 className="text-lg font-bold text-ink-950">{words.name}</h2>
                <p className="mt-1 text-sm text-ink-600">{words.tagline}</p>

                <p className="mt-5 flex items-baseline gap-1.5">
                  <span className="text-4xl font-extrabold tracking-tight text-ink-950">
                    {Number(plan.price) === 0 ? '$ 0' : `$ ${Number(plan.price).toFixed(0)}`}
                  </span>
                  <span className="text-sm text-ink-500">{interval(id)}</span>
                </p>

                <p className="mt-4 text-sm leading-relaxed text-ink-700">{words.description}</p>

                <ul className="mt-5 flex flex-col gap-2.5">
                  {words.highlights.map((item) => (
                    <li key={item} className="flex gap-2.5 text-sm leading-relaxed text-ink-700">
                      <svg
                        className="mt-1 size-3.5 shrink-0 text-success-600"
                        viewBox="0 0 24 24"
                        fill="none"
                        aria-hidden
                      >
                        <path
                          d="m5 12.5 4.5 4.5L19 7.5"
                          stroke="currentColor"
                          strokeWidth="2.6"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>

                <div className="mt-7">
                  <ButtonLink
                    href="/register"
                    fullWidth
                    size="lg"
                    variant={featured ? 'primary' : 'outline'}
                  >
                    {words.cta}
                  </ButtonLink>
                </div>
              </div>
            );
          })}
        </div>

        <p className="mt-6 text-center text-xs text-ink-500">{copy.currencyNote}</p>
      </Section>

      <Section tone="muted" size="sm">
        <FaqSection entries={[...copy.faq]} title={copy.faqTitle} />
      </Section>

      <Section size="sm">
        <SectionHeading align="left" title={NL.gallery.heading} description={NL.gallery.lede} />
        <p className="mt-6 text-sm">
          <Link
            href="/nl/cv-sjablonen"
            className="font-medium text-brand-700 underline underline-offset-2"
          >
            {NL.related.allTemplates}
          </Link>
        </p>
      </Section>

      <Section tone="muted" size="sm">
        <CtaBanner
          primaryLabel={NL.cta.primary}
          title={NL.cta.title}
          description={NL.cta.description}
          secondaryHref="/nl/cv-sjablonen"
          secondaryLabel={NL.home.ctaSecondary}
        />
      </Section>

      <JsonLd
        nodes={[
          webPageSchema({
            path: '/nl/prijzen',
            name: copy.metaTitle,
            description: copy.metaDescription,
            inLanguage: 'nl',
          }),
          faqSchema([...copy.faq], { inLanguage: 'nl' }),
        ]}
      />
    </>
  );
}
