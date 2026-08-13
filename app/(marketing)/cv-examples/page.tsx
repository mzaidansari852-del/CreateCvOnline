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
import { getAllExamples } from '@/lib/cv-examples';
import { getTemplateBySlug } from '@/lib/cv/template-registry';

export const metadata: Metadata = pageMetadata({
  title: 'CV Examples by Role and Career Stage',
  description:
    'CV examples for ten roles: what a hiring manager scans for first, the metrics that matter, a weak bullet rewritten into a strong one, and a template to match.',
  path: '/cv-examples',
  keywords: [
    'cv examples',
    'cv example by job',
    'cv bullet points',
    'cv achievements',
    'graduate cv example',
    'nurse cv example',
  ],
});

/* -------------------------------------------------------------------------- */
/* Page data                                                                   */
/* -------------------------------------------------------------------------- */

interface RoleExample {
  role: string;
  stage: string;
  scan: string;
  metrics: string[];
  before: string;
  after: string;
  note: string;
  templateSlug: string;
  /** Slug of the full profession guide under `/cv-for/`, where one exists. */
  professionSlug?: string;
  /** Slug of the complete worked document under `/cv-examples/`, where one exists. */
  exampleSlug?: string;
}

const EXAMPLES: RoleExample[] = [
  {
    role: 'Software engineer',
    stage: 'Three to six years',
    scan: 'What you owned, and how big it was. The stack is checked in about ten seconds and then set aside — what the reader is looking for is a system with your name on it and a change you personally made to it.',
    metrics: [
      'Scale of the system: requests per day, records, users',
      'Reliability: p99 latency, uptime, error rate',
      'Delivery: release frequency, time from merge to production',
    ],
    before: 'Worked on the backend team using Java and Spring Boot to build APIs.',
    after:
      'Owned the payments API (Java, Spring Boot) serving 4M requests a day; cut p99 latency from 850 ms to 210 ms by replacing a per-request currency lookup with an in-process cache.',
    note: '“Worked on” is the weakest verb in engineering — it covers everything from designing the service to attending the stand-up. The stack survives the rewrite, but it is now attached to a system, a scale and a specific change with a before and an after.',
    templateSlug: 'software-engineer-cv',
    professionSlug: 'software-engineer',
    exampleSlug: 'software-engineer',
  },
  {
    role: 'Marketing manager',
    stage: 'Mid-career',
    scan: 'Which channels you own, how much budget goes through your hands, and whether you can connect activity to pipeline rather than to impressions.',
    metrics: [
      'Budget under management',
      'Cost per acquisition or return on ad spend',
      'Pipeline or revenue influenced, with the attribution model named',
    ],
    before: 'Managed social media and email campaigns to increase brand awareness.',
    after:
      'Owned a £340k paid and lifecycle budget across LinkedIn, Google and email; rebuilt the nurture sequence and grew marketing-sourced pipeline from £1.1m to £2.7m in a year at a 22% lower cost per opportunity.',
    note: 'Brand awareness is the least falsifiable claim in marketing. Naming the budget establishes seniority in four words, and pairing a growth figure with a cost figure stops the result reading as something that was simply bought.',
    templateSlug: 'marketing-cv',
    professionSlug: 'marketing-manager',
    exampleSlug: 'marketing-manager',
  },
  {
    role: 'Accountant',
    stage: 'Qualified, industry',
    scan: 'Your qualification and where you are in it, the size and complexity of the ledger you handle, and the systems you work in. All three are used as filters before anyone reads a sentence.',
    metrics: [
      'Working days to close, and the trend',
      'Entity size: turnover, number of entities, currencies',
      'Audit outcomes and control findings',
    ],
    before: 'Responsible for month-end close and preparation of management accounts.',
    after:
      'Ran month-end close for three entities (£46m combined turnover, GBP and EUR), cutting the timetable from nine working days to five by automating intercompany reconciliations in NetSuite.',
    note: 'Every accountant runs the close; the differentiators are scope and speed. Naming the ERP matters more here than in most professions, because finance teams filter hard on the system they already run.',
    templateSlug: 'accountant-cv',
    professionSlug: 'accountant',
    exampleSlug: 'accountant',
  },
  {
    role: 'Graphic designer',
    stage: 'Any stage',
    scan: 'The portfolio link, before anything else. The CV exists to get that link clicked and to supply the context the work sat in — who it was for, how widely it shipped, what constraints you were working inside.',
    metrics: [
      'Scope: brand systems, ranges or campaigns delivered end to end',
      'Distribution: where the work actually appeared, and at what volume',
      'Process: turnaround times, template systems, studio throughput',
    ],
    before: 'Created marketing materials and social graphics for various clients.',
    after:
      'Designed and rolled out the visual identity for a 40-product skincare range — packaging, point of sale and social — live in 600 retail doors; cut studio artwork turnaround from five days to two with a component-based template kit.',
    note: 'Design CVs collapse into software lists. This rewrite mentions no tools at all: it describes scope, where the work shipped and a process improvement, which is what a design lead is actually hiring for. The portfolio proves the craft; the CV proves you can run a job.',
    templateSlug: 'graphic-designer-cv',
    professionSlug: 'graphic-designer',
  },
  {
    role: 'Nurse',
    stage: 'Registered, acute setting',
    scan: 'Registration status first — the reader is checking whether you can be rostered at all — then the setting and its acuity, then the competencies that decide what you can be assigned to.',
    metrics: [
      'Setting: bed numbers, speciality, typical staffing ratio',
      'Competencies: cannulation, ALS, mentorship, the EHR you use',
      'Quality work: audits, incident reduction, complaint outcomes',
    ],
    before: 'Provided patient care on a busy ward and worked as part of a multidisciplinary team.',
    after:
      'Registered nurse on a 28-bed acute medical ward, typically 1:6 on days and 1:10 at night; shift coordinator twice a week, precepting three student nurses per rotation and leading a falls-reduction audit that cut ward incidents by a fifth over two quarters.',
    note: 'Every nurse provides patient care and every ward is busy. What a ward manager needs to know is the acuity you are used to, the ratio you can hold and whether you can take charge of a shift — because that determines the rota from your first week.',
    templateSlug: 'ats-simple-cv',
    professionSlug: 'nurse',
  },
  {
    role: 'Teacher',
    stage: 'Secondary, three to eight years',
    scan: 'Subject and the age groups you have taught, then evidence that pupils made progress under you, then anything you have carried beyond your own timetable.',
    metrics: [
      'Attainment or progress against the previous cohort or department average',
      'Teaching load: classes, pupil numbers, ability range',
      'Responsibilities: form tutor, subject lead, intervention programmes',
    ],
    before: 'Taught mathematics to students of all abilities and prepared them for exams.',
    after:
      'Taught GCSE and A-level mathematics across five classes (150 pupils); redesigned the Year 11 intervention scheme and lifted grade 5+ attainment from 58% to 71% across two cohorts, against a departmental average of 62%.',
    note: 'A percentage only becomes evidence when it has a benchmark next to it. Naming the cohort and the intervention also shows the improvement was designed rather than inherited from a strong year group.',
    templateSlug: 'traditional-cv',
    professionSlug: 'teacher',
  },
  {
    role: 'Sales representative',
    stage: 'B2B, two to seven years',
    scan: 'Quota, attainment against it, and whether your deals look like the deals they sell. A sales CV without numbers is generally read as a bad year.',
    metrics: [
      'Quota and percentage attainment, stated per year',
      'Average deal size and sales cycle length',
      'Mix: new business versus renewal, and self-sourced pipeline',
    ],
    before: 'Consistently exceeded sales targets and built strong client relationships.',
    after:
      'Carried a $1.2m new-business quota in mid-market logistics software; finished FY24 at 118% and FY23 at 104%, average deal $46k on a 71-day cycle, self-sourcing 40% of pipeline.',
    note: '“Consistently exceeded targets” is the most common sentence in sales CVs and carries no information at all. Two years of attainment against a stated quota, with deal size and cycle length, tells a sales manager within seconds which patch you fit.',
    templateSlug: 'sales-cv',
    professionSlug: 'sales-manager',
  },
  {
    role: 'Recent graduate',
    stage: 'No professional history yet',
    scan: 'What you studied and when you finish, then any evidence of doing something outside a lecture theatre. With no employment record to read, the reader is hunting for signals of reliability and initiative.',
    metrics: [
      'Degree classification or GPA, where it helps you',
      'Anything you ran, organised or were trusted with',
      'Hours worked alongside study, and what you were given to do',
    ],
    before: 'Worked part-time in a café while studying. Team player with good communication skills.',
    after:
      'Worked 20 hours a week through a full-time degree; trained four new staff and took over rota planning for a nine-person team in my second year, while finishing with a 2:1 in Economics.',
    note: 'Part-time hospitality work is not filler — on a graduate CV it is the only evidence that you turn up, get trusted and get given more. State the hours, the responsibility and the fact that both ran alongside the degree. “Team player” is a claim anyone can type.',
    templateSlug: 'student-cv',
    professionSlug: 'student',
    exampleSlug: 'student',
  },
  {
    role: 'Project manager',
    stage: 'Five to twelve years',
    scan: 'The size of the things you have run — budget, headcount, duration — and whether they landed. Methodology and sector come second, and certifications are usually a filter rather than a differentiator.',
    metrics: [
      'Budget and team size, per project',
      'Schedule and budget variance against the original plan',
      'Complexity: vendors, workstreams, sites, regulatory scope',
    ],
    before:
      'Managed multiple projects simultaneously and ensured they were delivered on time and within budget.',
    after:
      'Ran a €2.4m ERP migration across four European sites — 26 people, three vendors, 14 months — delivered five weeks behind the original plan and 3% under budget after absorbing two scope changes.',
    note: 'Admitting the five weeks is what makes everything else believable. Any experienced sponsor knows that a whole career on time and on budget does not happen, and a candidate who reports the variance and the reason reads as someone who actually tracks their projects.',
    templateSlug: 'manager-cv',
    professionSlug: 'project-manager',
    exampleSlug: 'project-manager',
  },
  {
    role: 'Customer service',
    stage: 'Contact centre or support desk',
    scan: 'Volume and channel mix first, because the reader is working out whether you can hold their queue. Then quality scores, then whether you have handled escalations or coached anyone.',
    metrics: [
      'Contacts handled per day, split by channel',
      'CSAT or quality score, with the sample size',
      'First-contact resolution or escalation rate',
    ],
    before: 'Answered customer queries by phone and email and resolved complaints.',
    after:
      'Handled around 60 contacts a day across phone, email and live chat on a home-insurance book, holding 94% CSAT from roughly 900 surveys a quarter and 78% first-contact resolution; took ownership of the escalation queue for a team of nine after eight months.',
    note: 'A satisfaction score means nothing without the volume behind it — 94% from twelve surveys is noise. Naming the product line matters too: handling insurance claims and handling e-commerce returns are genuinely different jobs.',
    templateSlug: 'business-professional-cv',
  },
];

const FAQS = [
  {
    question: 'What if my role genuinely has no numbers in it?',
    answer:
      'Most roles have more measurable surface than they appear to. Where there is no metric, use the other three dimensions: frequency (weekly, per term, per release), scope (for three teams, across two sites, for a 40-person department) and comparison (the first time the team had done it, the only person trained on the system). "Rewrote the onboarding pack used by every new starter across three offices" has no percentage in it and is still concrete. What you should not do is invent a figure to fill the gap.',
  },
  {
    question: 'How many bullet points should each role have?',
    answer:
      'Four to six for your current or most recent role, three or four for the one before it, and one or two for anything older than about eight years. That distribution matches how the document is read: attention drops sharply after the first entry, so the strongest material has to be at the top. If a role from 2012 still needs five bullets to explain, it usually means the recent entries have not been written properly.',
  },
  {
    question: 'Can I reuse a CV example I found online?',
    answer:
      'Use the structure, never the sentences. Recruiters in a given field read hundreds of CVs a month and the well-known example phrasings are recognisable — spotting the same "results-driven professional with a proven track record" opening for the fourth time in a morning is not a good start. The value of an example is in showing you what to include and how a claim is built; the specifics have to be yours, because the specifics are the only part that persuades anyone.',
  },
  {
    question: 'Can I use figures I cannot prove?',
    answer:
      'Use figures you can explain. Nobody expects a candidate to produce an audited report, and honest approximation is normal — "around 60 contacts a day", "roughly a fifth". What matters is that you can describe where the number came from if asked in the interview, because that question does get asked. A precise figure you cannot account for is worse than an approximation you can, and a figure you invented is a straightforward integrity problem.',
  },
  {
    question: 'What tense should a CV be written in?',
    answer:
      'Past tense for previous roles, present tense for the job you currently hold, and consistency inside each entry. Drop the first person entirely: write "Led a team of six", not "I led a team of six". Leading articles can go too — "Managed the budget" reads better than "Managed the departmental budget for the team" — as long as the sentence still makes sense on its own when a recruiter skims only the first three words of each line.',
  },
  {
    question: 'Should achievements sit under each role, or in a separate section?',
    answer:
      'Under each role, in almost every case. An achievement separated from its context loses the scale that made it impressive, and a reader who has to jump between two parts of the page to reconstruct what you did will usually not bother. The exception is a senior CV where three or four career-defining results genuinely belong at the top: a short "Selected achievements" block under the summary, with each item still naming the employer and the year, then the full history below.',
  },
  {
    question: 'Does a CV need a personal profile at the top?',
    answer:
      'A short one earns its space. Three or four lines stating what you are, how long you have done it and the two things you are strongest at gives the reader a frame for everything that follows, which is worth the vertical space it takes. What does not earn its space is a paragraph of adjectives. If your profile would still be true after you swapped it onto a stranger’s CV, it is not doing any work and should be deleted or rewritten around specifics.',
  },
];

/* -------------------------------------------------------------------------- */
/* Page                                                                        */
/* -------------------------------------------------------------------------- */

export default function CvExamplesPage() {
  const examples = EXAMPLES.flatMap((example) => {
    const template = getTemplateBySlug(example.templateSlug);
    return template ? [{ ...example, template }] : [];
  });
  const recommended = examples.map((example) => example.template);
  const workedExamples = getAllExamples();

  return (
    <>
      <Section size="sm">
        <Breadcrumbs
          items={[
            { name: 'Home', path: '/' },
            { name: 'CV examples', path: '/cv-examples' },
          ]}
        />
        <SectionHeading
          as="h1"
          align="left"
          eyebrow="CV examples"
          title="CV examples by role and career stage"
          description="Ten roles, and for each one: what the person reading it looks for first, the two or three numbers that carry weight in that field, and a real bullet point rewritten from something forgettable into something that gets a call. The rewrites are the point — skim to the role you are applying for."
        />
        <div className="mt-8 flex flex-wrap gap-3">
          <ButtonLink href="/register" size="lg">
            Write yours — free
          </ButtonLink>
          <ButtonLink href="/templates" size="lg" variant="outline">
            Browse templates
          </ButtonLink>
        </div>
      </Section>

      <Section tone="muted">
        <Prose>
          <h2>How to turn a duty into an achievement</h2>
          <p>
            Nearly every weak bullet point on a CV has the same shape: it describes the job rather
            than the person doing it. If your sentence would be equally true of the next person to
            hold the post, it is a job description, and it is taking up a line that could have been
            evidence. The rewrites below all follow the same three-part construction.
          </p>
          <ol>
            <li>
              <strong>What you did.</strong> A specific verb and a specific object. Not
              &ldquo;responsible for&rdquo;, not &ldquo;involved in&rdquo;, not &ldquo;helped
              with&rdquo;.
            </li>
            <li>
              <strong>At what scale.</strong> The number that tells the reader how big the job was:
              headcount, budget, requests per day, beds, pupils, tickets, square feet.
            </li>
            <li>
              <strong>With what result.</strong> Ideally a change with a starting point and an end
              point, over a stated period. A movement from 58% to 71% says far more than
              &ldquo;improved results&rdquo;, and slightly more than &ldquo;achieved 71%&rdquo;.
            </li>
          </ol>
          <p>
            One well-built bullet beats three vague ones, and a role with four strong lines looks
            more substantial than a role with nine weak ones. Where you have no number at all, reach
            for frequency, scope or a comparison instead — and never for an invented statistic.
          </p>

          <h3>What changes with career stage</h3>
          <p>
            The construction above is constant; what moves is the order of the document. A graduate
            leads with education and puts anything they have run — part-time work, a society, a
            final-year project — immediately underneath. Between roughly three and eight years,
            experience moves to the top and education compresses to two lines. Past a decade, a
            summary and sometimes a short selected-achievements block sit above the history, and
            roles older than fifteen years collapse into a single line. Someone changing field keeps
            the reverse-chronological history intact but leads with a profile that explains the move
            in one sentence, because the reader will otherwise spend their attention working it out.
          </p>
        </Prose>
      </Section>

      <Section>
        <SectionHeading
          align="left"
          eyebrow="Complete documents"
          title="Five roles have a full worked example"
          description="A single rewritten bullet shows you the construction. These pages show you the whole document it belongs in — a real CV rendered exactly as it would download, with every section explained and the summary and bullets reproduced as text you can read closely."
        />
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {workedExamples.map((worked) => (
            <li key={worked.slug}>
              <Link
                href={`/cv-examples/${worked.slug}`}
                className="group flex h-full flex-col rounded-xl border border-ink-200 bg-white p-5 transition-all hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-card"
              >
                <span className="text-sm font-semibold text-ink-950 group-hover:text-brand-700">
                  {worked.role} CV example
                </span>
                <span className="mt-1 text-[13px] leading-relaxed text-ink-600">{worked.stage}</span>
              </Link>
            </li>
          ))}
        </ul>
        <p className="mt-6 text-[15px] leading-relaxed text-ink-600">
          For advice written around one profession rather than one bullet — the metrics that count
          in that field, the section order, the terms a parser is matching for —{' '}
          <Link
            href="/cv-for"
            className="font-semibold text-brand-700 underline underline-offset-2 hover:text-brand-800"
          >
            browse the ten profession guides
          </Link>
          .
        </p>
      </Section>

      <Section tone="muted">
        <SectionHeading
          align="left"
          title="Ten roles, ten rewrites"
          description="Each example names the template that suits the role, but any of them can be swapped later without retyping a word."
        />
        <div className="mt-10 flex flex-col gap-6">
          {examples.map((example) => (
            <article
              key={example.role}
              className="rounded-2xl border border-ink-200 bg-white p-5 sm:p-7"
            >
              <div className="flex flex-wrap items-center gap-3">
                <h3 className="text-xl font-bold text-ink-950">{example.role}</h3>
                <Badge tone="neutral">{example.stage}</Badge>
              </div>

              <div className="mt-5 grid gap-6 lg:grid-cols-[1.1fr_1fr]">
                <div>
                  <h4 className="text-2xs font-bold tracking-[0.12em] text-brand-700 uppercase">
                    Scanned first
                  </h4>
                  <p className="mt-2 text-sm leading-relaxed text-ink-700">{example.scan}</p>
                </div>
                <div>
                  <h4 className="text-2xs font-bold tracking-[0.12em] text-brand-700 uppercase">
                    Metrics that matter
                  </h4>
                  <ul className="mt-2 flex flex-col gap-1.5 text-sm leading-relaxed text-ink-700">
                    {example.metrics.map((metric) => (
                      <li key={metric} className="flex gap-2">
                        <span aria-hidden className="mt-2 size-1.5 shrink-0 rounded-full bg-brand-500" />
                        {metric}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-6 grid gap-4 lg:grid-cols-2">
                <div className="rounded-lg border border-ink-200 bg-ink-50 p-4">
                  <p className="text-2xs font-bold tracking-[0.12em] text-ink-500 uppercase">
                    Weak bullet
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-ink-700">{example.before}</p>
                </div>
                <div className="rounded-lg border border-success-500/30 bg-success-50 p-4">
                  <p className="text-2xs font-bold tracking-[0.12em] text-success-700 uppercase">
                    Rewritten
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-ink-800">{example.after}</p>
                </div>
              </div>

              <p className="mt-4 text-sm leading-relaxed text-ink-600">
                <strong className="font-semibold text-ink-950">Why it works:</strong> {example.note}
              </p>

              <p className="mt-4 text-sm text-ink-600">
                Suggested template:{' '}
                <Link
                  href={`/templates/${example.template.slug}`}
                  className="font-semibold text-brand-700 underline underline-offset-2 hover:text-brand-800"
                >
                  {example.template.name}
                </Link>{' '}
                <span className="text-ink-500">
                  — {example.template.columns === 1 ? 'one column' : 'two columns'}, parsing score{' '}
                  {example.template.atsScore}/5
                </span>
              </p>

              {example.professionSlug || example.exampleSlug ? (
                <div className="mt-5 flex flex-wrap gap-2 border-t border-ink-100 pt-4">
                  {example.exampleSlug ? (
                    <Link
                      href={`/cv-examples/${example.exampleSlug}`}
                      className="rounded-lg border border-brand-200 bg-brand-50 px-3 py-1.5 text-[13px] font-semibold text-brand-800 transition-colors hover:border-brand-300 hover:bg-brand-100"
                    >
                      See the full example CV
                    </Link>
                  ) : null}
                  {example.professionSlug ? (
                    <Link
                      href={`/cv-for/${example.professionSlug}`}
                      className="rounded-lg border border-ink-200 px-3 py-1.5 text-[13px] font-semibold text-ink-700 transition-colors hover:border-ink-300 hover:bg-ink-50"
                    >
                      Full {example.role.toLowerCase()} CV guide
                    </Link>
                  ) : null}
                </div>
              ) : null}
            </article>
          ))}
        </div>
      </Section>

      <Section>
        <SectionHeading
          align="left"
          title="The templates behind these examples"
          description="One per role above, from the ATS-safe layouts a nurse or an accountant needs through to the expressive designs that suit a design portfolio."
        />
        <TemplateGrid className="mt-8" templates={recommended} columns={5} />
      </Section>

      <Section tone="muted">
        <FaqSection
          entries={FAQS}
          description="Bullet counts, missing numbers, tense and the questions that come up when people start rewriting."
        />
      </Section>

      <Section>
        <CtaBanner
          title="Rewrite three bullets tonight"
          description="Open the editor, pick the role closest to yours above and rework your top three lines using the same construction. It is the highest-return hour in a job search."
          primaryLabel="Start your CV — free"
          secondaryHref="/resume-examples"
          secondaryLabel="See full document rewrites"
          note="Free plan includes the editor and PDF download."
        />
        <div className="mt-16">
          <RelatedLinks
            title="Keep going"
            links={[
              {
                label: 'CV advice by profession',
                href: '/cv-for',
                description: 'Ten fields, each with its own metrics, section order and mistakes.',
              },
              {
                label: 'Resume examples',
                href: '/resume-examples',
                description: 'Whole sections rewritten side by side, not just single bullets.',
              },
              {
                label: 'What makes a CV professional',
                href: '/professional-cv',
                description: 'Structure, tone and the finish that separates good from average.',
              },
              {
                label: 'CV templates',
                href: '/cv-templates',
                description: 'International formats, A4 and country-by-country conventions.',
              },
              {
                label: 'All templates',
                href: '/templates',
                description: 'Every design, with column counts and parsing scores.',
              },
              {
                label: 'Online CV builder',
                href: '/cv-builder',
                description: 'Write, reorder and export without fighting a word processor.',
              },
              {
                label: 'Blog',
                href: '/blog',
                description: 'Longer guides on writing, applications and interviews.',
              },
            ]}
          />
        </div>
      </Section>
    </>
  );
}
