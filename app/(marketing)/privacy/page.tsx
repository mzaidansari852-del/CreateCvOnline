import type { Metadata } from 'next';
import Link from 'next/link';

import { LegalDocument, type LegalSection } from '@/components/marketing/LegalDocument';
import { pageMetadata } from '@/lib/seo/metadata';
import { site } from '@/lib/site';

export const metadata: Metadata = pageMetadata({
  title: 'Privacy Policy',
  description: `How ${site.name} collects, stores and deletes your account details and CV content, which processors are involved, and how to exercise your data-protection rights.`,
  path: '/privacy',
  noindex: false,
});

const SECTIONS: LegalSection[] = [
  {
    id: 'scope',
    title: 'Who we are and what this covers',
    body: (
      <>
        <p>
          This policy explains what happens to personal data when you use {site.name} at{' '}
          {site.domain} (&ldquo;the service&rdquo;). It covers the public website, the CV editor,
          the PDF export and the account area. It does not cover other websites you reach by
          following a link from here.
        </p>
        <p>
          For the purposes of data-protection law, the operator of {site.domain} is the data
          controller for the personal data described below. Questions, requests and complaints all
          go to <a href={`mailto:${site.supportEmail}`}>{site.supportEmail}</a>.
        </p>
        <p>
          A note that matters: a CV is unusually revealing. It typically contains your full name,
          contact details, employment history, education, and sometimes your photograph, nationality
          or date of birth. We treat the content of your documents as the most sensitive thing on
          the service, and the sections below say exactly who can reach it.
        </p>
      </>
    ),
  },
  {
    id: 'what-we-collect',
    title: 'What we collect',
    body: (
      <>
        <h3>Account data</h3>
        <p>
          Your e-mail address, a display name if you provide one, and the authentication method you
          used. If you sign in with Google, we receive your e-mail address, name and profile picture
          URL from Google. <strong>We never receive or store your password</strong> — authentication
          is handled by Firebase Authentication, and passwords never reach our application code.
        </p>
        <h3>CV content</h3>
        <p>
          Everything you type into the editor: personal details, work history, education, skills,
          languages, projects and any custom sections, plus the styling choices attached to each
          document. This is stored so you can come back to it, and for no other purpose.
        </p>
        <h3>Payment data</h3>
        <p>
          If you buy a plan, we store the Paddle transaction id, the plan purchased, the amount,
          the currency, the status and the time. <strong>We never see your card number.</strong>{' '}
          The checkout opens as an overlay on our page, but the form inside it is an iframe served
          by Paddle: card details are entered there and processed entirely by Paddle.
        </p>
        <h3>Usage and technical data</h3>
        <p>
          Ordinary server-side records needed to run and secure a web service: the number of CVs on
          your account, your download count for the current month, timestamps, and — for rate
          limiting and abuse prevention — a short-lived record derived from request headers. Contact
          form submissions also store the browser user-agent string.
        </p>
        <h3>Messages you send us</h3>
        <p>
          If you use the contact form or e-mail us, we keep your name, e-mail address, the subject
          and the message so we can reply and refer back to it.
        </p>
        <h3>Analytics</h3>
        <p>
          Analytics is <strong>optional and off unless configured</strong> by the operator of this
          deployment. Where it is enabled, it records event names such as{' '}
          <code>cv_created</code> or <code>payment_completed</code> together with low-cardinality
          properties such as a plan name. It deliberately never receives CV content, e-mail
          addresses or any free text you have typed, and IP anonymisation is enabled.
        </p>
      </>
    ),
  },
  {
    id: 'why',
    title: 'Why we process it, and on what basis',
    body: (
      <>
        <ul>
          <li>
            <strong>To provide the service</strong> — storing and rendering your CVs, exporting
            PDFs, keeping you signed in. Basis: performance of our contract with you.
          </li>
          <li>
            <strong>To take payment and honour refunds</strong> — recording orders and entitlements.
            Basis: performance of a contract, and our legal obligation to keep financial records.
          </li>
          <li>
            <strong>To keep the service secure and available</strong> — rate limiting, abuse
            prevention, error logs. Basis: our legitimate interest in a service that is not
            trivially abused.
          </li>
          <li>
            <strong>To answer your messages</strong>. Basis: our legitimate interest in supporting
            the people who use the product.
          </li>
          <li>
            <strong>To understand which features are used</strong>, where analytics is enabled.
            Basis: consent where required by local law, otherwise legitimate interest. Analytics is
            never necessary for the service to work.
          </li>
        </ul>
        <p>
          We do not use your data for automated decision-making that produces legal or similarly
          significant effects, and we do not build advertising profiles.
        </p>
      </>
    ),
  },
  {
    id: 'processors',
    title: 'Who else is involved',
    body: (
      <>
        <p>
          We keep the list of third parties deliberately short. Each one is a processor acting on
          our instructions, or an independent controller for the part of the transaction it owns.
        </p>
        <ul>
          <li>
            <strong>Google — Firebase Authentication.</strong> Creates and verifies accounts, and
            stores credentials. Receives your e-mail address and authentication metadata.
          </li>
          <li>
            <strong>Google — Cloud Firestore.</strong> The database that stores your profile, your
            CV documents, your payment records and contact messages.
          </li>
          <li>
            <strong>Paddle.</strong> Takes payments as the merchant of record for the sale, and is
            an independent controller for the transaction: the payment, the tax and the receipt are
            Paddle&apos;s to handle. Receives whatever you enter in its checkout; we receive only
            the transaction reference, amount, currency and status. Paddle&apos;s script also runs
            on our pages while the checkout is open, which the{' '}
            <Link href="/cookies">cookie policy</Link> sets out in detail.
          </li>
          <li>
            <strong>Google Fonts.</strong> Typefaces used by the interface and by the CV templates
            are requested from Google&apos;s font servers, which means your browser makes a request
            to Google when a page loads.
          </li>
          <li>
            <strong>Google Analytics</strong>, only if the operator of this deployment has
            configured a measurement id. See the{' '}
            <Link href="/cookies">cookie policy</Link>.
          </li>
          <li>
            <strong>Our hosting provider</strong>, which runs the application servers and therefore
            processes requests in transit.
          </li>
        </ul>
        <p>
          We do not sell, rent or trade personal data, and we do not share your CV content with
          recruiters, job boards or advertisers.
        </p>
      </>
    ),
  },
  {
    id: 'cookies',
    title: 'Cookies',
    body: (
      <>
        <p>
          We set one strictly necessary cookie so that you stay signed in. It is httpOnly, Secure in
          production and <code>SameSite=Lax</code>, and it contains a session token — not your CV
          and not your password. Analytics cookies are only set where analytics has been enabled by
          the operator.
        </p>
        <p>
          The full breakdown, including names, purposes and lifetimes, is in the{' '}
          <Link href="/cookies">cookie policy</Link>.
        </p>
      </>
    ),
  },
  {
    id: 'retention',
    title: 'How long we keep things',
    body: (
      <>
        <ul>
          <li>
            <strong>Your account and CVs:</strong> until you delete them, or until you delete your
            account. We do not expire documents for inactivity.
          </li>
          <li>
            <strong>Payment records:</strong> retained after account deletion only where and for as
            long as accounting or tax law requires the operator to keep a record of a transaction.
          </li>
          <li>
            <strong>Contact messages:</strong> kept while the conversation is open and for a
            reasonable period afterwards so we can recognise a follow-up.
          </li>
          <li>
            <strong>Rate-limiting records:</strong> seconds to minutes. They exist only to count
            requests within a short window.
          </li>
          <li>
            <strong>Analytics events:</strong> retained according to the retention period configured
            in the analytics product, which is controlled by the operator.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: 'transfers',
    title: 'Where your data is processed',
    body: (
      <>
        <p>
          Firebase and Firestore are Google Cloud services and the storage region is chosen by the
          operator of this deployment when the project is created. Paddle, Google Analytics and
          Google Fonts operate globally. That means your personal data may be processed outside the
          country you live in, including in the United States.
        </p>
        <p>
          Where data leaves the European Economic Area or the United Kingdom, transfers rely on the
          mechanisms offered by those providers, such as standard contractual clauses.{' '}
          <strong>
            The specific regions, contracts and transfer mechanisms for this deployment must be
            confirmed and documented by the operator before launch
          </strong>{' '}
          — this template cannot state them for you.
        </p>
      </>
    ),
  },
  {
    id: 'security',
    title: 'Security',
    body: (
      <>
        <p>The technical measures actually in place:</p>
        <ul>
          <li>All traffic is served over HTTPS.</li>
          <li>
            Passwords are never handled by our code. Sign-in produces a short-lived token that is
            exchanged once for an httpOnly session cookie, and every server render and API call
            re-verifies that cookie, including a revocation check — so signing out or disabling an
            account takes effect immediately.
          </li>
          <li>
            Every document read or write is scoped to the signed-in user&apos;s own account, and no
            request is ever trusted to tell us who it is.
          </li>
          <li>
            Every plan limit and paid feature is enforced on the server before the action runs,
            not merely hidden in the interface.
          </li>
          <li>API routes are rate-limited, and the contact form is additionally throttled.</li>
        </ul>
        <p>
          No system is perfectly secure, and we will not pretend otherwise. If you believe you have
          found a vulnerability, e-mail{' '}
          <a href={`mailto:${site.supportEmail}`}>{site.supportEmail}</a> with
          &ldquo;security&rdquo; in the subject and please give us a chance to fix it before
          publishing details.
        </p>
      </>
    ),
  },
  {
    id: 'your-rights',
    title: 'Your rights',
    body: (
      <>
        <p>
          Depending on where you live, data-protection law — including the UK and EU GDPR — gives
          you rights over your personal data. We aim to honour all of the following for everyone,
          regardless of location:
        </p>
        <ul>
          <li>
            <strong>Access</strong> — a copy of the personal data we hold about you.
          </li>
          <li>
            <strong>Rectification</strong> — correction of anything inaccurate. Most of it you can
            edit yourself in the app.
          </li>
          <li>
            <strong>Erasure</strong> — deletion of your account and its contents.
          </li>
          <li>
            <strong>Portability</strong> — your data in a structured, machine-readable format.
          </li>
          <li>
            <strong>Restriction and objection</strong> — ask us to pause processing, or object to
            processing based on legitimate interests.
          </li>
          <li>
            <strong>Withdrawing consent</strong> — where processing relies on consent, such as
            analytics, you can withdraw it at any time without affecting what happened before.
          </li>
          <li>
            <strong>Complaint</strong> — you may complain to your local supervisory authority. We
            would rather you told us first so we can put it right.
          </li>
        </ul>
        <p>
          To exercise any of these, e-mail{' '}
          <a href={`mailto:${site.supportEmail}`}>{site.supportEmail}</a> from the address on your
          account, or use the <Link href="/contact">contact form</Link>. We respond within 30 days
          and normally much sooner, and we do not charge for it.
        </p>
      </>
    ),
  },
  {
    id: 'export-delete',
    title: 'Exporting and deleting your data',
    body: (
      <>
        <p>
          You do not need to ask us for either of these. Both are available from your account
          settings.
        </p>
        <ul>
          <li>
            <strong>Export</strong> — download your profile and every CV you have created. You can
            also export any individual CV as a PDF at any time, within your plan&apos;s download
            allowance.
          </li>
          <li>
            <strong>Delete</strong> — deleting your account removes your authentication record,
            your profile document, every CV you have made and your stored payment records. It is
            not a &ldquo;deactivated&rdquo; flag on a row we keep. It cannot be undone, so export
            first if you want to keep anything.
          </li>
        </ul>
        <p>
          If a CV is published at a share link, deleting the CV or the account removes the link too.
          Copies that other people have already downloaded are, inevitably, outside our reach.
        </p>
        <p>
          If you cannot sign in, write to{' '}
          <a href={`mailto:${site.supportEmail}`}>{site.supportEmail}</a> from the registered
          address and we will verify and action it for you.
        </p>
      </>
    ),
  },
  {
    id: 'children',
    title: 'Children',
    body: (
      <>
        <p>
          The service is intended for people old enough to be entering the workforce and is not
          directed at young children. Accounts should not be created by anyone under the minimum age
          at which they can consent to online services in their country — 16 in much of the European
          Union, 13 in several other jurisdictions.
        </p>
        <p>
          If you believe a child has created an account, tell us and we will delete it. The exact
          minimum age applicable to this deployment should be fixed by the operator with legal
          advice.
        </p>
      </>
    ),
  },
  {
    id: 'changes',
    title: 'Changes to this policy',
    body: (
      <>
        <p>
          If we change how we handle personal data, we will update this page and change the
          &ldquo;last updated&rdquo; date at the top. For a change that materially reduces your
          rights or expands what we collect, we will make a reasonable effort to tell account
          holders directly rather than relying on you noticing a new date.
        </p>
        <p>
          Continuing to use the service after a change means the updated policy applies to you.
        </p>
      </>
    ),
  },
];

export default function PrivacyPolicyPage() {
  return (
    <LegalDocument
      title="Privacy policy"
      intro={`What ${site.name} collects, why, who else can see it, and how to get it back or have it deleted. Written to be read rather than to be survived.`}
      summary={[
        <>
          <strong>Your CV content is stored so you can edit it, and for nothing else.</strong> We
          do not sell it, share it with recruiters or train models on it.
        </>,
        <>
          <strong>We never see your password or your card number.</strong> Sign-in is handled by
          Firebase Authentication and payment by Paddle, in a form served from Paddle&apos;s own
          domain.
        </>,
        <>
          <strong>One cookie keeps you signed in.</strong> Analytics is optional, off unless
          configured, and never receives CV content or free text.
        </>,
        <>
          <strong>You can export everything and delete your account yourself</strong>, and deletion
          removes the account, the profile, every CV and the payment records.
        </>,
        <>
          <strong>The third parties are Google (Firebase and Firestore) and Paddle</strong>, plus
          Google Fonts for typefaces and, optionally, Google Analytics.
        </>,
      ]}
      sections={SECTIONS}
      relatedLinks={[
        { label: 'Cookie policy', href: '/cookies' },
        { label: 'Terms of service', href: '/terms' },
        { label: 'Refund policy', href: '/refund-policy' },
        { label: 'Contact us', href: '/contact' },
      ]}
    />
  );
}
