import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import {
  Breadcrumbs,
  CtaBanner,
  Eyebrow,
  FaqSection,
  FeatureGrid,
  Prose,
  RelatedLinks,
  Section,
  SectionHeading,
  StepList,
} from '@/components/marketing/primitives';
import { TemplateGrid } from '@/components/marketing/TemplateStrip';
import { ButtonLink } from '@/components/ui/button';
import { JsonLd } from '@/components/seo/JsonLd';
import { getExample } from '@/lib/cv-examples';
import {
  getAllProfessionSlugs,
  getProfession,
  getRecommendedTemplates,
  getRelatedProfessions,
} from '@/lib/professions';
import { ogImageUrl, pageMetadata } from '@/lib/seo/metadata';
import { howToSchema } from '@/lib/seo/schema';

/**
 * One page per profession.
 *
 * All ten are statically generated from `content/professions`. Nothing on this page is
 * templated copy with a job title substituted in: the scan order, the metrics, the
 * section plan, the rewrites and the keyword families are all written per profession,
 * because a sales manager's quota attainment and a teacher's cohort progress are not the
 * same advice wearing different nouns.
 */

export function generateStaticParams(): { profession: string }[] {
  return getAllProfessionSlugs().map((profession) => ({ profession }));
}

export async function generateMetadata(props: {
  params: Promise<{ profession: string }>;
}): Promise<Metadata> {
  const { profession: slug } = await props.params;
  const profession = getProfession(slug);

  if (!profession) {
    return pageMetadata({
      title: 'Profession not found',
      description:
        'We do not have a CV guide for this profession yet. Browse the guides we do have instead.',
      path: `/cv-for/${slug}`,
      noindex: true,
    });
  }

  return pageMetadata({
    title: profession.metaTitle,
    description: profession.metaDescription,
    path: `/cv-for/${profession.slug}`,
    keywords: profession.keywords,
    image: ogImageUrl(`${profession.role} CV`, 'What to write, and what to leave out'),
  });
}

export default async function ProfessionPage(props: {
  params: Promise<{ profession: string }>;
}) {
  const { profession: slug } = await props.params;
  const profession = getProfession(slug);
  if (!profession) notFound();

  const recommended = getRecommendedTemplates(profession);
  const related = getRelatedProfessions(profession.slug, 3);
  const workedExample = profession.exampleSlug ? getExample(profession.exampleSlug) : undefined;

  return (
    <>
      <Section size="sm">
        <Breadcrumbs
          items={[
            { name: 'Home', path: '/' },
            { name: 'CV examples by profession', path: '/cv-for' },
            { name: profession.role, path: `/cv-for/${profession.slug}` },
          ]}
        />
        <SectionHeading
          as="h1"
          align="left"
          eyebrow={`CV advice for ${profession.rolePlural}`}
          title={profession.heading}
          description={profession.intro}
        />
        <div className="mt-8 flex flex-wrap gap-3">
          <ButtonLink href="/register" size="lg">
            Write yours — free
          </ButtonLink>
          {workedExample ? (
            <ButtonLink href={`/cv-examples/${workedExample.slug}`} size="lg" variant="outline">
              See a full worked example
            </ButtonLink>
          ) : (
            <ButtonLink href="/cv-examples" size="lg" variant="outline">
              See worked examples
            </ButtonLink>
          )}
        </div>
      </Section>

      <Section tone="muted">
        <Prose>
          {profession.overview.map((paragraph) => (
            <p key={paragraph.slice(0, 40)}>{paragraph}</p>
          ))}
        </Prose>
      </Section>

      <Section>
        <SectionHeading
          align="left"
          eyebrow="The first minute"
          title={`What a hiring manager reads first — and in what order`}
          description={`Four things, in this sequence. Everything else on your CV is read in the light of them, so anything that answers one of these belongs above the fold rather than on page two.`}
        />
        <div className="mt-10">
          <StepList
            steps={profession.scanOrder.map((step) => ({
              title: step.title,
              description: step.description,
            }))}
          />
        </div>
      </Section>

      <Section tone="muted">
        <SectionHeading
          align="left"
          eyebrow="Numbers that carry weight"
          title={`The metrics that actually matter for ${profession.rolePlural}`}
          description="Not every profession is measured the same way, and using the wrong kind of number is close to using none at all. These are the figures a reader in this field recognises immediately."
        />
        <div className="mt-10">
          <FeatureGrid
            items={profession.metrics.map((metric) => ({
              title: metric.name,
              description: metric.detail,
            }))}
            columns={profession.metrics.length === 4 ? 4 : 3}
          />
        </div>
      </Section>

      <Section>
        <SectionHeading
          align="left"
          eyebrow="Structure"
          title="Section order for this role — and what to drop"
          description="Section order is the cheapest edit available to you and one of the most effective. This is the sequence that suits the way this profession is read."
        />
        <div className="mt-10 grid gap-8 lg:grid-cols-2">
          <div className="rounded-2xl border border-ink-200 bg-white p-6">
            <h3 className="text-lg font-bold text-ink-950">Recommended order</h3>
            <ol className="mt-5 flex flex-col gap-4">
              {profession.sectionPlan.order.map((entry, index) => (
                <li key={entry.section} className="flex gap-3">
                  <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-brand-600 text-xs font-bold text-white">
                    {index + 1}
                  </span>
                  <span>
                    <span className="block text-sm font-semibold text-ink-950">{entry.section}</span>
                    <span className="mt-1 block text-sm leading-relaxed text-ink-600">
                      {entry.note}
                    </span>
                  </span>
                </li>
              ))}
            </ol>
          </div>
          <div className="rounded-2xl border border-ink-200 bg-ink-50 p-6">
            <h3 className="text-lg font-bold text-ink-950">Leave these off</h3>
            <ul className="mt-5 flex flex-col gap-4">
              {profession.sectionPlan.drop.map((entry) => (
                <li key={entry.section} className="flex gap-3">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden
                    className="mt-0.5 shrink-0 text-ink-400"
                  >
                    <circle cx="12" cy="12" r="9.5" stroke="currentColor" strokeWidth="1.6" opacity="0.4" />
                    <path d="M9 9l6 6m0-6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                  <span>
                    <span className="block text-sm font-semibold text-ink-950">{entry.section}</span>
                    <span className="mt-1 block text-sm leading-relaxed text-ink-600">
                      {entry.note}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      <Section tone="muted">
        <SectionHeading
          align="left"
          eyebrow="Before and after"
          title="Three bullets rewritten"
          description="The same work, described twice. What changes is not the vocabulary but what the sentence is willing to commit to."
        />
        <div className="mt-10 flex flex-col gap-6">
          {profession.rewrites.map((rewrite, index) => (
            <article key={rewrite.before} className="rounded-2xl border border-ink-200 bg-white p-5 sm:p-7">
              <Eyebrow>Rewrite {index + 1}</Eyebrow>
              <div className="mt-4 grid gap-4 lg:grid-cols-2">
                <div className="rounded-lg border border-ink-200 bg-ink-50 p-4">
                  <p className="text-2xs font-bold tracking-[0.12em] text-ink-500 uppercase">
                    Weak bullet
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-ink-700">{rewrite.before}</p>
                </div>
                <div className="rounded-lg border border-success-500/30 bg-success-50 p-4">
                  <p className="text-2xs font-bold tracking-[0.12em] text-success-700 uppercase">
                    Rewritten
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-ink-800">{rewrite.after}</p>
                </div>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-ink-600">
                <strong className="font-semibold text-ink-950">What changed:</strong> {rewrite.change}
              </p>
            </article>
          ))}
        </div>
      </Section>

      <Section id="ats">
        <SectionHeading
          align="left"
          eyebrow="Parsers and keywords"
          title={`What a parser is likely matching for in ${profession.rolePlural}`}
          description="Screening behaviour differs from employer to employer, so treat this as a checklist of terms you have genuinely earned — not a list to paste in."
        />
        <div className="mt-8 grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_340px]">
          <Prose>
            {profession.ats.intro.map((paragraph) => (
              <p key={paragraph.slice(0, 40)}>{paragraph}</p>
            ))}
            <p>
              <Link href="/ats-cv">How applicant tracking systems read a CV</Link> covers the
              mechanics in more detail, and the{' '}
              <Link href="/templates?category=ats">ATS-friendly templates</Link> are the layouts
              least likely to lose any of this.
            </p>
          </Prose>
          <div className="rounded-2xl border border-ink-200 bg-ink-50 p-6">
            <span className="text-2xs font-bold tracking-[0.12em] text-ink-500 uppercase">
              Terms in this job family
            </span>
            <dl className="mt-4 flex flex-col gap-4">
              {profession.ats.groups.map((group) => (
                <div key={group.group}>
                  <dt className="text-[13px] font-semibold text-ink-950">{group.group}</dt>
                  <dd className="mt-1.5 flex flex-wrap gap-1.5">
                    {group.examples.map((example) => (
                      <span
                        key={example}
                        className="rounded-md border border-ink-200 bg-white px-2 py-0.5 text-xs text-ink-700"
                      >
                        {example}
                      </span>
                    ))}
                  </dd>
                </div>
              ))}
            </dl>
            <p className="mt-5 text-[13px] leading-relaxed text-ink-600">
              {profession.ats.caveat}
            </p>
          </div>
        </div>
      </Section>

      <Section tone="muted">
        <SectionHeading
          align="left"
          eyebrow="Avoid these"
          title={`Mistakes specific to ${profession.rolePlural}`}
          description="Not the generic list. These are the failures that recur in this field in particular, and that a reader in it will notice immediately."
        />
        <div className="mt-10">
          <FeatureGrid
            items={profession.mistakes.map((mistake) => ({
              title: mistake.title,
              description: mistake.description,
            }))}
            columns={3}
          />
        </div>
      </Section>

      <Section>
        <SectionHeading
          align="left"
          eyebrow="Build order"
          title={`How to write it, in ${profession.steps.length} steps`}
          description="Written in the order that wastes least time: gather the facts first, then shape them, then cut."
        />
        <ol className="mt-10 flex max-w-3xl flex-col gap-6">
          {profession.steps.map((step, index) => (
            <li key={step.name} className="flex gap-4">
              <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-full bg-brand-600 text-sm font-bold text-white">
                {index + 1}
              </span>
              <div>
                <h3 className="text-base font-semibold text-ink-950">{step.name}</h3>
                <p className="mt-1.5 text-[15px] leading-relaxed text-ink-600">{step.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </Section>

      <Section tone="muted">
        <SectionHeading
          align="left"
          eyebrow="Templates"
          title={`${recommended.length} templates that suit this role`}
          description="Chosen for how this profession is actually read, not for how they look in a gallery. You can switch between any of them later without retyping a word."
        />
        <TemplateGrid
          className="mt-8"
          templates={recommended.map((pick) => pick.template)}
          columns={3}
        />
        <ul className="mt-8 flex max-w-3xl flex-col gap-4">
          {recommended.map((pick) => (
            <li key={pick.template.id} className="text-[15px] leading-relaxed text-ink-700">
              <Link
                href={`/templates/${pick.template.slug}`}
                className="font-semibold text-brand-700 underline underline-offset-2 hover:text-brand-800"
              >
                {pick.template.name}
              </Link>{' '}
              <span className="text-ink-500">
                ({pick.template.columns === 1 ? 'one column' : 'two columns'}, parsing score{' '}
                {pick.template.atsScore}/5)
              </span>{' '}
              — {pick.reason}
            </li>
          ))}
        </ul>
      </Section>

      <Section>
        <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div>
            <SectionHeading
              align="left"
              eyebrow="US market"
              title={`If you are applying for a US résumé instead`}
              description={profession.us.intro}
            />
            <ul className="mt-6 flex max-w-3xl flex-col gap-3">
              {profession.us.points.map((point) => (
                <li key={point} className="flex gap-3 text-[15px] leading-relaxed text-ink-700">
                  <span aria-hidden className="mt-2.5 size-1.5 shrink-0 rounded-full bg-brand-500" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-ink-200 bg-ink-50 p-6">
            <h3 className="text-base font-bold text-ink-950">One document, two versions</h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-600">
              The advice above is the same profession, not a different one — which is why there is
              no separate résumé guide for this role. Keep one document, switch the paper size to
              US Letter, trim to a page and remove anything personal.
            </p>
            <div className="mt-5 flex flex-col gap-2.5">
              <ButtonLink href="/resume-builder" variant="outline" fullWidth>
                US résumé conventions
              </ButtonLink>
              <ButtonLink href="/resume-templates" variant="ghost" fullWidth>
                One-page résumé templates
              </ButtonLink>
            </div>
          </div>
        </div>
      </Section>

      <Section tone="muted">
        <FaqSection
          entries={profession.faq}
          title={`${profession.role} CVs: common questions`}
          description="The questions that come up repeatedly in this field, answered without hedging."
        />
      </Section>

      <Section>
        <RelatedLinks
          title="Related guides"
          links={[
            ...related.map((item) => ({
              label: `${item.role} CV`,
              href: `/cv-for/${item.slug}`,
              description: item.metaDescription,
            })),
            ...(workedExample
              ? [
                  {
                    label: `${workedExample.role} CV example`,
                    href: `/cv-examples/${workedExample.slug}`,
                    description:
                      'A full worked document for this role, with the reasoning written out beside it.',
                  },
                ]
              : []),
            {
              label: 'CV examples by role',
              href: '/cv-examples',
              description: 'Ten roles, each with a weak bullet rewritten into a strong one.',
            },
            {
              label: 'ATS-friendly CV templates',
              href: '/ats-cv',
              description: 'What a parser does with your file, and the layouts built to survive it.',
            },
            {
              label: 'Online CV builder',
              href: '/cv-builder',
              description: 'Write, reorder and export without fighting a word processor.',
            },
            {
              label: 'All professions',
              href: '/cv-for',
              description: 'Every profession guide, grouped by field.',
            },
          ]}
        />
      </Section>

      <Section size="sm" tone="muted">
        <CtaBanner
          title={`Write your ${profession.role.toLowerCase()} CV tonight`}
          description="Open the editor with one of the templates above, work through the five steps, and download a PDF when it reads the way you want. Switching template later keeps every word."
          primaryLabel="Start — free"
          secondaryHref={workedExample ? `/cv-examples/${workedExample.slug}` : '/cv-examples'}
          secondaryLabel={workedExample ? 'Read the worked example' : 'See CV examples'}
          note="Free plan includes the editor and PDF download."
        />
      </Section>

      <JsonLd
        nodes={[
          howToSchema({
            name: `How to write a ${profession.role.toLowerCase()} CV`,
            description: profession.metaDescription,
            steps: profession.steps.map((step) => ({ name: step.name, text: step.text })),
          }),
        ]}
      />
    </>
  );
}
