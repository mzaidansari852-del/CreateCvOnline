import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import {
  Breadcrumbs,
  CtaBanner,
  Eyebrow,
  FaqSection,
  Prose,
  RelatedLinks,
  Section,
  SectionHeading,
} from '@/components/marketing/primitives';
import { Badge } from '@/components/ui/feedback';
import { ButtonLink } from '@/components/ui/button';
import { CVPagePreview } from '@/components/cv/CVThumbnail';
import {
  getAllExampleSlugs,
  getExample,
  getExampleCustomization,
  getHighlightedBullets,
  getHighlightedRole,
  getRelatedExamples,
} from '@/lib/cv-examples';
import { getProfession } from '@/lib/professions';
import { getTemplate } from '@/lib/cv/template-registry';
import { ogImageUrl, pageMetadata } from '@/lib/seo/metadata';

/**
 * One page per worked example.
 *
 * The document is the page. `CVPagePreview` renders the same `CVData` through the same
 * template code that produces the PDF, so what a visitor reads here is not a picture of
 * a CV or a description of one — it is the CV. Everything below it is commentary on that
 * exact document, and the summary and highlighted bullets are read back out of the data
 * rather than retyped, so the explanation cannot end up describing a different sentence.
 */

export function generateStaticParams(): { role: string }[] {
  return getAllExampleSlugs().map((role) => ({ role }));
}

export async function generateMetadata(props: {
  params: Promise<{ role: string }>;
}): Promise<Metadata> {
  const { role } = await props.params;
  const example = getExample(role);

  if (!example) {
    return pageMetadata({
      title: 'CV example not found',
      description: 'We do not have a worked CV example for this role yet. Browse the others.',
      path: `/cv-examples/${role}`,
      noindex: true,
    });
  }

  return pageMetadata({
    title: example.metaTitle,
    description: example.metaDescription,
    path: `/cv-examples/${example.slug}`,
    keywords: example.keywords,
    image: ogImageUrl(`${example.role} CV example`, example.stage),
  });
}

export default async function CvExamplePage(props: { params: Promise<{ role: string }> }) {
  const { role } = await props.params;
  const example = getExample(role);
  if (!example) notFound();

  const template = getTemplate(example.templateId);
  const customization = getExampleCustomization(example);
  const bullets = getHighlightedBullets(example);
  const highlighted = getHighlightedRole(example);
  const relatedExamples = getRelatedExamples(example.slug, 2);
  const relatedProfessions = example.relatedProfessions.flatMap((slug) => {
    const profession = getProfession(slug);
    return profession ? [profession] : [];
  });

  return (
    <>
      <Section size="sm">
        <Breadcrumbs
          items={[
            { name: 'Home', path: '/' },
            { name: 'CV examples', path: '/cv-examples' },
            { name: example.role, path: `/cv-examples/${example.slug}` },
          ]}
        />
        <SectionHeading
          as="h1"
          align="left"
          eyebrow={`CV example · ${example.stage}`}
          title={example.heading}
          description={example.intro}
        />

        <div className="mt-10 grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-12">
          <div className="rounded-2xl border border-ink-200 bg-ink-50 p-4 sm:p-8">
            <p className="sr-only">
              The example CV, rendered at full page size in the {template.name} template. The full
              text of the summary and the highlighted bullet points is reproduced below in
              selectable form.
            </p>
            {/* The document has its own headings; hide the picture of it from assistive tech. */}
            <div aria-hidden className="flex justify-center">
              <CVPagePreview
                cv={example.cv}
                customization={customization}
                maxWidth={280}
                className="sm:hidden"
              />
              <CVPagePreview
                cv={example.cv}
                customization={customization}
                maxWidth={560}
                className="hidden sm:block"
              />
            </div>
            <p className="mt-5 text-center text-[13px] leading-relaxed text-ink-500">
              {example.fictionNote}
            </p>
          </div>

          <aside className="rounded-2xl border border-ink-200 bg-white p-6 shadow-card lg:sticky lg:top-24">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-base font-bold text-ink-950">This example</h2>
              {template.premium ? <Badge tone="accent">Pro</Badge> : <Badge tone="success">Free</Badge>}
            </div>
            <dl className="mt-4 flex flex-col gap-2.5 text-[13px]">
              <div className="flex items-center justify-between gap-3">
                <dt className="text-ink-600">Role</dt>
                <dd className="text-right font-semibold text-ink-950">{example.role}</dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-ink-600">Stage</dt>
                <dd className="text-right font-semibold text-ink-950">{example.stage}</dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-ink-600">Template</dt>
                <dd className="text-right font-semibold text-ink-950">
                  <Link
                    href={`/templates/${template.slug}`}
                    className="text-brand-700 underline underline-offset-2 hover:text-brand-800"
                  >
                    {template.name}
                  </Link>
                </dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-ink-600">Layout</dt>
                <dd className="text-right font-semibold text-ink-950">
                  {template.columns === 1 ? 'One column' : 'Two columns'}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-ink-600">Parsing score</dt>
                <dd className="text-right font-semibold text-ink-950">{template.atsScore}/5</dd>
              </div>
            </dl>
            <div className="mt-5 flex flex-col gap-2.5">
              <ButtonLink href={`/register?template=${template.id}`} size="lg" fullWidth>
                Start from this example
              </ButtonLink>
              <ButtonLink href="/templates" size="lg" variant="outline" fullWidth>
                Browse other templates
              </ButtonLink>
            </div>
            <p className="mt-3 text-center text-[13px] leading-relaxed text-ink-500">
              Opens the editor with this template selected. Your own content replaces the example —
              nothing here is copied into your CV.
            </p>
          </aside>
        </div>
      </Section>

      <Section tone="muted">
        <SectionHeading
          align="left"
          eyebrow="The text, in full"
          title="The professional summary"
          description="Reproduced as selectable text so you can read it closely, take the structure and write your own version."
        />
        <div className="mt-8 max-w-3xl">
          <blockquote className="rounded-2xl border border-ink-200 bg-white p-6 text-[15px] leading-[1.75] text-ink-800">
            {example.cv.summary}
          </blockquote>
          <p className="mt-4 text-[15px] leading-relaxed text-ink-600">
            <strong className="font-semibold text-ink-950">Why it is written this way:</strong>{' '}
            {example.summaryNote}
          </p>
        </div>
      </Section>

      <Section>
        <SectionHeading
          align="left"
          eyebrow="The text, in full"
          title={`${bullets.length} experience bullets, and why each one works`}
          description={`Taken from the ${highlighted.role} entry at ${highlighted.company} — the current role, which is where the strongest material always belongs.`}
        />
        <ol className="mt-8 flex max-w-3xl flex-col gap-6">
          {bullets.map((bullet, index) => (
            <li key={bullet.text} className="rounded-2xl border border-ink-200 bg-white p-5 sm:p-6">
              <Eyebrow>Bullet {index + 1}</Eyebrow>
              <p className="mt-3 text-[15px] leading-[1.75] text-ink-900">{bullet.text}</p>
              <p className="mt-4 border-t border-ink-100 pt-4 text-sm leading-relaxed text-ink-600">
                {bullet.note}
              </p>
            </li>
          ))}
        </ol>
      </Section>

      <Section tone="muted">
        <SectionHeading
          align="left"
          eyebrow="Section by section"
          title="Why the CV is built the way it is"
          description="Every choice on the page, in the order you meet it — including the things that are deliberately missing."
        />
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {example.commentary.map((entry) => (
            <div key={entry.section} className="rounded-2xl border border-ink-200 bg-white p-6">
              <h3 className="text-base font-bold text-ink-950">{entry.section}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-ink-600">{entry.text}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section>
        <div className="grid gap-10 lg:grid-cols-2">
          <div>
            <SectionHeading
              align="left"
              eyebrow="Adapt it"
              title="What to change if you have less experience"
            />
            <ul className="mt-6 flex flex-col gap-3">
              {example.lessExperience.map((point) => (
                <li key={point} className="flex gap-3 text-[15px] leading-relaxed text-ink-700">
                  <span aria-hidden className="mt-2.5 size-1.5 shrink-0 rounded-full bg-brand-500" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <SectionHeading
              align="left"
              eyebrow="US market"
              title="What to change for a US résumé"
            />
            <ul className="mt-6 flex flex-col gap-3">
              {example.usResume.map((point) => (
                <li key={point} className="flex gap-3 text-[15px] leading-relaxed text-ink-700">
                  <span aria-hidden className="mt-2.5 size-1.5 shrink-0 rounded-full bg-accent-500" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
            <p className="mt-5 text-[15px] leading-relaxed text-ink-600">
              The conventions behind those edits are set out in full on the{' '}
              <Link
                href="/resume-builder"
                className="font-medium text-brand-700 underline underline-offset-2 hover:text-brand-800"
              >
                US résumé guide
              </Link>
              .
            </p>
          </div>
        </div>
      </Section>

      <Section tone="muted">
        <Prose>
          <h2>Use the structure, not the sentences</h2>
          <p>
            Everything above is fictional, and it is meant to be studied rather than copied.
            Recruiters in a given field read hundreds of CVs a month and recognisable phrasing is
            noticeable — the value of a worked example is in showing you what to include, how a
            claim is constructed and where it belongs on the page. The specifics have to be yours,
            because the specifics are the only part that persuades anyone.
          </p>
          <p>
            The most portable things here are the scope line under each employer, the distribution
            of bullets across the roles, and the habit of ending a sentence with a number and its
            method rather than with an adjective. Those three transfer to almost any profession.
            For the advice that does not transfer — the metrics, the section order, the terms a
            parser in your field is matching for — read the{' '}
            <Link href="/cv-for">profession guides</Link>.
          </p>
        </Prose>
      </Section>

      <Section>
        <FaqSection
          entries={example.faq}
          title={`${example.role} CV example: common questions`}
        />
      </Section>

      <Section tone="muted">
        <RelatedLinks
          title="Keep going"
          links={[
            ...relatedProfessions.map((profession) => ({
              label: `${profession.role} CV guide`,
              href: `/cv-for/${profession.slug}`,
              description: profession.metaDescription,
            })),
            ...relatedExamples.map((related) => ({
              label: `${related.role} CV example`,
              href: `/cv-examples/${related.slug}`,
              description: `A full worked document — ${related.stage.toLowerCase()}.`,
            })),
            {
              label: 'All CV examples',
              href: '/cv-examples',
              description: 'Ten roles, each with one weak bullet rewritten into a strong one.',
            },
            {
              label: 'ATS-friendly CV templates',
              href: '/ats-cv',
              description: 'What a parser does with your file, and the layouts built to survive it.',
            },
          ]}
        />
        <div className="mt-16">
          <CtaBanner
            title={`Start from this ${example.role.toLowerCase()} example`}
            description="Open the editor with the same template already selected, then replace the content with your own. Switching to another design later keeps every word you have written."
            primaryHref={`/register?template=${template.id}`}
            primaryLabel="Start from this example"
            secondaryHref="/cv-for"
            secondaryLabel="Read the profession guide"
            note={
              template.premium
                ? 'Free to start. A Pro or Lifetime plan unlocks this design and every other one.'
                : 'Free plan, free download, no credit card.'
            }
          />
        </div>
      </Section>
    </>
  );
}
