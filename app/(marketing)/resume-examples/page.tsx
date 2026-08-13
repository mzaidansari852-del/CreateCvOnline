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
import { Badge } from '@/components/ui/feedback';
import { ButtonLink } from '@/components/ui/button';
import { pageMetadata } from '@/lib/seo/metadata';
import { getTemplateBySlug } from '@/lib/cv/template-registry';

export const metadata: Metadata = pageMetadata({
  title: 'Resume Examples: Before and After Rewrites',
  description:
    'Four resume rewrites shown side by side — a summary, an experience block, a skills section and a career-change reframe — with notes on exactly what changed.',
  path: '/resume-examples',
  keywords: [
    'resume examples',
    'before and after resume',
    'resume summary examples',
    'resume bullet points',
    'resume skills section',
    'career change resume',
  ],
});

/* -------------------------------------------------------------------------- */
/* Page data                                                                   */
/* -------------------------------------------------------------------------- */

type BlockLayout = 'paragraph' | 'bullets' | 'lines';

interface RewriteBlock {
  header?: string;
  layout: BlockLayout;
  lines: string[];
}

interface CaseStudy {
  element: string;
  title: string;
  context: string;
  before: RewriteBlock;
  after: RewriteBlock;
  changes: string[];
  templateSlug: string;
}

const CASE_STUDIES: CaseStudy[] = [
  {
    element: 'Professional summary',
    title: 'Store manager applying for a district manager role',
    context:
      'Seven years in specialty retail, currently running one large store, applying for a multi-site role. The original summary was the first four lines the hiring panel would read, and it said nothing that could be checked.',
    before: {
      layout: 'paragraph',
      lines: [
        'Results-driven retail professional with a proven track record of success in fast-paced environments. Excellent communication and leadership skills. Passionate about delivering outstanding customer service and motivated to take on new challenges within a dynamic organisation.',
      ],
    },
    after: {
      layout: 'paragraph',
      lines: [
        'Store manager with seven years in specialty retail, currently running a $4.2M flagship with 32 staff. Took the lowest-ranked store in a 14-store region to top three on both sales per hour and shrink within two years. Promoted twice; trained four assistant managers who now run their own sites.',
      ],
    },
    changes: [
      'Every adjective that a competing candidate could also claim came out. “Results-driven”, “proven track record” and “fast-paced” appear on a large share of retail resumes and carry no information whatsoever.',
      'Store volume and headcount moved into the first sentence. A district manager hiring reads volume as a proxy for the complexity you can handle, and $4.2M with 32 staff answers that before the experience section is reached.',
      'The two numbers the function is genuinely run on — sales per hour and shrink — replaced “outstanding customer service”, which is an aspiration rather than a measure.',
      'The promotion history and the four managers trained were added, because a district role is largely a people-development job and that is the only evidence in the document for it.',
      'The word count barely moved. Four sentences before, three after — the difference is that every clause in the second version is falsifiable.',
    ],
    templateSlug: 'operations-cv',
  },
  {
    element: 'Experience block',
    title: 'Data analyst applying for a senior analyst role',
    context:
      'Four years at one employer, strong work, invisible on paper. The entry listed the tools and the meetings but never said what the analyst was responsible for or what changed because of them.',
    before: {
      header: 'Data Analyst, Northbrook Health — 2021–Present',
      layout: 'bullets',
      lines: [
        'Responsible for creating reports and dashboards for various stakeholders.',
        'Used SQL and Tableau to analyse data.',
        'Assisted with data quality initiatives.',
        'Attended weekly meetings with business teams to gather requirements.',
      ],
    },
    after: {
      header: 'Data Analyst, Northbrook Health — Mar 2021 – Present',
      layout: 'bullets',
      lines: [
        'Own the claims analytics layer: 40+ dbt models over roughly 120M rows, refreshed nightly and relied on by finance, clinical operations and the actuarial team.',
        'Replaced a 30-tab spreadsheet reforecast with a Tableau model, cutting the monthly cycle from six days to one; it is now the figure the CFO reports to the board.',
        'Found and corrected a mapping error in the provider dimension that had overstated out-of-network spend by around $1.8M a quarter for three quarters.',
        'Built the SQL onboarding path now used by every new analyst — five hires through it since January 2023.',
      ],
    },
    changes: [
      '“Responsible for” became “own”, and the scope came with it: the named layer, the model count, the row count, the refresh cadence and the three teams that depend on it.',
      'The tools stopped being a bullet of their own. A line that says only “Used SQL and Tableau” is a keyword hiding from its evidence; both terms now appear inside sentences describing what was built with them.',
      'The error-catch bullet was added. Analysts are hired to notice things, and finding a mapping fault that had been misstating spend for three quarters is the most on-brief evidence the role can offer.',
      'The requirements-gathering bullet was deleted outright. Attending meetings with business teams is the job description, not an achievement, and it was occupying the fourth-most-read line of the entry.',
      'Months were added to the dates. Year-only ranges are read as an attempt to blur a tenure, even when they are not.',
    ],
    templateSlug: 'data-scientist-cv',
  },
  {
    element: 'Skills section',
    title: 'IT support specialist applying for a systems administrator role',
    context:
      'The skills list was a fifteen-item comma-separated string that mixed operating systems with personality traits. A hiring manager filtering for endpoint management could not tell in five seconds whether this candidate had it.',
    before: {
      header: 'Skills',
      layout: 'paragraph',
      lines: [
        'Microsoft Office, Windows, Communication, Teamwork, Problem solving, Time management, Customer service, Active Directory, Fast learner, Attention to detail, Office 365, Printers, Hardware, Networking, Troubleshooting',
      ],
    },
    after: {
      header: 'Technical skills',
      layout: 'lines',
      lines: [
        'Identity and endpoints: Active Directory, Entra ID, Intune, Group Policy, BitLocker',
        'Cloud and productivity: Microsoft 365 administration, Exchange Online, SharePoint',
        'Networking: TCP/IP, DNS, DHCP, VPN, VLAN configuration, Meraki',
        'Scripting: PowerShell — intermediate; wrote the starter and leaver provisioning script now in daily use',
        'Service management: ServiceNow, ITIL v4 Foundation',
        'Certifications: CompTIA Network+ (2023), Microsoft MD-102 Endpoint Administrator (2024)',
      ],
    },
    changes: [
      'The soft skills came out entirely. “Teamwork”, “fast learner” and “attention to detail” cannot be verified from a document, every reviewer discounts them, and they were displacing things a hiring manager can actually filter on.',
      'The remainder was grouped under five plain category labels, so a systems administrator scanning for identity management finds it in one second instead of reading a comma-separated wall.',
      'Vague entries became named products. “Networking” turned into the protocols and the hardware; “Windows” turned into the identity and endpoint stack; “Printers” was simply deleted.',
      'One honest proficiency marker was added on the skill where the level genuinely matters, with a piece of evidence attached to it — far more persuasive than a five-star rating bar, which no reader trusts and no parser can read.',
      'Certifications were pulled out onto their own line with the years they were issued, because licences and certifications are frequently searched and filtered as a separate field.',
    ],
    templateSlug: 'it-professional-cv',
  },
  {
    element: 'Career-change reframe',
    title: 'Paralegal applying for a financial-crime compliance role',
    context:
      'Six years of regulatory litigation support, no compliance job title anywhere on the page. The original document described the work in the vocabulary of the field being left rather than the field being entered.',
    before: {
      header: 'Summary, and two experience bullets',
      layout: 'bullets',
      lines: [
        'Experienced paralegal seeking to transition into a compliance role. Strong legal background and eager to apply my skills in a new industry. Hardworking and detail-oriented.',
        'Prepared legal documents and correspondence for attorneys.',
        'Maintained case files and ensured deadlines were met.',
      ],
    },
    after: {
      header: 'Summary, and two experience bullets',
      layout: 'bullets',
      lines: [
        'Paralegal moving into financial-crime compliance, six years in regulatory litigation support. Built and ran the document-hold process for two federal investigations and completed the ICA International Diploma in Anti-Money Laundering in 2025. Comfortable turning a regulation into a checklist somebody else can follow.',
        'Ran document preservation and production for two federal investigations — 90,000+ documents, four custodial interviews, no missed production deadlines across 14 months.',
        'Wrote the firm’s conflict-check procedure after a near-miss; the same eight-step checklist is now run before every new matter by a team of 30.',
      ],
    },
    changes: [
      'The original summary spent all three sentences on the candidate’s wishes. Nobody hires to satisfy an applicant’s ambition, so the rewrite leads with what transfers and puts the qualification that makes the move credible in the second sentence.',
      '“Seeking to transition” became “moving into”. One is a request for permission; the other is a fact already in progress, backed by a named diploma with a year on it.',
      'The document bullets were re-pointed at the target job. Preservation, production and deadline discipline are the same work a compliance analyst does under a regulatory request — the rewrite simply says so in the vocabulary of compliance rather than litigation.',
      'The conflict-check bullet was promoted from a line buried further down, because writing a control that other people execute is the closest thing in a paralegal’s record to a compliance deliverable.',
      'Nothing was invented. Same employer, same duties, same six years — described from the point of view of the role being applied for instead of the role being left.',
    ],
    templateSlug: 'legal-cv',
  },
];

const EXTRA_TEMPLATE_SLUGS = [
  'modern-minimal',
  'business-professional-cv',
  'finance-cv',
  'tech-minimal-cv',
];

const FAQS = [
  {
    question: 'How long should a resume summary be, and what goes in it?',
    answer:
      'Three or four lines, and no more than about sixty words. It needs to answer four questions: what you are, how long you have done it, the scale you operate at, and the one or two things you are measurably good at. If a fifth sentence is creeping in, it is usually an adjective sentence and it can go. The test is whether the summary would still be true if you pasted it onto a stranger’s resume — if it would, it is describing a job title rather than a person.',
  },
  {
    question: 'Where do soft skills belong, if not in the skills list?',
    answer:
      'Inside the experience bullets, as evidence rather than assertion. Nobody believes “excellent communicator” in a list; everybody believes “wrote the onboarding documentation now used by three teams” or “presented the quarterly numbers to the board”. The same is true of leadership, resilience and attention to detail — each one has a concrete thing you did that demonstrates it, and that concrete thing is both more persuasive and more interesting to read.',
  },
  {
    question: 'What if my results are confidential and I cannot publish the numbers?',
    answer:
      'Use ratios, ranges and relative movements instead of absolutes. “Grew the account book by 40%” reveals far less than the revenue figure and lands almost as hard. Bands work too — “a portfolio in the £5–10m range” — as do rankings, such as second of eleven regions. Check what your employer has already published in results announcements or press releases, because anything in the public domain is yours to quote. What you should not do is leave the achievement out because the exact figure is protected.',
  },
  {
    question: 'How do I write a bullet for something a whole team delivered?',
    answer:
      'Claim your slice precisely and let the scale of the whole provide the context. “Led the migration” when you were one of nine engineers is the kind of overstatement that collapses in an interview, but “owned the data-migration workstream of a nine-person ERP replacement, moving 2.4M customer records with no reconciliation breaks” is both honest and impressive. Naming the size of the programme makes your part sound bigger, not smaller, because it shows the environment you can operate in.',
  },
  {
    question: 'How should I present a job I only held for six months?',
    answer:
      'Show it, date it and give it one line of context if the reason is external — a fixed-term contract, a funded project that ended, a redundancy round, a relocation. Short roles are common enough now that a single explained stint raises no eyebrow. Omitting it, by contrast, creates a gap that the reader will ask about anyway, and employment dates are among the few things routinely verified. Where the role genuinely added nothing and sat inside a longer, well-explained period, you have more latitude, but never move dates to cover it.',
  },
  {
    question: 'Is it worth paying somebody to rewrite my resume?',
    answer:
      'Sometimes, and less often than the market for it suggests. A good writer is genuinely useful when you are changing field, returning after a long break or moving into a level where the conventions are unfamiliar to you. What they cannot do is supply the raw material: the numbers, the scale and the specific outcomes have to come from you, and a writer working without them will produce fluent, empty prose. Spend an hour gathering your figures first — you will often find that most of the value you were paying for is already unlocked.',
  },
];

/* -------------------------------------------------------------------------- */
/* Rendering                                                                   */
/* -------------------------------------------------------------------------- */

function RewriteColumn({
  block,
  tone,
  label,
}: {
  block: RewriteBlock;
  tone: 'before' | 'after';
  label: string;
}) {
  const isAfter = tone === 'after';

  return (
    <div
      className={
        isAfter
          ? 'rounded-lg border border-success-500/30 bg-success-50 p-4 sm:p-5'
          : 'rounded-lg border border-ink-200 bg-ink-50 p-4 sm:p-5'
      }
    >
      <p
        className={`text-2xs font-bold tracking-[0.12em] uppercase ${
          isAfter ? 'text-success-700' : 'text-ink-500'
        }`}
      >
        {label}
      </p>
      {block.header ? (
        <p className="mt-3 text-sm font-bold text-ink-950">{block.header}</p>
      ) : null}
      {block.layout === 'bullets' ? (
        <ul className="mt-2 flex flex-col gap-2 text-sm leading-relaxed text-ink-700">
          {block.lines.map((line) => (
            <li key={line} className="flex gap-2">
              <span aria-hidden className="mt-2 size-1.5 shrink-0 rounded-full bg-ink-400" />
              {line}
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt-2 flex flex-col gap-1.5 text-sm leading-relaxed text-ink-700">
          {block.lines.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </div>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Page                                                                        */
/* -------------------------------------------------------------------------- */

export default function ResumeExamplesPage() {
  const caseStudies = CASE_STUDIES.flatMap((study) => {
    const template = getTemplateBySlug(study.templateSlug);
    return template ? [{ ...study, template }] : [];
  });

  const gridTemplates = [
    ...caseStudies.map((study) => study.template),
    ...EXTRA_TEMPLATE_SLUGS.flatMap((slug) => {
      const template = getTemplateBySlug(slug);
      return template ? [template] : [];
    }),
  ];

  return (
    <>
      <Section size="sm">
        <Breadcrumbs
          items={[
            { name: 'Home', path: '/' },
            { name: 'Resume examples', path: '/resume-examples' },
          ]}
        />
        <SectionHeading
          as="h1"
          align="left"
          eyebrow="Resume examples"
          title="Resume examples: four rewrites, before and after"
          description="Not sample documents to copy — four real editing problems, shown side by side. A summary that said nothing, an experience block that listed tools instead of work, a skills section that mixed products with personality traits, and a career change described from the wrong side. Each one comes with a note on exactly what changed and why."
        />
        <div className="mt-8 flex flex-wrap gap-3">
          <ButtonLink href="/register" size="lg">
            Rewrite yours — free
          </ButtonLink>
          <ButtonLink href="/cv-examples" size="lg" variant="outline">
            See bullet rewrites by role
          </ButtonLink>
        </div>
      </Section>

      <Section tone="muted">
        <div className="flex flex-col gap-8">
          {caseStudies.map((study, index) => (
            <article
              key={study.title}
              className="rounded-2xl border border-ink-200 bg-white p-5 sm:p-8"
            >
              <div className="flex flex-wrap items-center gap-3">
                <span className="grid size-8 place-items-center rounded-full bg-ink-950 text-sm font-bold text-white">
                  {index + 1}
                </span>
                <Badge tone="brand">{study.element}</Badge>
              </div>

              <h2 className="mt-4 text-2xl font-bold tracking-tight text-ink-950">{study.title}</h2>
              <p className="mt-3 max-w-3xl text-[15px] leading-relaxed text-ink-600">
                {study.context}
              </p>

              <div className="mt-7 grid gap-4 lg:grid-cols-2">
                <RewriteColumn block={study.before} tone="before" label="Before" />
                <RewriteColumn block={study.after} tone="after" label="After" />
              </div>

              <div className="mt-7">
                <h3 className="text-base font-bold text-ink-950">What changed, and why</h3>
                <ul className="mt-3 flex flex-col gap-2.5">
                  {study.changes.map((change) => (
                    <li key={change} className="flex gap-3 text-sm leading-relaxed text-ink-700">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        aria-hidden
                        className="mt-1 shrink-0 text-brand-600"
                      >
                        <path
                          d="M5 12h14m-6-6 6 6-6 6"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      {change}
                    </li>
                  ))}
                </ul>
              </div>

              <p className="mt-6 text-sm text-ink-600">
                Template used for this rewrite:{' '}
                <Link
                  href={`/templates/${study.template.slug}`}
                  className="font-semibold text-brand-700 underline underline-offset-2 hover:text-brand-800"
                >
                  {study.template.name}
                </Link>
              </p>
            </article>
          ))}
        </div>
      </Section>

      <Section>
        <Prose>
          <h2>What all four rewrites have in common</h2>
          <p>
            The four documents came from different industries and different career stages, and the
            same five edits did most of the work in every one of them.
          </p>
          <ul>
            <li>
              <strong>Adjectives out, nouns and numbers in.</strong> Not one of the after versions
              describes the candidate as hardworking, passionate or detail-oriented. The evidence
              does that job, and it does it credibly.
            </li>
            <li>
              <strong>Verbs of ownership.</strong> <em>Own</em>, <em>ran</em>, <em>built</em>,{' '}
              <em>wrote</em>, <em>rebuilt</em>. Never <em>responsible for</em>, <em>assisted
              with</em> or <em>involved in</em>, all of which are compatible with having done almost
              nothing.
            </li>
            <li>
              <strong>The reader&rsquo;s first question answered first.</strong> A district manager
              wants store volume; a senior-analyst hiring manager wants the size of the data and who
              depends on it; a systems administrator wants the identity stack. Each rewrite front-loads
              the thing that reader needs.
            </li>
            <li>
              <strong>Scale attached to every claim.</strong> 32 staff, 120M rows, 90,000 documents,
              a team of 30. Without the scale, an achievement floats free and the reader silently
              assumes the smallest plausible version of it.
            </li>
            <li>
              <strong>Nothing invented.</strong> Every after version describes exactly the same work
              as the before version. That is worth stating plainly: rewriting is a problem of
              retrieval and framing, not of embellishment.
            </li>
          </ul>

          <h2>How to check your own rewrite</h2>
          <p>
            Five tests, in the order that catches the most problems fastest. Run them on your
            current role first — it is the entry that gets read.
          </p>
          <ol>
            <li>
              <strong>Cover the employer name.</strong> Could this sentence belong to anybody else
              who has held the same job title? If yes, it is a job description and needs a number or
              a specific.
            </li>
            <li>
              <strong>Read only the first three words of each bullet.</strong> That is roughly what a
              skim-reader takes in. If those openings are &ldquo;Responsible for the&rdquo;,
              &ldquo;Assisted with the&rdquo; and &ldquo;Worked closely with&rdquo;, the entry is
              invisible.
            </li>
            <li>
              <strong>Count the adjectives in your summary.</strong> More than three and you are
              asserting rather than showing.
            </li>
            <li>
              <strong>Ask what the reader learns.</strong> If everything in an entry could have been
              guessed from your job title alone, the entry has not earned its space.
            </li>
            <li>
              <strong>Read it aloud.</strong> Anything you would be uncomfortable saying to an
              interviewer&rsquo;s face is either overstated or badly phrased, and both are worth
              knowing before somebody else finds out.
            </li>
          </ol>
        </Prose>
      </Section>

      <Section tone="muted">
        <SectionHeading
          align="left"
          title="Layouts that suit a rewritten document"
          description="Single-column designs with a real summary block and enough room for a dense experience entry, including the four used in the case studies above."
        />
        <TemplateGrid className="mt-8" templates={gridTemplates} columns={4} />
      </Section>

      <Section>
        <FaqSection
          entries={FAQS}
          description="Summaries, soft skills, confidential numbers and the awkward parts of an employment history."
        />
      </Section>

      <Section tone="muted">
        <CtaBanner
          title="Do the same to your own resume"
          description="Open your current version next to the editor, run the five checks and rewrite the top entry. Most people find twenty minutes is enough to change the document completely."
          primaryLabel="Start free"
          secondaryHref="/resume-templates"
          secondaryLabel="Pick a template first"
          note="No credit card. Export to PDF when you are done."
        />
        <div className="mt-16">
          <RelatedLinks
            title="Related pages"
            links={[
              {
                label: 'CV examples by role',
                href: '/cv-examples',
                description: 'Ten roles, with the metrics that matter in each one.',
              },
              {
                label: 'Resume templates',
                href: '/resume-templates',
                description: 'One page, Letter paper, and the US conventions behind them.',
              },
              {
                label: 'ATS resume guide',
                href: '/ats-resume',
                description: 'Tailoring a rewritten resume to a specific posting.',
              },
              {
                label: 'All templates',
                href: '/templates',
                description: 'The full gallery, previewed at full page size.',
              },
              {
                label: 'Online CV builder',
                href: '/cv-builder',
                description: 'Edit, reorder and export without wrestling with a word processor.',
              },
              {
                label: 'Blog',
                href: '/blog',
                description: 'Longer guides on writing, applying and interviewing.',
              },
            ]}
          />
        </div>
      </Section>
    </>
  );
}
