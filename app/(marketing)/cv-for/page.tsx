import Link from 'next/link';
import type { Metadata } from 'next';

import {
  Breadcrumbs,
  CtaBanner,
  Prose,
  RelatedLinks,
  Section,
  SectionHeading,
} from '@/components/marketing/primitives';
import { Badge } from '@/components/ui/feedback';
import { ButtonLink } from '@/components/ui/button';
import { JsonLd } from '@/components/seo/JsonLd';
import { getAllExamples } from '@/lib/cv-examples';
import { getAllProfessions, getProfessionFields } from '@/lib/professions';
import { pageMetadata } from '@/lib/seo/metadata';
import { itemListSchema } from '@/lib/seo/schema';

/**
 * The profession index.
 *
 * A hub page whose only job is to get a visitor to the one guide that is about them, so
 * it groups by field rather than listing ten links alphabetically and hoping. The
 * ItemList structured data is built from the same array the page renders.
 */

export const metadata: Metadata = pageMetadata({
  title: 'CV Advice by Profession — Ten Roles, Written Separately',
  description:
    'CV guidance written per profession: what a hiring manager in that field scans for, the metrics that count, section order, bullet rewrites and templates that suit the role.',
  path: '/cv-for',
  keywords: [
    'cv by profession',
    'cv for my job',
    'cv advice by role',
    'profession cv guide',
    'cv examples by profession',
  ],
});

export default function ProfessionIndexPage() {
  const professions = getAllProfessions();
  const fields = getProfessionFields();
  const examples = getAllExamples();

  return (
    <>
      <Section size="sm">
        <Breadcrumbs
          items={[
            { name: 'Home', path: '/' },
            { name: 'CV examples by profession', path: '/cv-for' },
          ]}
        />
        <SectionHeading
          as="h1"
          align="left"
          eyebrow="By profession"
          title="CV advice written for your profession, not for everyone"
          description={`Ten fields, ten separate guides. Each one covers what a hiring manager in that field reads first, the two to four numbers that carry weight there, the section order that suits the role, three bullet points rewritten, and the templates that fit. Nothing here is one guide with the job title swapped.`}
        />
        <div className="mt-8 flex flex-wrap gap-3">
          <ButtonLink href="/register" size="lg">
            Start your CV — free
          </ButtonLink>
          <ButtonLink href="/cv-examples" size="lg" variant="outline">
            See worked examples
          </ButtonLink>
        </div>
      </Section>

      <Section tone="muted">
        <Prose>
          <h2>Why the advice differs by profession</h2>
          <p>
            The structural rules of a good CV are close to universal: reverse chronological,
            specific verbs, a number wherever one exists, nothing decorative that a parser can
            lose. What is not universal is <strong>which facts belong in the first fifteen
            seconds</strong>, and that changes completely from one field to the next.
          </p>
          <p>
            An accountant is filtered on qualification stage before anyone reads a sentence, so it
            goes in the header. A nurse is filtered on registration and acuity, because the reader
            is mentally building next month’s rota. A software engineer’s skills block belongs
            above the job history; a sales manager’s quota record belongs above everything. Put the
            same four sections in the same order for all four of them and three of the four CVs are
            answering the wrong question first.
          </p>
          <p>
            The metrics diverge just as sharply. Quota attainment, working days to close, cohort
            progress against a departmental average, p99 latency, retail doors, staffing ratio — a
            number only persuades when the reader recognises it as the right kind of number. Each
            guide below names the two to four that count in that field, and shows three real
            bullets being rewritten to use them.
          </p>
          <h3>What each guide contains</h3>
          <ul>
            <li>The order a hiring manager in that field reads your CV in.</li>
            <li>The metrics that carry weight, and what a credible version of each looks like.</li>
            <li>Recommended section order — and the sections to leave off.</li>
            <li>Three weak bullets rewritten, with a note on exactly what changed.</li>
            <li>The keyword families a parser in that job family is likely matching for.</li>
            <li>Mistakes specific to the profession, and two to four templates that suit it.</li>
            <li>A short note on what changes for a US résumé, for the same role.</li>
          </ul>
        </Prose>
      </Section>

      {fields.map((field, index) => (
        <Section key={field.name} tone={index % 2 === 0 ? 'white' : 'muted'}>
          <SectionHeading align="left" title={field.name} />
          <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {field.professions.map((profession) => (
              <article
                key={profession.slug}
                className="relative flex h-full flex-col rounded-2xl border border-ink-200 bg-white p-6 transition-all hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-card"
              >
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-lg font-bold text-ink-950">
                    <Link
                      href={`/cv-for/${profession.slug}`}
                      className="after:absolute after:inset-0 hover:text-brand-700"
                    >
                      {profession.role} CV
                    </Link>
                  </h3>
                  {profession.exampleSlug ? <Badge tone="success">Full example</Badge> : null}
                </div>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-600">
                  {profession.metaDescription}
                </p>
                <p className="mt-4 text-[13px] text-ink-500">
                  Metrics that count: {profession.metrics.map((metric) => metric.name).join(' · ')}
                </p>
              </article>
            ))}
          </div>
        </Section>
      ))}

      <Section>
        <SectionHeading
          align="left"
          eyebrow="Worked examples"
          title="Five of these roles have a complete example CV"
          description="Not a description of a good CV — an actual document, rendered the way it would download, with every choice in it explained section by section."
        />
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {examples.map((example) => (
            <li key={example.slug}>
              <Link
                href={`/cv-examples/${example.slug}`}
                className="group flex h-full flex-col rounded-xl border border-ink-200 bg-white p-5 transition-all hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-card"
              >
                <span className="text-sm font-semibold text-ink-950 group-hover:text-brand-700">
                  {example.role} CV example
                </span>
                <span className="mt-1 text-[13px] leading-relaxed text-ink-600">
                  {example.stage}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </Section>

      <Section tone="muted">
        <RelatedLinks
          title="Related"
          links={[
            {
              label: 'CV examples by role',
              href: '/cv-examples',
              description: 'Ten roles, each with one weak bullet rewritten into a strong one.',
            },
            {
              label: 'ATS-friendly CV templates',
              href: '/ats-cv',
              description: 'What a parser does with your file, and the layouts built to survive it.',
            },
            {
              label: 'Online CV builder',
              href: '/cv-builder',
              description: 'The editor, live preview and PDF export, explained screen by screen.',
            },
            {
              label: 'US résumé conventions',
              href: '/resume-builder',
              description: 'What changes when the same career is written for an American reader.',
            },
            {
              label: 'All templates',
              href: '/templates',
              description: 'Every design, with column counts and parsing scores.',
            },
            {
              label: 'Blog',
              href: '/blog',
              description: 'Longer guides on writing, formatting, ATS and applications.',
            },
          ]}
        />
        <div className="mt-16">
          <CtaBanner
            title="Pick your profession and write the first draft"
            description="Open the editor with a template that suits your field, work through the steps in the guide, and download a PDF when it reads the way you want."
            primaryLabel="Start — free"
            secondaryHref="/templates"
            secondaryLabel="Browse templates"
            note="Free plan includes the editor and PDF download."
          />
        </div>
      </Section>

      <JsonLd
        nodes={[
          itemListSchema(
            professions.map((profession) => ({
              name: `${profession.role} CV guide`,
              path: `/cv-for/${profession.slug}`,
              description: profession.metaDescription,
            })),
            'CV guides by profession',
          ),
        ]}
      />
    </>
  );
}
