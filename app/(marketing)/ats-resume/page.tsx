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
import { atsSafeTemplates } from '@/lib/cv/template-registry';
import { site } from '@/lib/site';

export const metadata: Metadata = pageMetadata({
  title: 'ATS Resume: Keywords, Headings and File Formats',
  description:
    'A practical ATS resume guide: matching a job description without keyword stuffing, headings parsers recognise, file naming, .docx vs PDF and a worked example.',
  path: '/ats-resume',
  keywords: [
    'ats resume',
    'ats friendly resume',
    'resume keywords',
    'tailoring a resume',
    'docx or pdf resume',
    'ats resume template',
  ],
});

/* -------------------------------------------------------------------------- */
/* Page data                                                                   */
/* -------------------------------------------------------------------------- */

const HEADINGS: { use: string; avoid: string; note: string }[] = [
  {
    use: 'Summary · Professional Summary',
    avoid: 'Who I Am · My Story · Hello!',
    note: 'The block under your name is the one a recruiter reads first. Label it plainly and it also gets mapped to the summary field.',
  },
  {
    use: 'Experience · Work Experience · Professional Experience',
    avoid: 'Where I Have Worked · Career Journey · The Story So Far',
    note: 'This is the heading that matters most. If it is not recognised, employers, titles and dates never become structured fields.',
  },
  {
    use: 'Education',
    avoid: 'Learning · Academic Adventures',
    note: 'One word. Degree, institution, location and year, in that order, each role on its own lines.',
  },
  {
    use: 'Skills · Technical Skills · Core Competencies',
    avoid: 'My Toolkit · Superpowers · What I Am Good At',
    note: 'Group them under short category labels if you like — parsers handle sub-labels, and humans read a grouped list faster.',
  },
  {
    use: 'Certifications · Licenses',
    avoid: 'Badges · Extra Credit',
    note: 'Licensed professions are frequently filtered on exactly this field, so give the licence name, the issuing body and the expiry.',
  },
  {
    use: 'Projects · Volunteer Experience',
    avoid: 'Side Quests · Giving Back',
    note: 'Both are recognised section types and both are useful when your paid history is short or you are changing field.',
  },
];

const BULLET_REWRITES: { before: string; after: string; changed: string }[] = [
  {
    before: 'Responsible for daily warehouse operations and staff supervision.',
    after:
      'Supervised 24 associates across two shifts in a 180,000 sq ft distribution centre, holding on-time dispatch at 98% through peak season.',
    changed:
      'The posting asked for shift leadership of a 20+ team. The rewrite states the headcount, the shift pattern and the site size, then attaches a number to the outcome instead of naming a duty.',
  },
  {
    before: 'Helped improve inventory accuracy.',
    after:
      'Rebuilt the cycle-counting programme in our warehouse management system (WMS), lifting inventory accuracy from 94% to 99.2% over nine months.',
    changed:
      'Two of the posting’s exact terms — cycle counting and WMS — now sit in the same sentence as the evidence. The abbreviation is spelled out once so either spelling matches a search.',
  },
  {
    before: 'Focused on safety and continuous improvement.',
    after:
      'Ran 5S and Lean kaizen events that cut average pick-path travel by 18%, and closed two OSHA inspections with no repeat findings.',
    changed:
      'Lean, 5S and OSHA were listed under the posting’s requirements. Each is now a thing that happened rather than an adjective about the candidate.',
  },
];

const FAQS = [
  {
    question: 'How many keywords should a resume contain?',
    answer:
      'Think in terms of coverage rather than count. Work through the requirements section of the posting, list the must-haves you genuinely have, and make sure each one appears once somewhere it makes sense — the title line, the summary, a skills entry or, best of all, the bullet describing the work where you used it. Recruiter searches are usually about presence, not density, so a term that appears once next to real evidence beats the same term repeated six times. If you can only cover half the must-haves honestly, the problem is the fit of the role, not the wording of the resume.',
  },
  {
    question: 'Should I change my job title to match the posting?',
    answer:
      'Never on a past employment entry. Titles and dates are the two things a background check verifies, and a discrepancy discovered after an offer is a serious problem. What is legitimate is a target title line under your name — "Warehouse Operations Supervisor" above a summary — and, where your internal title was unusual, a parenthetical: "Fulfilment Lead II (Warehouse Supervisor)". That gives the search something to match without misrepresenting what you were called.',
  },
  {
    question: 'Is it worth tailoring a resume for every single application?',
    answer:
      'For applications you care about, yes, and it need not take long. Keep one master version and change three things: the title line, two or three phrases in the summary, and the ordering and wording of the top four or five bullets in your current role. That is a fifteen-minute edit. Sending the same untailored file to sixty postings is a worse use of the same hour, because the postings you would actually have got are the ones you did not adjust for.',
  },
  {
    question: 'Does the file name matter?',
    answer:
      'To the parser, almost never. To the human, quite a lot. Your file name shows up in the recruiter’s attachment list and in the email they forward to the hiring manager, and a folder of documents called resume.pdf and resume-final-v3.pdf makes their afternoon harder. Use your name and the word resume, hyphenated, with the role appended if you tailored for it. It also acts as a fallback identifier if the parse loses your header.',
  },
  {
    question: 'Should I apply on the company’s own careers site or through the job board?',
    answer:
      'Through the company’s own site when both are available. Aggregator quick-apply flows sometimes deliver a stripped profile rather than your file, and the record that arrives can be thinner than the one you would have created directly. Applying on the employer’s portal also means you see the parsed-fields review screen and can correct it. Use the job board to find the role; use the employer’s site to apply for it.',
  },
  {
    question: 'Does a cover letter get parsed as well?',
    answer:
      'Usually it is stored and indexed as text alongside the resume, so terms in it are searchable, but it is rarely mapped into structured fields and many recruiters do not open it. Write it for the human: three short paragraphs on why this role, what you would bring to it, and one specific thing about the company that is true. Do not use it as a place to repeat your resume, and do not treat it as a second chance at keywords.',
  },
  {
    question: 'Will the same tailoring work on my LinkedIn profile?',
    answer:
      'The principle transfers, the mechanics do not. Recruiters search LinkedIn with boolean queries much like the ones they run in an applicant tracking system, so the same nouns matter — tools, certifications, methodologies, the job title you want next. But a profile is one document serving every search rather than a targeted one, so favour the terms that describe where you are going as well as where you have been, and keep the headline field specific.',
  },
];

/* -------------------------------------------------------------------------- */
/* Page                                                                        */
/* -------------------------------------------------------------------------- */

export default function AtsResumePage() {
  const freeSafeTemplates = atsSafeTemplates(5).filter((template) => !template.premium);

  return (
    <>
      <Section size="sm">
        <Breadcrumbs
          items={[
            { name: 'Home', path: '/' },
            { name: 'ATS resume', path: '/ats-resume' },
          ]}
        />
        <SectionHeading
          as="h1"
          align="left"
          eyebrow="ATS"
          title="ATS resume: tailoring, keywords and the file you actually upload"
          description={
            <>
              The practical side of applying through a portal — reading a job description for the
              terms that matter, matching them without stuffing, using headings a parser recognises,
              and knowing when a recruiter genuinely needs a Word file. For the technical account of
              how parsing works, read{' '}
              <Link href="/ats-cv" className="font-medium text-brand-700 underline underline-offset-2">
                how applicant tracking systems read your CV
              </Link>
              .
            </>
          }
        />
        <div className="mt-8 flex flex-wrap gap-3">
          <ButtonLink href="/register" size="lg">
            Build your resume — free
          </ButtonLink>
          <ButtonLink href="/ats-cv" size="lg" variant="outline">
            How parsing works
          </ButtonLink>
        </div>
      </Section>

      <Section tone="muted">
        <Prose>
          <h2>Read the posting the way a recruiter will search it</h2>
          <p>
            A job description is written by a hiring manager, but it is used by a recruiter as a
            source of search terms. Before you change a word of your resume, read the posting once
            with a highlighter and pull out the nouns. Verbs like <em>collaborate</em>,{' '}
            <em>drive</em> and <em>own</em> are decoration. What gets searched for is concrete:
          </p>
          <ul>
            <li>
              <strong>The job title itself</strong>, in the exact words the employer uses.
            </li>
            <li>
              <strong>Named software and systems</strong> — Salesforce, NetSuite, Epic, Figma,
              Kubernetes, SAP, whatever the posting names.
            </li>
            <li>
              <strong>Certifications and licences</strong> — CPA, PMP, RN, CISSP, ACCA, forklift,
              CDL. These are frequently used as hard filters.
            </li>
            <li>
              <strong>Methodologies and frameworks</strong> — Agile, Lean, SOX, HACCP, IFRS, GAAP.
            </li>
            <li>
              <strong>Domain nouns</strong> — B2B SaaS, Medicare, ecommerce, clinical trials, retail
              banking. These describe the environment, and hiring managers care about them more than
              they admit.
            </li>
          </ul>
          <p>
            Then split your list in two. Anything under <em>Requirements</em> or{' '}
            <em>Minimum qualifications</em> is a must-have; anything under <em>Preferred</em> or{' '}
            <em>Nice to have</em> is not. Cover every must-have you honestly hold, and do not lose
            sleep over the rest — postings routinely list a preferred set nobody in the world
            possesses in full.
          </p>

          <h2>Matching the description without stuffing it</h2>
          <h3>Put each term where the evidence is</h3>
          <p>
            A keyword is worth most when it sits in the same sentence as proof that you used it. A
            skills list containing the word <em>Kubernetes</em> gets you into a search result; a
            bullet that says you migrated forty services onto Kubernetes and cut deploy time by half
            gets you into the interview. Use the skills block for coverage and the experience
            bullets for weight, and make sure the four or five terms that matter most appear in
            both.
          </p>
          <h3>Spell it out once, abbreviate it once</h3>
          <p>
            Different recruiters search different forms of the same thing. Write{' '}
            <strong>search engine optimisation (SEO)</strong>, <strong>
              Certified Public Accountant (CPA)
            </strong>{' '}
            or <strong>objectives and key results (OKRs)</strong> the first time each appears, and
            use the short form after that. One expansion covers both queries. Doing it in every
            bullet does not double your chances; it just reads badly.
          </p>
          <h3>What stuffing looks like, and why it backfires</h3>
          <p>
            Stuffing is a block of nouns at the bottom of the page under a heading like{' '}
            <em>Keywords</em>, a skills list of forty tools you have opened once, or the old trick of
            white text at one point size. All three fail for the same reason: the text a system
            extracts is shown to the recruiter, so the padding is visible in exactly the place you
            hoped it would be hidden. Beyond that, anything you list is fair material for an
            interview question, and a candidate who cannot discuss the third item on their own
            skills list has done themselves real damage.
          </p>
        </Prose>
      </Section>

      <Section>
        <SectionHeading
          align="left"
          title="Section headings a parser recognises"
          description="Section detection works from a dictionary of known headings. Creative labelling is the most common self-inflicted parsing failure, and the easiest to undo."
        />
        <div className="mt-8 overflow-x-auto rounded-xl border border-ink-200">
          <table className="w-full min-w-[46rem] border-collapse text-left text-sm">
            <thead className="bg-ink-50">
              <tr>
                <th scope="col" className="px-4 py-3 font-semibold text-ink-950">
                  Use
                </th>
                <th scope="col" className="px-4 py-3 font-semibold text-ink-950">
                  Avoid
                </th>
                <th scope="col" className="px-4 py-3 font-semibold text-ink-950">
                  Why
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-200 text-ink-700">
              {HEADINGS.map((row) => (
                <tr key={row.use} className="align-top">
                  <th
                    scope="row"
                    className="px-4 py-4 text-left text-[13px] font-semibold text-ink-950"
                  >
                    {row.use}
                  </th>
                  <td className="px-4 py-4 text-[13px] leading-relaxed text-ink-500 line-through decoration-danger-500/60">
                    {row.avoid}
                  </td>
                  <td className="px-4 py-4 text-[13px] leading-relaxed">{row.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section tone="muted">
        <div className="grid gap-10 lg:grid-cols-2">
          <Prose className="max-w-none">
            <h2>Naming the file</h2>
            <p>
              Parsers barely look at the file name. Humans look at nothing else until they open it.
              Your document appears in a list of attachments, gets forwarded by email and ends up in
              a folder on a hiring manager&rsquo;s desktop next to forty others.
            </p>
            <ul>
              <li>
                <strong>Dana-Ito-Resume.pdf</strong> — the safe default.
              </li>
              <li>
                <strong>Dana-Ito-Resume-Warehouse-Supervisor.pdf</strong> — better when you tailored
                for the role and want that visible.
              </li>
              <li>
                Use hyphens or underscores rather than spaces; a handful of older upload widgets
                truncate at the first space.
              </li>
              <li>
                Strip <em>final</em>, <em>v3</em>, <em>(2)</em>, <em>copy</em> and dates. They tell
                the reader something you did not mean to say.
              </li>
              <li>
                Keep your surname in it. If the parse loses your header, the file name is the only
                thing left that identifies you.
              </li>
            </ul>
          </Prose>

          <Prose className="max-w-none">
            <h2>.docx or PDF?</h2>
            <p>
              Default to PDF. It is accepted by the systems in general use, it holds your layout on
              every machine, no font substitutes itself, and nobody can edit it by accident. The
              reputation PDF acquired for breaking applicant tracking systems came from image-only
              exports and design tools that convert text to outlines, not from the format.
            </p>
            <p>There are four situations where Word is genuinely the right answer:</p>
            <ul>
              <li>
                <strong>The upload widget says so.</strong> If the accepted-formats line lists only
                .doc and .docx, argue with nobody and send Word.
              </li>
              <li>
                <strong>A staffing agency asks.</strong> Agencies routinely restyle a candidate
                resume onto their own letterhead and remove your contact details before presenting
                you to the client. That needs an editable file, and it is a normal part of how they
                work.
              </li>
              <li>
                <strong>An internal referrer will paste from it.</strong> Someone copying your
                history into an internal form has an easier time with Word.
              </li>
              <li>
                <strong>The portal rejects your PDF.</strong> Some older systems fail on files over
                a size limit or on PDFs generated in unusual ways, and a Word upload is the fastest
                way past it.
              </li>
            </ul>
            <p>
              {site.name} exports PDF. When a portal insists on Word, paste your text into a blank
              document, apply the built-in heading styles, keep it to one column with no text boxes
              or tables, and check the page count afterwards — a font substitution can add a page
              you did not plan for. Federal applications in the US are a separate case again:
              USAJOBS has its own resume builder and its own expectations about length.
            </p>
          </Prose>
        </div>
      </Section>

      <Section>
        <SectionHeading
          align="left"
          title="Worked example: three bullets, tailored to one posting"
          description="The posting is for a Warehouse Operations Supervisor. Its requirements name shift leadership of 20+ associates, a warehouse management system, cycle counting, Lean and 5S, and OSHA compliance."
        />
        <div className="mt-8 flex flex-col gap-5">
          {BULLET_REWRITES.map((item, index) => (
            <div key={item.before} className="rounded-xl border border-ink-200 bg-white p-5 sm:p-6">
              <h3 className="text-sm font-bold tracking-wide text-ink-500 uppercase">
                Bullet {index + 1}
              </h3>
              <div className="mt-4 grid gap-4 lg:grid-cols-2">
                <div className="rounded-lg border border-ink-200 bg-ink-50 p-4">
                  <p className="text-2xs font-bold tracking-[0.12em] text-ink-500 uppercase">
                    Before
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-ink-700">{item.before}</p>
                </div>
                <div className="rounded-lg border border-success-500/30 bg-success-50 p-4">
                  <p className="text-2xs font-bold tracking-[0.12em] text-success-700 uppercase">
                    After
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-ink-800">{item.after}</p>
                </div>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-ink-600">
                <strong className="font-semibold text-ink-950">What changed:</strong> {item.changed}
              </p>
            </div>
          ))}
        </div>
        <p className="mt-6 max-w-3xl text-sm leading-relaxed text-ink-600">
          One rule governs all three rewrites: only claim what happened. If you have never touched
          the specific system the posting names, name the one you did use — a search for{' '}
          <em>WMS</em> still matches, and the recruiter reads the rest of the sentence and decides
          for themselves whether it transfers.
        </p>
      </Section>

      <Section tone="muted">
        <SectionHeading
          align="left"
          title={`${freeSafeTemplates.length} free templates with a 5/5 parsing score`}
          description="Single column, real text, conventional headings, contact details in the body — and available on the free plan, so tailoring a version per application costs nothing."
        />
        <TemplateGrid className="mt-8" templates={freeSafeTemplates} columns={5} />
      </Section>

      <Section>
        <FaqSection
          entries={FAQS}
          description="Tailoring, titles, file names and where to press submit."
        />
      </Section>

      <Section tone="muted">
        <CtaBanner
          title="Tailor a version in fifteen minutes"
          description="Duplicate your resume, change the title line, rewrite four bullets against the posting and export. Then do it again for the next one."
          primaryLabel="Start free"
          secondaryHref="/resume-examples"
          secondaryLabel="See full rewrites"
          note="Free plan includes every 5/5 template."
        />
        <div className="mt-16">
          <RelatedLinks
            title="Related guides"
            links={[
              {
                label: 'How an ATS reads your CV',
                href: '/ats-cv',
                description: 'Extraction, section detection and what actually breaks a parse.',
              },
              {
                label: 'Resume templates',
                href: '/resume-templates',
                description: 'One page, Letter paper and the rest of the US conventions.',
              },
              {
                label: 'Resume examples',
                href: '/resume-examples',
                description: 'Before-and-after rewrites of summaries, experience and skills.',
              },
              {
                label: 'All templates',
                href: '/templates',
                description: 'Browse every design with its column count and parsing score.',
              },
              {
                label: 'Online CV builder',
                href: '/cv-builder',
                description: 'Duplicate a document, tailor it and export in a couple of minutes.',
              },
              {
                label: 'Blog',
                href: '/blog',
                description: 'Longer guides on applications, interviews and job search.',
              },
            ]}
          />
        </div>
      </Section>
    </>
  );
}
