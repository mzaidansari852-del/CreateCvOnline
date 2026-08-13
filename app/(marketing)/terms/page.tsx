import type { Metadata } from 'next';
import Link from 'next/link';

import { LegalDocument, type LegalSection } from '@/components/marketing/LegalDocument';
import { TEMPLATE_COUNT } from '@/lib/cv/template-registry';
import { publicEnv } from '@/lib/env';
import { PLANS } from '@/lib/plans';
import { pageMetadata } from '@/lib/seo/metadata';
import { site } from '@/lib/site';

export const metadata: Metadata = pageMetadata({
  title: 'Terms of Service',
  description: `The agreement between you and ${site.name}: what the service does, what you may do with it, how plans and payments work, and the limits of what we promise.`,
  path: '/terms',
  noindex: false,
});

const free = PLANS.free;
const pro = PLANS.pro;
const lifetime = PLANS.lifetime;

const SECTIONS: LegalSection[] = [
  {
    id: 'agreement',
    title: 'This agreement',
    body: (
      <>
        <p>
          These terms are the agreement between you and the operator of {site.name} at{' '}
          {site.domain}. By creating an account or using the service you accept them. If you do not
          accept them, do not use the service.
        </p>
        <p>
          Two other documents form part of this agreement: the{' '}
          <Link href="/privacy">privacy policy</Link> and the{' '}
          <Link href="/refund-policy">refund policy</Link>. Where the refund policy is more generous
          to you than these terms, the refund policy wins.
        </p>
      </>
    ),
  },
  {
    id: 'service',
    title: 'What the service is',
    body: (
      <>
        <p>
          {site.name} is an online CV and resume builder. It lets you write a structured document,
          render it with one of {TEMPLATE_COUNT} templates, preview it at true page size, export it
          as a PDF, keep more than one version, and — on paid plans — publish it at a link.
        </p>
        <p>
          It is a document tool. It is not a recruitment agency, a job board, a career-advice
          service or a guarantee of employment. Nothing in the product should be read as a promise
          that a particular CV will be shortlisted, parsed correctly by a particular employer&apos;s
          software, or lead to an interview.
        </p>
      </>
    ),
  },
  {
    id: 'accounts',
    title: 'Your account',
    body: (
      <>
        <ul>
          <li>
            You need an account to save work. Give an e-mail address you actually control — it is
            how we verify a refund request or a deletion request.
          </li>
          <li>
            Keep your credentials to yourself. You are responsible for activity under your account,
            except where it results from our own failure.
          </li>
          <li>
            One person, one account. You may not share an account with other people or resell access
            to it.
          </li>
          <li>
            You must be old enough to enter into a contract where you live, and old enough to
            consent to online services under your local law. The applicable minimum age must be
            confirmed by the operator with legal advice.
          </li>
          <li>
            Tell us at <a href={`mailto:${site.supportEmail}`}>{site.supportEmail}</a> if you think
            someone else has accessed your account.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: 'plans',
    title: 'Plans, prices and payment',
    body: (
      <>
        <p>
          The current plans and every limit attached to them are published on the{' '}
          <Link href="/pricing">pricing page</Link>, which is generated from the same definition the
          server enforces.
        </p>
        <ul>
          <li>
            <strong>{free.name}</strong> costs nothing, requires no card and does not expire.
          </li>
          <li>
            <strong>{pro.name}</strong> is a single payment of {pro.price}{' '}
            {publicEnv.paypalCurrency} granting {pro.accessDays} days of access.
          </li>
          <li>
            <strong>{lifetime.name}</strong> is a single payment of {lifetime.price}{' '}
            {publicEnv.paypalCurrency} with no expiry date on the account.
          </li>
        </ul>
        <p>
          <strong>Nothing renews automatically.</strong> We do not store a payment method and we do
          not create a recurring billing agreement, so there is no subscription to cancel. When a
          paid period ends, the account returns to the free plan on its own.
        </p>
        <p>
          Payment is taken by PayPal. Access is granted only after our server has confirmed with
          PayPal that the payment completed and that the amount and currency match the plan
          ordered. Prices are shown in {publicEnv.paypalCurrency}; conversion and any cross-border
          fee charged by your bank or PayPal are between you and them.
        </p>
        <p>
          We may change prices. A change never affects a payment already made, and access you have
          already bought is honoured in full.
        </p>
      </>
    ),
  },
  {
    id: 'refunds',
    title: 'Refunds',
    body: (
      <>
        <p>
          Every paid plan carries a <strong>14-day refund window</strong>, for any reason, including
          changing your mind. The full terms, the handful of cases it does not cover and how to ask
          are set out in the <Link href="/refund-policy">refund policy</Link>.
        </p>
        <p>
          Where you have a statutory right of withdrawal for digital content — for example as a
          consumer in the EU or UK — that right applies in addition to this policy, and nothing here
          reduces it.
        </p>
      </>
    ),
  },
  {
    id: 'your-content',
    title: 'Your content',
    body: (
      <>
        <p>
          <strong>Your CV is yours.</strong> You keep every right in the text, dates, achievements
          and any image you upload. We claim no ownership of it.
        </p>
        <p>
          To operate the service you grant us a limited, non-exclusive, worldwide, royalty-free
          licence to store, copy, transmit and render your content — strictly for the purposes of
          showing it to you, rendering your preview, generating your PDF, and serving a share link
          you have deliberately published. The licence exists so that saving a file and generating a
          PDF is lawful. It ends when you delete the content or your account.
        </p>
        <p>You confirm that:</p>
        <ul>
          <li>the content is yours to publish, and does not infringe anyone else&apos;s rights;</li>
          <li>
            it is accurate to the best of your knowledge. Misrepresenting qualifications or
            employment history is your risk, not ours;
          </li>
          <li>
            any personal data of other people you include — a referee&apos;s phone number, for
            instance — is included with a lawful basis for doing so.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: 'our-content',
    title: 'Our templates and the site',
    body: (
      <>
        <p>
          The templates, the software, the site design, the written guides and the {site.name} name
          and logo belong to the operator or its licensors.
        </p>
        <p>
          You may use the templates to create, export, print, share and distribute your own CVs and
          resumes, commercially or otherwise, with no attribution required on the paid plans. That
          is what they are for.
        </p>
        <p>You may not:</p>
        <ul>
          <li>
            redistribute, resell, sublicense or publish the templates themselves as templates,
            whether modified or not;
          </li>
          <li>
            use the templates to build or operate a competing CV builder or template marketplace;
          </li>
          <li>
            scrape, mirror or bulk-download the site, or use automated means to extract the
            templates or content;
          </li>
          <li>
            remove the small credit line from a free-plan export by editing the exported file; if
            you want it gone, a paid plan removes it properly.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: 'acceptable-use',
    title: 'Acceptable use',
    body: (
      <>
        <p>Do not use the service to:</p>
        <ul>
          <li>break the law, or help anyone else to;</li>
          <li>
            impersonate a real person, or create documents intended to deceive an employer about who
            you are;
          </li>
          <li>
            upload content that is unlawful, defamatory, hateful, or that infringes someone
            else&apos;s intellectual property or privacy;
          </li>
          <li>
            attack, probe or overload the service, circumvent rate limits, or attempt to reach
            another user&apos;s documents;
          </li>
          <li>
            evade plan limits — for example by creating multiple accounts to obtain additional free
            downloads;
          </li>
          <li>
            use the share-link feature to host material that has nothing to do with a CV.
          </li>
        </ul>
        <p>
          Security research is welcome if it is responsible: do not use another person&apos;s data,
          and tell us before you tell anyone else.
        </p>
      </>
    ),
  },
  {
    id: 'availability',
    title: 'Availability and changes',
    body: (
      <>
        <p>
          We aim to keep the service up, but we do not offer a service-level guarantee. It may be
          unavailable for maintenance, for a provider outage outside our control, or because
          something broke.
        </p>
        <p>
          Features may change. We may add, alter or withdraw functionality — including individual
          templates — where it is necessary to keep the product maintainable or lawful. If we remove
          something you paid for and cannot offer an equivalent, tell us and we will discuss a
          refund of the affected period.
        </p>
        <p>
          If the service were ever to close, we would give notice and a way to export everything you
          have made.
        </p>
      </>
    ),
  },
  {
    id: 'suspension',
    title: 'Suspension and termination',
    body: (
      <>
        <p>
          You can stop at any time. Delete a CV, or delete your entire account from your account
          settings; deletion is real and immediate.
        </p>
        <p>
          We may suspend or terminate an account that breaches these terms — in particular the
          acceptable-use section — or where we are required to by law. Except where a breach is
          serious or unlawful, we will contact you first and give you a chance to put it right. If
          we terminate an account that has unused paid time and the cause was not a serious breach
          by you, we will refund the unused portion.
        </p>
      </>
    ),
  },
  {
    id: 'disclaimers',
    title: 'Disclaimers',
    body: (
      <>
        <p>
          To the fullest extent the law allows, the service is provided &ldquo;as is&rdquo;. We do
          not warrant that it will be uninterrupted, error-free, or fit for a particular purpose
          beyond what is described on this site.
        </p>
        <p>Specifically, and because these are the promises this industry likes to make:</p>
        <ul>
          <li>
            <strong>We do not guarantee that a CV will be parsed correctly</strong> by any
            particular applicant tracking system. We publish a per-template score describing the
            structural choices we control; the rest depends on software configured by each employer.
          </li>
          <li>
            <strong>We do not guarantee an interview, a job offer or any career outcome.</strong>
          </li>
          <li>
            <strong>We do not check your content for accuracy</strong>, spelling or suitability, and
            we are not responsible for what you choose to write about yourself.
          </li>
        </ul>
        <p>
          Nothing in these terms excludes liability that cannot lawfully be excluded — including for
          death or personal injury caused by negligence, or for fraud — and consumer rights that
          apply where you live are unaffected.
        </p>
      </>
    ),
  },
  {
    id: 'liability',
    title: 'Limitation of liability',
    body: (
      <>
        <p>
          To the extent permitted by law, we are not liable for indirect or consequential loss, loss
          of profit, loss of opportunity, or loss of a job or contract arising from your use of the
          service.
        </p>
        <p>
          Where liability cannot be excluded, our total liability to you for all claims connected
          with the service is limited to the greater of (a) the total amount you paid us in the
          twelve months before the claim arose, and (b) a nominal sum reflecting that the free plan
          is provided at no charge.
        </p>
        <p>
          <strong>
            The exact figures and carve-outs in this section must be reviewed by a qualified lawyer
            for the jurisdiction the service operates in.
          </strong>{' '}
          A limitation clause that is unenforceable protects nobody.
        </p>
      </>
    ),
  },
  {
    id: 'indemnity',
    title: 'Your responsibility to us',
    body: (
      <p>
        If a third party brings a claim against us because of content you created or published
        through the service — for example, material you did not have the right to use — you agree to
        be responsible for the reasonable costs of dealing with it, provided we tell you promptly
        and let you take part in the response.
      </p>
    ),
  },
  {
    id: 'law',
    title: 'Governing law and disputes',
    body: (
      <>
        <p>
          <strong>
            The governing law and the competent courts for this deployment must be set by the
            operator with legal advice before launch.
          </strong>{' '}
          They depend on where the operating entity is established and where its users are, and this
          template deliberately does not guess.
        </p>
        <p>
          Whatever is chosen, mandatory consumer-protection rules in your country of residence
          continue to apply, and you keep the right to bring proceedings in your local courts where
          the law gives you that right.
        </p>
        <p>
          Before any of that: e-mail{' '}
          <a href={`mailto:${site.supportEmail}`}>{site.supportEmail}</a>. Almost everything is a
          misunderstanding that a reply can fix, and we would rather refund you than argue with you.
        </p>
      </>
    ),
  },
  {
    id: 'changes',
    title: 'Changes to these terms',
    body: (
      <>
        <p>
          We may update these terms. The &ldquo;last updated&rdquo; date at the top always reflects
          the current version. For a change that materially affects your rights we will make a
          reasonable effort to notify account holders rather than relying on you re-reading this
          page.
        </p>
        <p>
          Continuing to use the service after a change means you accept the updated terms. If you do
          not, delete your account — and if you are inside a paid period you did not get the benefit
          of, ask us for a refund.
        </p>
      </>
    ),
  },
];

export default function TermsPage() {
  return (
    <LegalDocument
      title="Terms of service"
      intro={`The rules of using ${site.name}: what the service does, what you may do with the templates, how payment works, and the honest limits of what we promise.`}
      summary={[
        <>
          <strong>Your CV is yours.</strong> We only get the licence needed to store it, render it
          and generate your PDF, and it ends when you delete the content.
        </>,
        <>
          <strong>Use the templates for your own CVs freely</strong> — but do not resell them as
          templates or use them to build a competing builder.
        </>,
        <>
          <strong>Nothing renews automatically</strong>, no card is stored, and there is no
          subscription to cancel.
        </>,
        <>
          <strong>We do not promise a job, an interview, or perfect ATS parsing.</strong> We promise
          a document tool that behaves as described.
        </>,
        <>
          <strong>Delete your account whenever you like</strong>, and ask for a refund within 14
          days of a payment.
        </>,
      ]}
      sections={SECTIONS}
      relatedLinks={[
        { label: 'Privacy policy', href: '/privacy' },
        { label: 'Cookie policy', href: '/cookies' },
        { label: 'Refund policy', href: '/refund-policy' },
        { label: 'Pricing', href: '/pricing' },
      ]}
    />
  );
}
