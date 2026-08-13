import type { Metadata } from 'next';
import Link from 'next/link';

import {
  Breadcrumbs,
  CtaBanner,
  FaqSection,
  Prose,
  RelatedLinks,
  Section,
  SectionHeading,
} from '@/components/marketing/primitives';
import { TemplateGrid } from '@/components/marketing/TemplateStrip';
import { ButtonLink } from '@/components/ui/button';
import { pageMetadata } from '@/lib/seo/metadata';
import {
  TEMPLATE_CATEGORIES,
  TEMPLATE_COUNT,
  TEMPLATES,
  templatesByCategory,
} from '@/lib/cv/template-registry';

export const metadata: Metadata = pageMetadata({
  title: 'CV Templates for International Applications',
  description:
    'CV templates for UK, European and international applications: two-page A4 formats, country-by-country photo and personal-detail conventions, plus a gallery.',
  path: '/cv-templates',
  keywords: [
    'cv templates',
    'international cv format',
    'a4 cv template',
    'european cv template',
    'uk cv template',
    'two page cv',
  ],
});

/* -------------------------------------------------------------------------- */
/* Page data                                                                   */
/* -------------------------------------------------------------------------- */

interface Convention {
  region: string;
  length: string;
  photo: string;
  details: string;
  paper: string;
}

const CONVENTIONS: Convention[] = [
  {
    region: 'United Kingdom & Ireland',
    length: 'Two pages is the working norm; one page for students and graduates.',
    photo: 'Not expected. Leave it off.',
    details:
      'Contact details only. No age, date of birth, nationality or marital status. A city is enough — no street address.',
    paper: 'A4',
  },
  {
    region: 'France',
    length: 'One page early in a career, two once you have a decade behind you.',
    photo: 'Common but entirely optional, and less universal than it once was.',
    details:
      'Some candidates still list age and a driving licence. A compétences block and language levels carry real weight.',
    paper: 'A4',
  },
  {
    region: 'Germany, Austria & Switzerland',
    length:
      'Two pages for the Lebenslauf itself, often sent with a cover letter and scanned certificates.',
    photo:
      'Still widely included, though it cannot be required of you and some large employers now ask you to omit it.',
    details:
      'Date and place of birth are still common. Some candidates date and sign the final page; nobody will reject you for skipping that.',
    paper: 'A4',
  },
  {
    region: 'Netherlands & Nordics',
    length: 'One to two pages, written tightly. Padding is noticed.',
    photo: 'Optional and increasingly left off.',
    details:
      'Date of birth appears sometimes. Nationality or work-permit status is useful if you are applying from outside the EU.',
    paper: 'A4',
  },
  {
    region: 'Morocco & the wider MENA region',
    length: 'One to two pages.',
    photo: 'Usually included.',
    details:
      'Date of birth, nationality and a driving licence are commonly listed. A languages section — Arabic, French, English — is often the first thing read.',
    paper: 'A4',
  },
  {
    region: 'United States & Canada',
    length:
      'One page under roughly ten years of experience, two beyond it. Called a résumé, not a CV.',
    photo: 'No.',
    details:
      'Contact details only. No photo, no date of birth, no marital status, no nationality.',
    paper: 'US Letter',
  },
];

const FAQS = [
  {
    question: 'Should my CV be one page or two?',
    answer:
      'Outside the United States, two pages is the normal length for anyone with a few years of experience, and nobody will hold it against you. One page is right if you are a student, a recent graduate or changing career with little relevant history. What causes problems is not a second page — it is a second page that repeats the first. If page two only carries a hobbies list and a line about references, cut it and keep one strong page.',
  },
  {
    question: 'Do I need a different CV for every country I apply to?',
    answer:
      'Not a different CV, but usually a different version of the same one. The content — roles, dates, achievements, skills — travels unchanged. What you adjust is the top of the document: whether a photo and date of birth appear, whether you mention work eligibility, the paper size, and how long you let it run. Keeping one master CV and exporting regional versions is faster than maintaining several documents that slowly drift apart.',
  },
  {
    question: 'Should I put a photo on my CV?',
    answer:
      'Follow the market you are applying in. A photo is normal in Germany, Austria, Switzerland, much of southern and eastern Europe, and across North Africa and the Middle East. It is best avoided in the UK, Ireland, the United States, Canada and Australia, where many employers prefer not to receive one and some recruitment teams strip it out before a hiring manager sees the file. If you do include one, use a plain head-and-shoulders shot taken against a neutral background in the clothes you would wear to the interview.',
  },
  {
    question: 'Is A4 or US Letter the right paper size?',
    answer:
      'A4 (210 × 297 mm) is the default in the UK, Europe, Africa, Asia, Australia and most of the world. US Letter (8.5 × 11 in) is used in the United States and Canada. A4 is roughly 6 mm narrower and 18 mm taller than Letter, so a document laid out for one and printed on the other either shrinks or spills a line onto a new page. Set the paper size to match the country you are applying in, not the country you are sitting in.',
  },
  {
    question: 'What personal details should I leave off a CV?',
    answer:
      'Leave off your full street address — a city and country is enough and gives away less. Leave off national identifiers such as a social security or national insurance number, which no employer needs before an offer. Leave off marital status, religion, and the number of children you have. Leave off the line "references available on request", which occupies space to say something every employer already assumes. Everything else depends on the region, and the table above covers the common cases.',
  },
  {
    question: 'Is a CV the same thing as a résumé?',
    answer:
      'It depends on who is asking. In the UK, Ireland, most of Europe, Africa, Asia and Australasia, CV is simply the word for a job application document, whatever the job. In the United States and Canada, a CV means the long academic record used for faculty, research and clinical posts, and everyone else sends a one or two page résumé. Read the job posting: the word it uses tells you which document it expects.',
  },
  {
    question: 'Should I write my CV in English or the local language?',
    answer:
      'Write in the language the vacancy is advertised in. A posting written in French expects a French CV, even from an international candidate, and applying in English signals that you did not read it closely. Where a multinational advertises in English for a role based abroad, English is right. If you genuinely cannot tell, English is the safer default for international companies, and keeping a translated version of your master CV costs you one afternoon.',
  },
];

/* -------------------------------------------------------------------------- */
/* Page                                                                        */
/* -------------------------------------------------------------------------- */

export default function CvTemplatesPage() {
  const photoTemplates = TEMPLATES.filter((template) => template.hasPhoto);
  const noPhotoTemplates = TEMPLATES.filter((template) => !template.hasPhoto);

  return (
    <>
      <Section size="sm">
        <Breadcrumbs
          items={[
            { name: 'Home', path: '/' },
            { name: 'CV templates', path: '/cv-templates' },
          ]}
        />
        <SectionHeading
          as="h1"
          align="left"
          eyebrow="CV templates"
          title="CV templates for international applications"
          description={
            <>
              A CV is not a résumé with a different name. It runs longer, it prints on A4, and what
              belongs in the header changes depending on whether you are applying in London,
              Frankfurt, Amsterdam or Casablanca. Start with the conventions of the market you are
              applying in, then pick a design from the {TEMPLATE_COUNT} templates below.
            </>
          }
        />
        <div className="mt-8 flex flex-wrap gap-3">
          <ButtonLink href="/register" size="lg">
            Build your CV — free
          </ButtonLink>
          <ButtonLink href="/templates" size="lg" variant="outline">
            Browse all {TEMPLATE_COUNT} templates
          </ButtonLink>
        </div>
      </Section>

      <Section tone="muted">
        <Prose>
          <h2>What a CV means outside the United States</h2>
          <p>
            The same person applying for the same job in two countries sends two noticeably
            different documents. The career is identical; the conventions are not. Four things
            change: how long it runs, what paper it is laid out for, which personal details belong
            in the header, and whether a photograph appears at all.
          </p>

          <h3>Two pages is normal, and one page is not always better</h3>
          <p>
            A two-page CV is unremarkable in the UK, Ireland, Germany, France, the Netherlands and
            most of the EU. The convention is roughly this: page one carries your summary, your
            current role and the one or two before it; page two carries earlier roles in less
            detail, education, certifications and languages. Compressing fifteen years of work into
            one page is not a sign of discipline in these markets — it usually reads as a document
            that has had its evidence removed. Students and recent graduates are the exception and
            should stay on one page. Academic CVs are a separate genre altogether and can run to
            many pages once publications, grants, supervision and conference talks are listed.
          </p>

          <h3>A4 is the default almost everywhere</h3>
          <p>
            A4 measures 210 × 297 mm; US Letter measures 8.5 × 11 in, or 215.9 × 279.4 mm. A4 is
            about 6 mm narrower and 18 mm taller. That sounds trivial and is not: a layout built for
            Letter and printed on A4 leaves a wide band of empty paper at the foot of every page,
            and a layout built for A4 printed on Letter either scales the type down or pushes your
            last two lines onto a page of their own. Set the paper size before you start writing,
            because the line breaks you tune at the end depend on it.
          </p>

          <h3>The header is where the regional differences live</h3>
          <p>
            Every CV in every market opens with the same core: your name, one phone number with a
            country code, one professional email address, and the city and country you are in. A
            full street address is no longer expected and hands over more than it needs to. A
            LinkedIn URL earns its line if the profile is current; a personal site earns its line if
            there is work on it. Beyond that core, the extras — date of birth, nationality, marital
            status, a driving licence, a photograph — are regional, and adding them where they are
            not expected makes a CV look imported.
          </p>

          <h3>Say something about your right to work</h3>
          <p>
            If you are applying across a border, one short line saves the recruiter a guess and
            saves you a rejection based on one. Something as plain as{' '}
            <strong>EU citizen, no work permit required</strong> or{' '}
            <strong>UK Skilled Worker visa held to 2027</strong> belongs near your contact details.
            Recruiters who cannot tell whether you are employable in their country frequently assume
            you are not.
          </p>
        </Prose>
      </Section>

      <Section>
        <SectionHeading
          align="left"
          title="Country conventions at a glance"
          description="A starting point, not a rulebook. Use it to decide what goes in the header and how long to let the document run."
        />
        <div className="mt-8 overflow-x-auto rounded-xl border border-ink-200">
          <table className="w-full min-w-[52rem] border-collapse text-left text-sm">
            <thead className="bg-ink-50">
              <tr>
                <th scope="col" className="px-4 py-3 font-semibold text-ink-950">
                  Country or region
                </th>
                <th scope="col" className="px-4 py-3 font-semibold text-ink-950">
                  Typical length
                </th>
                <th scope="col" className="px-4 py-3 font-semibold text-ink-950">
                  Photo
                </th>
                <th scope="col" className="px-4 py-3 font-semibold text-ink-950">
                  Personal details
                </th>
                <th scope="col" className="px-4 py-3 font-semibold text-ink-950">
                  Paper
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-200 text-ink-700">
              {CONVENTIONS.map((row) => (
                <tr key={row.region} className="align-top">
                  <th
                    scope="row"
                    className="px-4 py-4 text-left text-[13px] font-semibold text-ink-950"
                  >
                    {row.region}
                  </th>
                  <td className="px-4 py-4 text-[13px] leading-relaxed">{row.length}</td>
                  <td className="px-4 py-4 text-[13px] leading-relaxed">{row.photo}</td>
                  <td className="px-4 py-4 text-[13px] leading-relaxed">{row.details}</td>
                  <td className="px-4 py-4 text-[13px] font-medium whitespace-nowrap">
                    {row.paper}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-5 max-w-3xl text-sm leading-relaxed text-ink-600">
          Conventions vary by employer, sector and even by office. A multinational hiring in Paris
          may screen exactly the way its London team does, a Berlin start-up may want the same
          stripped-back document a San Francisco one would, and public-sector employers everywhere
          tend to be more formal than private ones. Where a posting or an application form states
          what it wants — a length limit, a file format, whether to attach a photograph — follow the
          posting rather than the convention.
        </p>
      </Section>

      <Section tone="muted">
        <SectionHeading
          align="left"
          title="Photo or no photo"
          description="The single decision that most often marks a CV as written for the wrong market."
        />
        <div className="mt-8 grid gap-5 lg:grid-cols-2">
          <div className="rounded-xl border border-ink-200 bg-white p-6">
            <h3 className="text-base font-semibold text-ink-950">Where a photo is normal</h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-600">
              Germany, Austria and Switzerland; much of southern and eastern Europe; Morocco and the
              wider MENA region; and parts of Asia and Latin America. If you include one, treat it
              as part of the document rather than a snapshot: head and shoulders, plain background,
              even lighting, and the clothes you would wear to the interview. Use the same image on
              your LinkedIn profile so the two match. A cropped holiday photograph does more damage
              than no photograph at all.
            </p>
          </div>
          <div className="rounded-xl border border-ink-200 bg-white p-6">
            <h3 className="text-base font-semibold text-ink-950">Where to leave it off</h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-600">
              The UK, Ireland, the United States, Canada and Australia. Employers in these markets
              often ask candidates not to send one, and it is widely reported that some recruitment
              teams remove photographs before a hiring manager sees a file so that shortlisting
              cannot be influenced by them. Including one anyway does not usually get you rejected,
              but it does signal that the CV was written for somewhere else.
            </p>
          </div>
        </div>
        <div className="mt-10">
          <h3 className="text-lg font-bold text-ink-950">
            {photoTemplates.length} templates with a photo block
          </h3>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-ink-600">
            These layouts reserve space for a portrait in the header or the sidebar. The remaining{' '}
            {noPhotoTemplates.length} are designed without one, so nothing collapses awkwardly when
            there is no image to place.
          </p>
          <TemplateGrid className="mt-6" templates={photoTemplates.slice(0, 8)} columns={4} />
        </div>
      </Section>

      <Section>
        <SectionHeading
          align="left"
          title="Browse CV templates by category"
          description="Six families of design. Every one of them exports to A4 or Letter, and you can switch template at any point without retyping anything."
        />
        <div className="mt-10 flex flex-col gap-14">
          {TEMPLATE_CATEGORIES.map((category) => {
            const templates = templatesByCategory(category.id);
            return (
              <div key={category.id}>
                <div className="flex flex-wrap items-end justify-between gap-3">
                  <div className="max-w-2xl">
                    <h3 className="text-lg font-bold text-ink-950">
                      {category.label} CV templates
                      <span className="ml-2 text-sm font-medium text-ink-500">
                        {templates.length} designs
                      </span>
                    </h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-ink-600">{category.blurb}</p>
                  </div>
                  <Link
                    href="/templates"
                    className="text-sm font-semibold text-brand-700 underline underline-offset-2 hover:text-brand-800"
                  >
                    See the full gallery
                  </Link>
                </div>
                <TemplateGrid className="mt-5" templates={templates.slice(0, 5)} columns={5} />
              </div>
            );
          })}
        </div>
      </Section>

      <Section tone="muted">
        <FaqSection
          entries={FAQS}
          description="Length, photos, paper size and the details that change from one country to the next."
        />
      </Section>

      <Section>
        <CtaBanner
          title="Write it once, export it for any market"
          description="Keep one master CV and switch the paper size, the photo block and the template whenever you apply somewhere new. Nothing is retyped."
          primaryLabel="Start your CV — free"
          secondaryHref="/templates"
          secondaryLabel="See every template"
          note="Free plan includes the full editor and PDF download."
        />
        <div className="mt-16">
          <RelatedLinks
            title="Keep reading"
            links={[
              {
                label: 'All templates',
                href: '/templates',
                description: `The full gallery of ${TEMPLATE_COUNT} designs, previewed at full page size.`,
              },
              {
                label: 'Resume templates',
                href: '/resume-templates',
                description: 'The US version: one page, Letter paper, no photo.',
              },
              {
                label: 'ATS CV templates',
                href: '/ats-cv',
                description: 'How applicant tracking systems read a file, and what breaks them.',
              },
              {
                label: 'CV examples by role',
                href: '/cv-examples',
                description: 'Worked rewrites for ten roles and career stages.',
              },
              {
                label: 'What makes a CV professional',
                href: '/professional-cv',
                description: 'Structure, tone and the details recruiters notice.',
              },
              {
                label: 'Online CV builder',
                href: '/cv-builder',
                description: 'The editor, live preview and PDF export explained.',
              },
            ]}
          />
        </div>
      </Section>
    </>
  );
}
