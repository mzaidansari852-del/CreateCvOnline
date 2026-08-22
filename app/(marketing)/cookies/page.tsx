import type { Metadata } from 'next';
import Link from 'next/link';

import { LegalDocument, type LegalSection } from '@/components/marketing/LegalDocument';
import { pageMetadata } from '@/lib/seo/metadata';
import { site } from '@/lib/site';

export const metadata: Metadata = pageMetadata({
  title: 'Cookie Policy',
  description: `Every cookie ${site.name} sets, what each is for and how long it lasts: one necessary session cookie, optional analytics and Paddle's own once you open the checkout.`,
  path: '/cookies',
});

/**
 * The cookie policy.
 *
 * Deliberately short, because the honest list is short: one strictly necessary session
 * cookie, analytics that is off unless the operator switches it on, and whatever Paddle
 * sets once the checkout is open. Anything longer than that would be padding.
 *
 * The Paddle section is the one that needs care. Under the old gateway the whole of
 * checkout happened on somebody else's domain, so the honest answer was "nothing of theirs
 * runs here". Paddle's overlay runs a script on our pages and embeds an iframe from theirs,
 * which is a different disclosure and has to read like one.
 */

/** Rendered inside `Prose`, so the plain table below picks up its own styling. */
function CookieTable({
  caption,
  rows,
}: {
  caption: string;
  rows: { name: string; purpose: string; type: string; duration: string }[];
}) {
  return (
    <div className="my-6 overflow-x-auto rounded-xl border border-ink-200">
      <table className="w-full border-collapse text-left text-sm">
        <caption className="sr-only">{caption}</caption>
        <thead className="bg-ink-50">
          <tr>
            {['Name', 'Purpose', 'Type', 'Duration'].map((heading) => (
              <th
                key={heading}
                scope="col"
                className="border-b border-ink-200 px-4 py-2.5 font-semibold text-ink-950"
              >
                {heading}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.name} className="border-b border-ink-100 last:border-0">
              <th scope="row" className="px-4 py-2.5 align-top font-mono text-[13px] text-ink-900">
                {row.name}
              </th>
              <td className="px-4 py-2.5 align-top text-ink-700">{row.purpose}</td>
              <td className="px-4 py-2.5 align-top text-ink-700">{row.type}</td>
              <td className="px-4 py-2.5 align-top text-ink-700">{row.duration}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const SECTIONS: LegalSection[] = [
  {
    id: 'summary',
    title: 'What this page covers',
    body: (
      <>
        <p>
          A cookie is a small piece of text a website asks your browser to store and send
          back on the next request. It is how a site recognises that two requests came from
          the same person — which is the only reason {site.name} uses one at all.
        </p>
        <p>
          This page lists everything {site.domain} stores in your browser: the cookies we
          set, the cookies a third party may set, and the browser storage that is not a
          cookie but is worth being straight about anyway. It sits alongside the{' '}
          <Link href="/privacy">privacy policy</Link>, which covers personal data more
          broadly.
        </p>
        <p>
          There is no advertising network here, no re-targeting pixel, no social embed and no
          third-party tag manager. If you block everything optional, the product still works
          in full.
        </p>
      </>
    ),
  },
  {
    id: 'essential',
    title: 'The one cookie we always set',
    body: (
      <>
        <p>
          Signing in mints exactly one cookie, named <code>__session</code>. It holds a
          Firebase session token — not your password, not your e-mail address and not
          anything from your CV. Without it there is no way to stay signed in between page
          loads, so it is strictly necessary and it is not something you can opt out of while
          using an account.
        </p>
        <p>Its properties, which you can verify in your browser&apos;s developer tools:</p>
        <ul>
          <li>
            <strong>
              <code>httpOnly</code>
            </strong>{' '}
            — JavaScript on the page cannot read it, which is what stops a script injection
            from stealing your session.
          </li>
          <li>
            <strong>
              <code>Secure</code>
            </strong>{' '}
            in production, so it is only ever sent over HTTPS.
          </li>
          <li>
            <strong>
              <code>SameSite=Lax</code>
            </strong>
            , so it is not attached to cross-site requests made by other websites.
          </li>
          <li>
            <strong>First-party.</strong> It is set on {site.domain} and sent nowhere else.
          </li>
        </ul>
        <p>
          Its lifetime is set by the operator of this deployment through the{' '}
          <code>SESSION_COOKIE_DAYS</code> environment variable, which defaults to{' '}
          <strong>5 days</strong> and cannot exceed 14 days — that ceiling is Firebase&apos;s,
          not ours. Signing out deletes the cookie immediately and revokes the session on the
          server, so a copy of the cookie taken beforehand is useless afterwards.
        </p>
        <p>
          The name is not decorative: Firebase Hosting only forwards a cookie called{' '}
          <code>__session</code> to server-rendered routes, so it is the one name this
          architecture can use.
        </p>
      </>
    ),
  },
  {
    id: 'analytics',
    title: 'Analytics cookies (optional, off unless configured)',
    body: (
      <>
        <p>
          Analytics is <strong>not switched on by default</strong>. A fresh installation of
          this software makes no analytics request at all and sets no analytics cookie. It
          only starts when the operator of a deployment sets a Google Analytics measurement
          id in <code>NEXT_PUBLIC_GA_MEASUREMENT_ID</code> — until then, the tag is never
          loaded and there is nothing on the page to block.
        </p>
        <p>
          Where it is enabled, Google Analytics 4 sets two first-party cookies:{' '}
          <code>_ga</code>, which holds a random identifier for a browser, and{' '}
          <code>_ga_&lt;measurement-id&gt;</code>, which keeps session state. Both are set by
          Google&apos;s script and their duration is Google&apos;s default of roughly two
          years unless the operator shortens it in the Analytics property.
        </p>
        <p>
          We configure the tag with <code>anonymize_ip</code> enabled and with automatic page
          views switched off, so page paths are reported deliberately rather than swept up.
          The events recorded are product events with low-cardinality properties — a plan
          name, a template category. <strong>No CV content, no e-mail address and no free
          text you have typed is ever sent to analytics.</strong>
        </p>
        <p>
          The same GA4 cookies appear if the operator has instead configured Firebase
          Analytics through <code>NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID</code>, because Firebase
          Analytics is Google Analytics underneath.
        </p>
        <p>
          <strong>
            This software does not ship a consent banner, and where local law requires prior
            consent for analytics cookies the operator must add one before enabling analytics.
          </strong>{' '}
          That is a deployment decision, not something this template can make for you.
        </p>
      </>
    ),
  },
  {
    id: 'paddle',
    title: 'Paddle cookies during checkout',
    body: (
      <>
        <p>
          Buying a plan does not send you anywhere. Paddle&apos;s checkout opens as an overlay
          on the page you are already on, which means two third-party things happen inside
          your browser on {site.domain}: our page loads Paddle&apos;s script from{' '}
          <code>https://cdn.paddle.com/paddle/v2/paddle.js</code>, and that script embeds the
          payment form as an iframe served from Paddle&apos;s own domain,{' '}
          <code>buy.paddle.com</code>. Both happen only when you press a buy button — no page
          of this site loads Paddle before that.
        </p>
        <p>
          <strong>Paddle sets cookies of its own.</strong> They are for its own purposes:
          carrying your progress through the checkout, and the fraud and risk checks that come
          with taking a payment. Because Paddle&apos;s script runs on our pages as well as
          inside its iframe, one of its cookies can appear listed under {site.domain} in your
          browser&apos;s developer tools rather than only under a Paddle domain. Either way it
          is Paddle&apos;s: we do not read it, we do not set it and we cannot tell it what to
          contain. It is governed by{' '}
          <a
            href="https://www.paddle.com/legal/cookies"
            target="_blank"
            rel="noopener noreferrer"
          >
            Paddle&apos;s own cookie policy
          </a>
          , not by this one.
        </p>
        <p>
          What does not change is where your card details go. You type them into Paddle&apos;s
          iframe, which is Paddle&apos;s page inside a frame on ours — the keystrokes are not
          readable by our code and the number never reaches our servers. When the payment
          completes, what comes back to us is a transaction reference, and our server confirms
          that transaction with Paddle directly before any plan is unlocked.
        </p>
      </>
    ),
  },
  {
    id: 'local-storage',
    title: 'Browser storage that is not a cookie',
    body: (
      <>
        <p>
          <strong>
            Your dashboard preferences are kept in <code>localStorage</code>, not in a cookie.
          </strong>{' '}
          The distinction matters: <code>localStorage</code> is never attached to a network
          request, so this data is only ever read by the page you are looking at and is never
          transmitted to us or to anyone else.
        </p>
        <p>
          One key is used, <code>createcvonline:preferences</code>, and it holds two things:
          the paper size (A4 or US Letter) and the template you want pre-selected when you
          start a new CV. It is scoped to the browser and the device that set it, which is why
          those choices do not follow you to another computer.
        </p>
        <p>
          It has no expiry date, because there is no mechanism to give it one — it stays until
          you clear site data for {site.domain} in your browser, at which point the settings
          simply return to their defaults. Nothing breaks.
        </p>
      </>
    ),
  },
  {
    id: 'table',
    title: 'The complete list',
    body: (
      <>
        <p>
          Everything the site can store in your browser, in one table. Nothing else is set by{' '}
          {site.domain}.
        </p>
        <CookieTable
          caption="Every cookie and browser storage item used by this site, with its purpose, type and duration"
          rows={[
            {
              name: '__session',
              purpose:
                'Keeps you signed in. Holds a Firebase session token, verified and revocation-checked on every server render and API call.',
              type: 'First-party cookie · strictly necessary · httpOnly',
              duration: 'SESSION_COOKIE_DAYS, default 5 days (14-day maximum). Deleted on sign-out.',
            },
            {
              /*
               * This row was missing, and the omission was not cosmetic: `proxy.ts` has been
               * setting this cookie on every navigation to a translated page, and a cookie
               * policy that claims to be "the complete list" while omitting one is a worse
               * document than one that never made the claim. Found while adding Dutch.
               */
              name: 'cvo_locale',
              purpose:
                'Remembers which language you were reading the site in, so that signing up from a French or Dutch page does not land you in an English dashboard. Written only when you navigate to a translated page and only when the value changes. Holds a language code and nothing else.',
              type: 'First-party cookie · functional · readable by page script',
              duration: '1 year',
            },
            {
              name: '_ga',
              purpose:
                'Google Analytics: distinguishes one browser from another. Only present if the operator has configured a measurement id.',
              type: 'First-party cookie · analytics · optional',
              duration: 'Google default, approximately 2 years',
            },
            {
              name: '_ga_<measurement-id>',
              purpose:
                'Google Analytics: keeps analytics session state. Only present if the operator has configured a measurement id.',
              type: 'First-party cookie · analytics · optional',
              duration: 'Google default, approximately 2 years',
            },
            {
              name: 'Paddle cookies',
              purpose:
                'Set by Paddle once you open the checkout: checkout progress, fraud and risk checks. Paddle’s script runs on our pages and its payment form is an iframe on Paddle’s domain, so these can appear under either domain. We cannot read or control them.',
              type: 'Third-party cookies, set by Paddle · only after you open the checkout',
              duration: 'Determined by Paddle',
            },
            {
              name: 'createcvonline:preferences',
              purpose:
                'Not a cookie. A localStorage entry holding your default paper size and pre-selected template. Never sent in a network request.',
              type: 'localStorage · first-party · functional',
              duration: 'Until you clear site data for this domain',
            },
          ]}
        />
        <p>
          Fonts are a related detail that is not a cookie: the interface and the CV templates
          request typefaces from Google Fonts, so your browser contacts Google when a page
          loads. That request sets no cookie on our domain, but it is a third-party connection
          and it is listed in the <Link href="/privacy">privacy policy</Link> for the sake of
          completeness.
        </p>
      </>
    ),
  },
  {
    id: 'managing',
    title: 'How to control them',
    body: (
      <>
        <p>
          Every browser lets you view, block and delete cookies for a specific site, usually
          under a &ldquo;Privacy&rdquo;, &ldquo;Site settings&rdquo; or &ldquo;Cookies and site
          data&rdquo; heading. Clearing site data for {site.domain} removes both the session
          cookie and the <code>localStorage</code> entry above.
        </p>
        <ul>
          <li>
            <strong>Blocking the session cookie</strong> means you cannot stay signed in. The
            public site — templates, examples, guides, pricing — still works in full, but the
            editor and the dashboard will bounce you back to the sign-in page, because there
            is genuinely no other way for the server to know it is you.
          </li>
          <li>
            <strong>Blocking analytics</strong> costs you nothing. No feature depends on it. A
            browser tracking-protection setting, an extension, or the browser&apos;s{' '}
            &ldquo;Do Not Track&rdquo; signal will all stop it, and where analytics has not
            been configured there is nothing to block in the first place.
          </li>
          <li>
            <strong>Blocking Paddle</strong> — through a content blocker, a strict
            tracking-protection mode, or a rule against <code>cdn.paddle.com</code> — stops the
            checkout overlay from opening at all, because the form is Paddle&apos;s. Everything
            except buying a plan carries on working.
          </li>
          <li>
            <strong>Signing out</strong> is the cleanest way to remove the session cookie: it
            deletes it and revokes the session server-side in one step.
          </li>
        </ul>
        <p>
          You can also opt out of Google Analytics across every site you visit with{' '}
          <a
            href="https://tools.google.com/dlpage/gaoptout"
            target="_blank"
            rel="noopener noreferrer"
          >
            Google&apos;s browser add-on
          </a>
          .
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
          If we add a cookie, this page changes before the cookie ships, and the &ldquo;last
          updated&rdquo; date at the top changes with it. We have no plans to add advertising
          or re-targeting cookies; if that ever changed it would be a material change and we
          would say so plainly rather than quietly editing a table.
        </p>
        <p>
          Questions, or something here that does not match what you see in your browser? Tell
          us at <a href={`mailto:${site.supportEmail}`}>{site.supportEmail}</a> — a policy that
          disagrees with the software is a bug in one of the two.
        </p>
      </>
    ),
  },
];

export default function CookiePolicyPage() {
  return (
    <LegalDocument
      title="Cookie policy"
      intro={`Exactly what ${site.name} stores in your browser, why each item exists and how long it lasts. The list is short, and most of it is optional.`}
      summary={[
        <>
          <strong>One cookie is always set: the sign-in session.</strong> It is httpOnly,
          Secure, <code>SameSite=Lax</code>, first-party, and lasts 5 days by default.
        </>,
        <>
          <strong>Analytics is off unless the operator switches it on.</strong> A fresh
          installation loads no analytics script and sets no analytics cookie.
        </>,
        <>
          <strong>Paddle sets its own cookies once you open the checkout.</strong> Its script
          loads on our pages and its payment form is an iframe on Paddle&apos;s domain, so a
          Paddle cookie can appear under either.
        </>,
        <>
          <strong>Your dashboard preferences use localStorage, which is not a cookie</strong>{' '}
          and is never sent in a network request.
        </>,
        <>
          <strong>No advertising, no re-targeting, no tracking pixels, no social embeds.</strong>{' '}
          Block everything optional and the product still works in full.
        </>,
      ]}
      sections={SECTIONS}
      relatedLinks={[
        { label: 'Privacy policy', href: '/privacy' },
        { label: 'Terms of service', href: '/terms' },
        { label: 'Refund policy', href: '/refund-policy' },
        { label: 'Contact us', href: '/contact' },
      ]}
    />
  );
}
