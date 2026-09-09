import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import { AdminPageHeader, Env } from '@/components/admin/primitives';
import { Alert, Badge, type BadgeTone } from '@/components/ui/feedback';
import { Card, Panel } from '@/components/ui/card';
import { requireAdmin } from '@/lib/auth/guards';
import {
  isFirebaseClientConfigured,
  isPayPalConfigured,
  isPolarConfigured,
  publicEnv,
  serverEnv,
} from '@/lib/env';
import { availableGateways } from '@/lib/payments';
import {
  describePolarAccessToken,
  explainPolarProductIdProblem,
  explainPolarTokenProblem,
} from '@/lib/payments/polar-token';
import { hasAdminCredentials } from '@/lib/firebase/admin';
import { privateMetadata } from '@/lib/seo/metadata';
import { site } from '@/lib/site';

export const metadata: Metadata = privateMetadata(
  'Settings',
  'What this deployment has configured, and what it does not.',
);

/**
 * Operational readiness, not a settings form.
 *
 * Everything this product can be configured with lives in environment variables, which a
 * running process cannot rewrite for itself. So this page reports state and names the
 * variable to set — it never offers a toggle that would silently do nothing.
 *
 * It reports *presence only*. No secret, key, or credential value is read into the page.
 */

/** The literal `lib/env.ts` falls back to when no PDF render secret is configured. */
const INSECURE_RENDER_SECRET = 'createcvonline-insecure-development-render-secret';

type State = 'ready' | 'partial' | 'missing';

const stateTone: Record<State, BadgeTone> = {
  ready: 'success',
  partial: 'warning',
  missing: 'danger',
};

const stateLabel: Record<State, string> = {
  ready: 'Configured',
  partial: 'Partly configured',
  missing: 'Not configured',
};

export default async function AdminSettingsPage() {
  await requireAdmin();

  const env = serverEnv();
  // `isPolarConfigured()` is the yes/no check; the object carries the detail to show.
  const polar = isPolarConfigured() ? env.polar : null;
  const paypal = isPayPalConfigured() ? env.paypal : null;
  /*
   * What the checkout page will actually offer, asked of the same function the page calls
   * rather than re-derived here. Two cards can both say "Configured" while the checkout
   * shows one button or none, and this is the line that settles which.
   */
  const gateways = availableGateways();
  /*
   * Read straight from `process.env` rather than from `env.polar` — a token that fails the
   * format check leaves `polar` null, and this report is the only thing that can say why.
   * It returns lengths and fixed prefixes, never any part of the random portion.
   */
  const polarToken = describePolarAccessToken(process.env.POLAR_ACCESS_TOKEN?.trim());
  const polarProductProblems = [
    explainPolarProductIdProblem('POLAR_PRODUCT_PRO', process.env.POLAR_PRODUCT_PRO?.trim()),
    explainPolarProductIdProblem(
      'POLAR_PRODUCT_LIFETIME',
      process.env.POLAR_PRODUCT_LIFETIME?.trim(),
    ),
  ].filter((problem): problem is string => problem !== null);
  const firebaseAdminReady = hasAdminCredentials();
  const analyticsId = publicEnv.gaMeasurementId;
  const pdfPinned = Boolean(env.pdf.browserWSEndpoint || env.pdf.executablePath);
  const pdfSecretIsDefault = env.pdf.renderSecret === INSECURE_RENDER_SECRET;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Settings"
        description={`What this ${site.name} deployment has configured. Every value below is read from the environment at request time; this page reports whether something is present, never what it is.`}
      />

      <Alert tone="info" title="There is nothing to change here">
        <p>
          Configuration is environment variables, and a running server cannot edit its own
          environment. Set the named variables on your host — Vercel project settings, a{' '}
          <Env>.env.local</Env> file in development — and restart. <Env>.env.example</Env>{' '}
          in the repository lists every variable with an explanation.
        </p>
      </Alert>

      <div className="grid gap-4">
        <ReadinessCard
          title="Firebase Admin SDK"
          state={firebaseAdminReady ? 'ready' : 'missing'}
          summary={
            firebaseAdminReady
              ? 'Service-account credentials are present. Sessions, Firestore reads and every admin action work.'
              : 'No service-account credentials. Sign-in, all Firestore access and this console cannot function.'
          }
          variables={[
            'FIREBASE_PROJECT_ID',
            'FIREBASE_CLIENT_EMAIL',
            'FIREBASE_PRIVATE_KEY',
          ]}
          note={
            <>
              A single <Env>FIREBASE_SERVICE_ACCOUNT_JSON</Env> holding the whole key file is
              accepted instead of the three separate variables. Download one from Firebase
              Console → Project settings → Service accounts.
            </>
          }
        />

        <ReadinessCard
          title="Firebase browser SDK"
          state={isFirebaseClientConfigured ? 'ready' : 'missing'}
          summary={
            isFirebaseClientConfigured
              ? 'The browser can sign users in against this Firebase project.'
              : 'The sign-in form cannot reach Firebase, so nobody can log in.'
          }
          variables={[
            'NEXT_PUBLIC_FIREBASE_API_KEY',
            'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
            'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
            'NEXT_PUBLIC_FIREBASE_APP_ID',
          ]}
          note={
            <>
              These are public by design — they ship in the browser bundle. Access is
              controlled by Firebase security rules, not by hiding them.
            </>
          }
        />

        <ReadinessCard
          title="Polar"
          state={polar ? (polar.webhookSecret ? 'ready' : 'partial') : 'missing'}
          summary={
            polar
              ? `Checkout is configured against the ${polar.environment} environment.${
                  polar.webhookSecret
                    ? ''
                    : ' No webhook secret is set, so the webhook route rejects every event with a 403 and a plan is granted only if the customer’s browser finishes the verify step.'
                }`
              : 'Checkout is disabled. Purchase routes answer 503 and the pricing page cannot take money.'
          }
          badges={
            polar
              ? [
                  {
                    label: polar.environment === 'production' ? 'Live' : 'Sandbox',
                    tone: polar.environment === 'production' ? 'accent' : 'neutral',
                  },
                ]
              : []
          }
          variables={[
            'POLAR_ACCESS_TOKEN',
            'POLAR_PRODUCT_PRO',
            'POLAR_PRODUCT_LIFETIME',
            'POLAR_WEBHOOK_SECRET',
            'POLAR_ENVIRONMENT',
          ]}
          note={
            <>
              <Env>POLAR_ENVIRONMENT</Env> accepts <Env>sandbox</Env> or{' '}
              <Env>production</Env> and defaults to sandbox, so a deployment that takes real
              money must set it explicitly. Store currency:{' '}
              <span className="font-medium">{publicEnv.storeCurrency}</span>.
              {polarToken.problem ? (
                <span className="mt-2 block">
                  <strong className="font-semibold">Check the access token.</strong>{' '}
                  {explainPolarTokenProblem(polarToken)}
                </span>
              ) : null}
              {polarProductProblems.map((problem) => (
                <span key={problem} className="mt-2 block">
                  <strong className="font-semibold">Check the product ids.</strong> {problem}
                </span>
              ))}
              <span className="mt-2 block">
                <strong className="font-semibold">
                  A green badge here does not prove the environment is right.
                </strong>{' '}
                Polar’s access tokens use the same <Env>polar_oat_</Env> prefix in sandbox and
                production, so nothing on this page can tell a sandbox token apart from a live
                one — the badge reports what <Env>POLAR_ENVIRONMENT</Env> claims. The build
                refuses to start if that says <Env>sandbox</Env> on a Vercel production
                deployment, which is the guard that actually stands between a mis-set variable
                and free Pro accounts.
              </span>
              <span className="mt-2 block">
                For the fuller picture — including whether the configured products exist in
                this Polar organisation — open <Env>/api/payments/polar/status?probe=1</Env>,
                which asks Polar directly and returns its own error text. That probe is also
                the closest thing to an environment check: a token pointed at the wrong
                environment cannot see the other one’s products.
              </span>
            </>
          }
        />

        <ReadinessCard
          title="PayPal"
          state={paypal ? (paypal.webhookId ? 'ready' : 'partial') : 'missing'}
          summary={
            paypal
              ? `The interim gateway, configured against the ${paypal.environment} environment.${
                  paypal.webhookId
                    ? ''
                    : ' No webhook id is set, so the webhook route rejects every event and a plan is granted only if the customer’s browser finishes the capture step.'
                }`
              : 'Not offered at checkout. This is the intended end state — PayPal is here only until Polar is live.'
          }
          badges={
            paypal
              ? [
                  {
                    label: paypal.environment === 'live' ? 'Live' : 'Sandbox',
                    tone: paypal.environment === 'live' ? 'accent' : 'neutral',
                  },
                ]
              : []
          }
          variables={[
            'PAYPAL_CLIENT_ID',
            'PAYPAL_CLIENT_SECRET',
            'PAYPAL_WEBHOOK_ID',
            'PAYPAL_ENVIRONMENT',
          ]}
          note={
            <>
              <Env>PAYPAL_ENVIRONMENT</Env> accepts <Env>sandbox</Env> or <Env>live</Env> —
              PayPal’s own words, not the <Env>production</Env> the Polar block uses — and
              defaults to sandbox. The build refuses to start if it says <Env>sandbox</Env> on
              a Vercel production deployment, because a sandbox order still captures as
              COMPLETED for the plan price.
              <span className="mt-2 block">
                <strong className="font-semibold">PayPal is not a merchant of record.</strong>{' '}
                While it is taking payments, this business is the seller of record and owes the
                VAT on every EU sale itself — Polar would owe it instead. Nothing in the
                application tracks or reports that liability, so it has to be accounted for
                outside it. Turn PayPal off once Polar is live.
              </span>
              <span className="mt-2 block">
                For the fuller picture — including whether these credentials actually
                authenticate — open <Env>/api/payments/paypal/status?probe=1</Env>, which asks
                PayPal for a token and returns its own error text.
              </span>
            </>
          }
        />

        <ReadinessCard
          title="Checkout"
          state={gateways.length > 0 ? 'ready' : 'missing'}
          summary={
            gateways.length === 0
              ? 'No gateway is configured. Purchase routes answer 503 and the pricing page cannot take money.'
              : gateways.length > 1
                ? `Both gateways are live, so the checkout shows a picker defaulting to ${gateways[0]}.`
                : `One gateway: ${gateways[0]}. The checkout mounts its button directly, with no picker.`
          }
          badges={gateways.map((id) => ({ label: id, tone: 'neutral' as BadgeTone }))}
          note={
            <>
              This is what <Env>availableGateways()</Env> returns, which is the same function
              the checkout page calls — so it is the answer to “what will a customer see”,
              rather than a second opinion about it. Store currency:{' '}
              <span className="font-medium">{publicEnv.storeCurrency}</span>, which both
              gateways charge in.
              <span className="mt-2 block">
                Paddle is never in this list. Its seller account was declined during review and
                it stays only so that sandbox rows from that attempt remain readable in the
                payments console.
              </span>
            </>
          }
        />

        <ReadinessCard
          title="Analytics"
          state={analyticsId ? 'ready' : 'missing'}
          summary={
            analyticsId
              ? 'Google Analytics is enabled; page views and conversion events are sent.'
              : 'No analytics. The site works normally — nothing is measured.'
          }
          variables={['NEXT_PUBLIC_GA_MEASUREMENT_ID']}
          note={
            <>
              Optional. Leave it unset for a deployment that should not phone home, such as a
              preview environment.
            </>
          }
        />

        <ReadinessCard
          title="PDF export"
          state={pdfPinned ? 'ready' : 'partial'}
          summary={
            env.pdf.browserWSEndpoint
              ? 'Rendering through a remote Chromium over CDP.'
              : env.pdf.executablePath
                ? 'Rendering with an explicitly pinned Chromium executable.'
                : 'No browser is pinned. Export falls back to the bundled serverless Chromium, then to a Chromium already installed on the machine; if neither exists, PDF export fails at request time.'
          }
          variables={[
            'PDF_BROWSER_WS_ENDPOINT',
            'PDF_CHROMIUM_EXECUTABLE_PATH',
            'PDF_RENDER_SECRET',
          ]}
          note={
            <>
              {pdfSecretIsDefault ? (
                <span className="font-medium text-warning-700">
                  The print-token secret is the built-in development fallback. Set{' '}
                  <Env>PDF_RENDER_SECRET</Env> to a long random string in production.
                </span>
              ) : (
                <>A print-token secret is set, so internal print URLs are signed.</>
              )}{' '}
              On Vercel and AWS Lambda the bundled <Env>@sparticuz/chromium</Env> is used
              automatically and neither browser variable is needed.
            </>
          }
        />
      </div>

      <Panel
        title="Administrators"
        description="Addresses in ADMIN_EMAILS are granted the admin custom claim the first time they sign in. Granting or revoking access for an existing account is done from the users page — that writes the claim directly."
      >
        {env.adminEmails.length === 0 ? (
          <p className="text-sm text-ink-600">
            <Env>ADMIN_EMAILS</Env> is empty, so no account is bootstrapped as an
            administrator on first sign-in. Existing administrators are unaffected — the
            claim, once set, is what grants access. To create the first one, run{' '}
            <Env>npm run set-admin</Env> from a machine with service-account credentials.
          </p>
        ) : (
          <ul className="flex flex-wrap gap-2">
            {env.adminEmails.map((email) => (
              <li key={email}>
                <span className="rounded-lg border border-ink-200 bg-ink-50 px-2.5 py-1 font-mono text-xs text-ink-800">
                  {email}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <Panel title="Runtime limits" description="Defaults applied to every request.">
        <dl className="grid gap-4 sm:grid-cols-3">
          <div>
            <dt className="text-2xs font-semibold tracking-wide text-ink-500 uppercase">
              Session cookie
            </dt>
            <dd className="mt-1 text-sm text-ink-800">
              {env.sessionCookieDays} day{env.sessionCookieDays === 1 ? '' : 's'}
              <span className="mt-0.5 block text-xs text-ink-500">
                <Env>SESSION_COOKIE_DAYS</Env>
              </span>
            </dd>
          </div>
          <div>
            <dt className="text-2xs font-semibold tracking-wide text-ink-500 uppercase">
              Rate limit
            </dt>
            <dd className="mt-1 text-sm text-ink-800">
              {env.rateLimit.max} requests / {env.rateLimit.windowSeconds}s
              <span className="mt-0.5 block text-xs text-ink-500">
                <Env>RATE_LIMIT_MAX</Env>, <Env>RATE_LIMIT_WINDOW_SECONDS</Env>
              </span>
            </dd>
          </div>
          <div>
            <dt className="text-2xs font-semibold tracking-wide text-ink-500 uppercase">
              Site URL
            </dt>
            <dd className="mt-1 text-sm break-all text-ink-800">
              {publicEnv.siteUrl}
              <span className="mt-0.5 block text-xs text-ink-500">
                <Env>NEXT_PUBLIC_SITE_URL</Env>
              </span>
            </dd>
          </div>
        </dl>
        <p className="mt-4 text-xs leading-relaxed text-ink-500">
          Rate limiting is per server instance and held in memory, so on a horizontally
          scaled deployment the effective limit is this number multiplied by the instance
          count.
        </p>
      </Panel>
    </div>
  );
}

function ReadinessCard({
  title,
  state,
  summary,
  variables = [],
  note,
  badges = [],
}: {
  title: string;
  state: State;
  summary: string;
  /** Optional: a card that reports a derived state has no variable of its own to name. */
  variables?: string[];
  note?: ReactNode;
  badges?: { label: string; tone: BadgeTone }[];
}) {
  return (
    <Card className="p-5">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="text-base font-semibold text-ink-950">{title}</h2>
        <Badge tone={stateTone[state]}>{stateLabel[state]}</Badge>
        {badges.map((badge) => (
          <Badge key={badge.label} tone={badge.tone}>
            {badge.label}
          </Badge>
        ))}
      </div>

      <p className="mt-2 text-sm leading-relaxed text-ink-700">{summary}</p>

      {variables.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {variables.map((variable) => (
            <Env key={variable}>{variable}</Env>
          ))}
        </div>
      ) : null}

      {note ? <p className="mt-3 text-xs leading-relaxed text-ink-500">{note}</p> : null}
    </Card>
  );
}
