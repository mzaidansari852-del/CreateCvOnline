import Link from 'next/link';

import { CVThumbnail } from '@/components/cv/CVThumbnail';
import { ArrowIcon, CheckIcon } from '@/components/marketing/home/icons';
import { ButtonLink } from '@/components/ui/button';
import { createDefaultCustomization, createSampleCV } from '@/lib/cv/defaults';
import {
  atsSafeTemplates,
  getTemplate,
  templateDefaults,
  TEMPLATE_COUNT,
} from '@/lib/cv/template-registry';
import { cn } from '@/lib/utils/cn';

/**
 * The homepage hero.
 *
 * The visual on the right is not an illustration: it is three real templates rendered by
 * the same component the editor and the PDF renderer use, fed with the same sample CV the
 * gallery uses. If a template regresses, the homepage shows it.
 */

const FAN: { templateId: string; width: number; position: string }[] = [
  // Back-left: a serif, classic layout.
  { templateId: 'classic-07', width: 196, position: 'left-1 top-[118px] z-10 rotate-[-9deg]' },
  // Back-right: a two-column corporate layout.
  { templateId: 'modern-04', width: 206, position: 'left-[330px] top-[96px] z-20 rotate-[8deg]' },
  // Front: the default template, single column, brand accent.
  { templateId: 'modern-01', width: 268, position: 'left-[136px] top-[66px] z-30 rotate-[-2deg]' },
];

function FannedPreview() {
  const cv = createSampleCV();

  return (
    <div className="relative mx-auto h-[300px] w-full max-w-[540px] sm:h-[425px] lg:h-[475px]">
      <div className="absolute top-0 left-1/2 h-[500px] w-[540px] origin-top -translate-x-1/2 scale-[0.58] sm:scale-[0.82] lg:scale-[0.92]">
        {FAN.map(({ templateId, width, position }) => {
          const template = getTemplate(templateId);
          return (
            <div key={template.id} className={cn('absolute', position)}>
              <CVThumbnail
                cv={cv}
                customization={createDefaultCustomization({
                  ...templateDefaults(template),
                })}
                width={width}
                className="ring-1 ring-ink-900/5"
              />
            </div>
          );
        })}

        <div
          aria-hidden
          className="absolute top-[34px] left-[352px] z-40 flex items-center gap-2 rounded-full bg-white px-3 py-1.5 shadow-pop ring-1 ring-ink-200"
        >
          <span className="grid size-4 place-items-center rounded-full bg-success-500 text-white">
            <CheckIcon className="size-2.5" />
          </span>
          <span className="text-2xs font-semibold text-ink-800">ATS check 5/5</span>
        </div>

        <div
          aria-hidden
          className="absolute top-[404px] left-[10px] z-40 flex items-center gap-2 rounded-full bg-white px-3 py-1.5 shadow-pop ring-1 ring-ink-200"
        >
          <span className="size-2 rounded-full bg-brand-500" />
          <span className="text-2xs font-semibold text-ink-800">Saved · A4 PDF ready</span>
        </div>
      </div>
    </div>
  );
}

/**
 * The words the hero says, in one language.
 *
 * Parameterised rather than duplicated. The French home page originally reproduced this
 * layout out of the generic section primitives, which is how it ended up as a page of
 * plain text next to an English page with a badge, a gradient headline and a fanned stack
 * of previews — the same product looking like a lesser one in French. A translation should
 * change the words and nothing else.
 */
export interface HeroCopy {
  /** Rendered around the accent word: `before` + highlighted + `after`. */
  headingBefore: string;
  headingHighlight: string;
  headingAfter: string;
  lede: string;
  badge: (count: number) => string;
  primaryCta: string;
  secondaryCta: string;
  browseHref: string;
  atsHref: string;
  trust: string[];
}

const EN: HeroCopy = {
  headingBefore: 'Create your ',
  headingHighlight: 'professional CV',
  headingAfter: ' online',
  lede: `Choose one of ${TEMPLATE_COUNT} recruiter-ready designs, type into structured fields, and watch a real A4 page build itself next to you. When it reads well, export a clean PDF whose text a recruiter — and a parser — can actually select.`,
  badge: (count) => `${count} templates score 5/5 for parsing`,
  primaryCta: 'Create my CV — free',
  secondaryCta: `Browse ${TEMPLATE_COUNT} templates`,
  browseHref: '/templates',
  atsHref: '/ats-cv',
  trust: [`${TEMPLATE_COUNT} templates`, 'ATS-friendly', 'Free to start', 'No card'],
};

export function HomeHero({ copy = EN }: { copy?: HeroCopy } = {}) {
  const atsPerfect = atsSafeTemplates().length;
  const trust = copy.trust;

  return (
    <section className="relative isolate overflow-hidden bg-gradient-to-b from-brand-50 via-white to-white">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-56 left-1/4 size-[46rem] rounded-full bg-brand-200/45 blur-3xl" />
        <div className="absolute top-10 -right-40 size-[34rem] rounded-full bg-accent-100/60 blur-3xl" />
      </div>

      <div className="container-page">
        <div className="grid items-center gap-12 py-14 sm:py-20 lg:grid-cols-[minmax(0,1fr)_minmax(0,500px)] lg:gap-8 lg:py-24">
          <div>
            <Link
              href={copy.atsHref}
              className="group inline-flex items-center gap-2 rounded-full border border-brand-200 bg-white/80 py-1.5 pr-3 pl-1.5 text-[13px] font-medium text-ink-700 shadow-sm backdrop-blur transition-colors hover:border-brand-300 hover:text-ink-900"
            >
              <span className="rounded-full bg-brand-600 px-2 py-0.5 text-2xs font-bold tracking-wide text-white uppercase">
                ATS
              </span>
              {copy.badge(atsPerfect)}
              <ArrowIcon className="size-3.5 text-brand-600 transition-transform group-hover:translate-x-0.5" />
            </Link>

            <h1 className="mt-5 text-4xl font-extrabold tracking-tight text-balance text-ink-950 sm:text-5xl xl:text-[3.4rem] xl:leading-[1.05]">
              {copy.headingBefore}
              <span className="text-gradient-brand">{copy.headingHighlight}</span>
              {copy.headingAfter}
            </h1>

            <p className="mt-5 max-w-xl text-base leading-relaxed text-pretty text-ink-600 sm:text-lg">
              {copy.lede}
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <ButtonLink href="/register" size="lg">
                {copy.primaryCta}
              </ButtonLink>
              <ButtonLink href={copy.browseHref} size="lg" variant="outline">
                {copy.secondaryCta}
              </ButtonLink>
            </div>

            <ul className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2.5 text-sm text-ink-600">
              {trust.map((item) => (
                <li key={item} className="flex items-center gap-1.5">
                  <CheckIcon className="size-3.5 text-success-600" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <FannedPreview />
        </div>
      </div>
    </section>
  );
}
