import type { Metadata } from 'next';

import {
  Breadcrumbs,
  CtaBanner,
  FaqSection,
  Prose,
  RelatedLinks,
  Section,
  SectionHeading,
} from '@/components/marketing/primitives';
import { TemplateCard, TemplateGrid } from '@/components/marketing/TemplateStrip';
import { ButtonLink } from '@/components/ui/button';
import { Badge } from '@/components/ui/feedback';
import { pageMetadata } from '@/lib/seo/metadata';
import { getTemplateBySlug, TEMPLATES } from '@/lib/cv/template-registry';

export const metadata: Metadata = pageMetadata({
  title: 'Resume Templates for US Hiring',
  description:
    'Resume templates built for US conventions: one page, Letter paper, no photo, reverse-chronological order and a summary. Six recommended layouts with reasons.',
  path: '/resume-templates',
  keywords: [
    'resume templates',
    'us resume format',
    'one page resume template',
    'letter size resume',
    'professional resume template',
    'reverse chronological resume',
  ],
});

/* -------------------------------------------------------------------------- */
/* Page data                                                                   */
/* -------------------------------------------------------------------------- */

const PICKS: { slug: string; headline: string; why: string }[] = [
  {
    slug: 'ats-resume',
    headline: 'The safe default for portal applications',
    why: 'One column, no rules, no tinted panels and section headings a parser has seen ten thousand times. If you are uploading to a company careers portal and have no other information to go on, this is the version to send.',
  },
  {
    slug: 'modern-professional',
    headline: 'A little design, none of the risk',
    why: 'A single accent colour on the headings and nothing else decorative. It reads as a considered document rather than a plain-text dump, while keeping every line in one uninterrupted reading order.',
  },
  {
    slug: 'modern-clean',
    headline: 'Tight vertical rhythm for a full page',
    why: 'The spacing between sections is deliberately compact, which is what lets eight or nine years of work land on one page without dropping the type size. Choose this when you are one or two lines over.',
  },
  {
    slug: 'entry-level-resume',
    headline: 'Education before experience',
    why: 'Ordered the way a graduate resume should be: degree and coursework near the top, internships and part-time work below. It gives a short history a full page without padding it with filler sections.',
  },
  {
    slug: 'business-professional-cv',
    headline: 'For finance, consulting and corporate roles',
    why: 'Restrained typography, generous margins and a strong summary block at the top. It suits the sectors where a resume is judged on rigour first and the reader expects to find every date without hunting.',
  },
  {
    slug: 'simple-classic-cv',
    headline: 'When you know nothing about the reader',
    why: 'Black text, bold headings, no rules or boxes anywhere. It photocopies, prints, scans and parses identically, which matters for government, legal, healthcare and any employer still working from paper.',
  },
];

const FAQS = [
  {
    question: 'How long should a US resume be?',
    answer:
      'One page is the expectation for anyone with under roughly ten years of experience, and it is the safest choice for almost every applicant below director level. Two pages is accepted once you have a long record with genuinely different roles on it, and is normal in academia, medicine and for federal applications, which follow their own rules entirely. The failure mode is not length itself — it is a second page that adds nothing. If page two would be education, a certifications list and three lines of skills, move them up and stay on one page.',
  },
  {
    question: 'Should I write a summary or an objective?',
    answer:
      'A summary in almost every case. An objective states what you want from the employer; a summary states what the employer gets from you, and only one of those is interesting to a reader deciding whether to keep reading. Three or four lines: your title, your years in the field, the two or three things you are measurably good at, and the kind of role you are moving toward. An objective still has a narrow use for genuine career changers and first-time applicants, where the question "why is this person applying at all?" needs answering in the first two seconds.',
  },
  {
    question: 'Is a two-column resume a problem in the US?',
    answer:
      'Less than it is usually made out to be. Plenty of modern applicant tracking systems handle a clean two-column layout without trouble, and plenty of human recruiters find the sidebar useful. The risk is not the columns — it is what people put in them: skill rating bars, icons instead of labels, and contact details tucked into a coloured band. If you want a sidebar, keep it to text, and keep a single-column version for portals that mangle the layout.',
  },
  {
    question: 'Should employment dates include months, or just years?',
    answer:
      'Include months. Years alone (2021 – 2023) is a common way to disguise a short tenure or a gap, and experienced recruiters read it that way whether or not you meant it. Use a consistent format throughout — Mar 2021 – Jun 2023 — and use the same one in every entry. If you have a genuine gap, it is far better to show it and account for it in one line than to blur the dates and invite the question in the interview.',
  },
  {
    question: 'Do I need to list every job I have ever had?',
    answer:
      'No. A resume is a targeted document, not an employment history. The usual approach is full detail for the last ten to fifteen years and a single condensed line for anything before that: "Earlier roles: Analyst positions at two regional banks, 2009 – 2014." Short, unrelated jobs from a decade ago can be dropped entirely. What you cannot do is misrepresent dates to hide a role, because background checks in the US routinely verify employment dates and titles.',
  },
  {
    question: 'Should I include my GPA and graduation year?',
    answer:
      'Include a GPA only if it is strong and you graduated within roughly the last three years; after that, your work record answers the same question better. The graduation year is more contested. Leaving it off is a common tactic against age screening, but a degree with no date also stands out, and many application forms ask for it anyway. The pragmatic answer for a long career is to keep the degree and the institution, drop the year, and let the dated work history speak.',
  },
  {
    question: 'How do I handle a career break on a resume?',
    answer:
      'Name it briefly and move on. A dated line — "Career break, 2022 – 2023: full-time caregiving; completed AWS Solutions Architect certification" — closes the question in one reading. Breaks for caregiving, health, study, relocation and redundancy are ordinary and increasingly expected, and several large employers now run explicit returner programmes. What draws attention is an unexplained eighteen-month hole between two dated jobs, because the reader fills it in themselves.',
  },
];

/* -------------------------------------------------------------------------- */
/* Page                                                                        */
/* -------------------------------------------------------------------------- */

export default function ResumeTemplatesPage() {
  const picks = PICKS.flatMap((pick) => {
    const template = getTemplateBySlug(pick.slug);
    return template ? [{ ...pick, template }] : [];
  });

  const usStyle = TEMPLATES.filter(
    (template) => template.columns === 1 && !template.hasPhoto && template.atsScore >= 4,
  );

  return (
    <>
      <Section size="sm">
        <Breadcrumbs
          items={[
            { name: 'Home', path: '/' },
            { name: 'Resume templates', path: '/resume-templates' },
          ]}
        />
        <SectionHeading
          as="h1"
          align="left"
          eyebrow="Resume templates"
          title="Resume templates that follow US hiring conventions"
          description="A US resume is a shorter, plainer document than a CV, and the conventions are unusually consistent: one page, Letter paper, no photograph, reverse-chronological, and a summary rather than an objective. Every template below is chosen to fit that shape rather than fight it."
        />
        <div className="mt-8 flex flex-wrap gap-3">
          <ButtonLink href="/register" size="lg">
            Build your resume — free
          </ButtonLink>
          <ButtonLink href="/templates" size="lg" variant="outline">
            Browse the full gallery
          </ButtonLink>
        </div>
      </Section>

      <Section tone="muted">
        <Prose>
          <h2>What US recruiters expect</h2>
          <p>
            The conventions below are not aesthetic preferences. Most of them exist because a US
            hiring process is legally cautious, moves quickly through a large volume of
            applications, and expects the same information in the same order every time. Meeting
            them costs you nothing and removes every reason to put your file down early.
          </p>

          <h3>One page, until roughly ten years in</h3>
          <p>
            Under about a decade of experience, a resume that runs to two pages usually means the
            first page has not been edited. Beyond a decade, or in academia, medicine and federal
            hiring, two or more pages is normal. The test is not the page count but whether the
            second page is carrying its weight: if it holds a skills list and your degree, it does
            not.
          </p>

          <h3>US Letter, not A4</h3>
          <p>
            Letter is 8.5 × 11 in, wider and shorter than A4. Sending an A4 layout to a US employer
            is not fatal — most files are read on screen — but if it is printed for a panel
            interview it prints with an odd margin or scales down slightly, and the line breaks you
            carefully tuned move. Set the paper size to Letter before you spend an hour on spacing.
          </p>

          <h3>No photo, no date of birth, no marital status</h3>
          <p>
            Leave all three off. US employers are cautious about receiving information that could
            later be said to have influenced a hiring decision, and it is widely reported that some
            recruitment teams will not forward a resume that carries a photograph. Nationality,
            religion, gender and number of children have no place on the document either. The only
            personal information a US resume needs is a name, a phone number, an email address, a
            city and state, and a LinkedIn URL if the profile is worth reading.
          </p>

          <h3>Reverse-chronological, with dates that survive scrutiny</h3>
          <p>
            Most recent role first, then backwards. Purely functional resumes — skills grouped by
            theme with the employment history buried at the bottom — are read as an attempt to hide
            something, fairly or not. A hybrid, where a short skills or core-competencies block sits
            above a full reverse-chronological history, is perfectly acceptable. Include months as
            well as years, and keep one date format throughout.
          </p>

          <h3>A summary, not an objective</h3>
          <p>
            The three or four lines under your name are the most re-read part of the document. Use
            them to state what you are, how long you have done it and what you are demonstrably good
            at: <em>Supply chain analyst, six years in consumer goods. Owns demand forecasting for a
            400-SKU portfolio; cut stockouts by a third in eighteen months.</em> That is a summary.{' '}
            <em>Seeking a challenging role where I can grow my skills</em> is an objective, and it
            tells the reader nothing they can act on.
          </p>
        </Prose>
      </Section>

      <Section>
        <SectionHeading
          align="left"
          title="Six templates that match those conventions"
          description="All single-column, all designed for a full page without padding, all free to use on the starter plan unless marked otherwise."
        />
        <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {picks.map((pick) => (
            <div key={pick.template.id} className="flex flex-col">
              <TemplateCard template={pick.template} width={280} />
              <div className="mt-4">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-[15px] font-bold text-ink-950">{pick.headline}</h3>
                  <Badge tone="brand">ATS {pick.template.atsScore}/5</Badge>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-ink-600">{pick.why}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section tone="muted">
        <Prose>
          <h2>Cutting a long career down to one page</h2>
          <p>
            Almost nobody writes a one-page resume; they edit one. The order below removes the most
            space for the least loss, and it is worth doing in that order rather than starting with
            the font size.
          </p>
          <ul>
            <li>
              <strong>Condense anything older than fifteen years into one line.</strong> A single
              &ldquo;Earlier roles&rdquo; entry with titles, employers and a date range preserves the
              record and reclaims a third of a page.
            </li>
            <li>
              <strong>Ration your bullets by recency.</strong> Four or five for the current role,
              two or three for the one before, one for anything older. Nobody is hiring you for what
              you did in 2013.
            </li>
            <li>
              <strong>Delete every bullet that describes the job rather than your work in it.</strong>{' '}
              &ldquo;Responsible for managing the monthly close&rdquo; is the job description.
              &ldquo;Cut the monthly close from nine days to five&rdquo; is you.
            </li>
            <li>
              <strong>Trim the skills list to what you would happily be tested on.</strong> A
              twenty-item list dilutes the five things you are actually strong at, and interviewers
              do pick from it.
            </li>
            <li>
              <strong>Put contact details on one line.</strong> City, state, phone, email and
              LinkedIn fit comfortably across a single line under your name and save four.
            </li>
            <li>
              <strong>Drop interests unless they are relevant.</strong> Marathon running is not
              evidence. A part-time role coaching a youth team is, if you are applying to manage
              people.
            </li>
          </ul>
          <p>
            What not to do: shrink the body text below about 10pt, cut margins below half an inch,
            or reduce the line spacing until the page is grey. A cramped resume signals a candidate
            who could not decide what mattered, which is precisely the impression the edit was meant
            to avoid.
          </p>
        </Prose>
      </Section>

      <Section>
        <SectionHeading
          align="left"
          title="Single-column, no-photo layouts"
          description={`${usStyle.length} of the templates are one column with no photo block and a strong parsing score — the exact shape a US resume is expected to take.`}
        />
        <TemplateGrid className="mt-8" templates={usStyle.slice(0, 10)} columns={5} />
        <p className="mt-6 text-sm text-ink-600">
          Switching template never changes your content: the same data renders into any of the{' '}
          {TEMPLATES.length} designs, so you can compare two layouts side by side and export
          whichever one holds your history on a single page.
        </p>
      </Section>

      <Section tone="muted">
        <FaqSection
          entries={FAQS}
          description="Length, dates, summaries and the questions that come up when a CV is rewritten for the US market."
        />
      </Section>

      <Section>
        <CtaBanner
          title="Get it onto one page tonight"
          description="Pick a single-column template, paste in your history and watch the page break as you edit. Export to PDF when it fits."
          primaryLabel="Start your resume — free"
          secondaryHref="/resume-examples"
          secondaryLabel="See before-and-after rewrites"
          note="No credit card. Letter and A4 both supported."
        />
        <div className="mt-16">
          <RelatedLinks
            title="Related reading"
            links={[
              {
                label: 'Resume examples',
                href: '/resume-examples',
                description: 'Four full before-and-after rewrites, with notes on every change.',
              },
              {
                label: 'ATS resume guide',
                href: '/ats-resume',
                description: 'Keywords, file names and .docx versus PDF for job portals.',
              },
              {
                label: 'CV templates',
                href: '/cv-templates',
                description: 'The international counterpart: two pages, A4, regional conventions.',
              },
              {
                label: 'All templates',
                href: '/templates',
                description: 'Every design, previewed at full page size.',
              },
              {
                label: 'Online CV builder',
                href: '/cv-builder',
                description: 'Live preview, section reordering and instant PDF export.',
              },
              {
                label: 'Pricing',
                href: '/pricing',
                description: 'What the free plan covers and what Pro unlocks.',
              },
            ]}
          />
        </div>
      </Section>
    </>
  );
}
