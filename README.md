# CreateCVOnline

**Create your professional CV online.** A production-oriented CV and résumé builder SaaS:
56 genuinely different templates, a real-time editor, server-enforced plan limits,
hosted checkout and true-to-preview PDF export.

Built with Next.js 16 (App Router), TypeScript in strict mode, Tailwind CSS v4, Firebase
and Polar.

```bash
cp .env.example .env.local     # then fill in the values — see "Configuration" below
npm install
npm run dev                    # http://localhost:3000
```

The app boots without any credentials. Pages render, all 56 templates preview, and every
feature that needs Firebase or a payment gateway shows an explicit "not configured" state
naming the variables to set — rather than a stack trace.

---

## Contents

1. [What is in the box](#what-is-in-the-box)
2. [Architecture](#architecture)
3. [Configuration](#configuration)
4. [Firebase setup](#firebase-setup)
5. [Payments](#payments)
6. [PDF export](#pdf-export)
7. [Adding a template](#adding-a-template)
8. [Adding a blog article](#adding-a-blog-article)
9. [SEO](#seo)
10. [Security](#security)
11. [Testing](#testing)
12. [Deployment](#deployment)
13. [Project structure](#project-structure)
14. [Scripts](#scripts)
15. [Known limitations](#known-limitations)

---

## What is in the box

| Area | Detail |
| --- | --- |
| **Templates** | 56 templates across Modern, Corporate, Creative, Technology, Classic and ATS. Different layouts, not recoloured clones. Auto-registered from the filesystem. |
| **Editor** | Split-pane desktop workspace, three-tab mobile workspace, live page preview with real page-break guides, autosave, undo/redo, drag-and-drop section reordering, template switching that preserves every byte of content. |
| **PDF** | Server-side headless Chromium. Rendered from the same React tree as the preview, so the export matches the screen. Handles 1, 2 and 3+ page documents. |
| **Auth** | Firebase Authentication — email/password and Google — exchanged for an httpOnly session cookie. Verification, password reset, protected routes. |
| **Payments** | Two gateways behind one interface: **Polar** (merchant of record, card only, the intended long-term choice) and **PayPal** (interim, while Polar's account is not live). Hosted checkout by redirect either way, server-side verification of what was actually charged, signed webhooks, idempotent fulfilment, refund revocation. |
| **Plans** | Free / Pro / Lifetime. Every limit enforced on the server before the mutation runs, never by hiding a button. |
| **Dashboard** | CV CRUD, duplication, renaming, sharing, downloads, quota meters, completeness scoring. |
| **Admin** | Users, entitlements, payments, template usage, blog inventory, configuration readiness. Authorised by Firebase custom claims. |
| **Public site** | Homepage, 56 template pages, 6 category pages, 13 high-intent SEO landing pages, 10 profession guides, 5 worked CV examples, 10 full-length articles, pricing, features, about, contact, FAQ, four legal pages — 118 indexable URLs. |
| **SEO** | Dynamic metadata, canonicals, Open Graph, Twitter cards, generated OG images, JSON-LD (Organization, WebSite, SoftwareApplication, Breadcrumb, FAQPage, Article, ItemList, HowTo), sitemap, robots. |
| **Tests** | 1802 tests across 42 files, plus an `seo:check` crawler: the template contract across all 56 designs, entitlements, payment verification, the security headers, render tokens, the real PDF pipeline, and content/SEO integrity. |

---

## Architecture

### The one idea worth knowing

Every template consumes the **same normalised `CVData`**. Templates own the *page* —
columns, header design, section chrome, typography. Shared renderers in
`components/cv/parts.tsx` own the *content* of a section. That split is why:

- switching template is a non-event (only `customization.templateId` changes),
- adding a new CV field means editing one schema and one renderer, not 56 templates,
- the PDF is byte-identical in layout to the preview.

### Data flow

```
Browser ──(Firebase SDK sign-in)──▶ ID token
        ──(POST /api/auth/session)─▶ Admin SDK verifies ─▶ httpOnly session cookie
        ──(fetch /api/cvs/…)───────▶ authedRoute: rate limit → verify cookie
                                      → load profile → check entitlement → Firestore
```

Server components read Firestore directly through `lib/db/*`. Client components never
touch Firestore; they call the REST API, which is the only place quotas are enforced.

### Deliberate choices

- **PDF via `setContent`, not a URL.** The renderer builds a self-contained HTML string
  and hands it to Chromium. No auth round-trip, no "can the server reach itself" problem
  on serverless, no stale cache. Possible only because templates use inline styles plus
  four class names, so the whole stylesheet a CV needs is ~40 lines.
- **Registry generated from the filesystem.** `npm run generate:templates` scans
  `components/cv/templates/` and writes `lib/cv/templates.generated.ts`. It runs
  automatically on `prebuild`. A template that forgets to export `meta` fails the build.
- **Lazy env access.** Secrets are read through `serverEnv()` at call time, so
  `next build` succeeds on a machine with no credentials while a request that genuinely
  needs one fails with a message naming the variable.
- **Fonts via `<link>`, not `next/font`.** Users pick from fifteen families and the PDF
  renderer must request any of them at run time; self-hosting all fifteen would add
  megabytes for no gain. `preconnect` + `display=swap` keeps the cost low.

---

## Configuration

Copy `.env.example` to `.env.local` and fill it in. Every variable is documented there.
The essentials:

| Variable | Required for | Notes |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Everything SEO | Absolute, no trailing slash. `https://createcvonline.com` in production. |
| `NEXT_PUBLIC_FIREBASE_*` | Sign-in | Public by design; access is controlled by Security Rules. |
| `FIREBASE_PROJECT_ID` / `FIREBASE_CLIENT_EMAIL` / `FIREBASE_PRIVATE_KEY` | All server data | Service-account key. **Never** prefix with `NEXT_PUBLIC_`. |
| `POLAR_ACCESS_TOKEN` / `POLAR_PRODUCT_PRO` / `POLAR_PRODUCT_LIFETIME` | Payments | All three or the gateway stays off, and no checkout is offered at all. Secret token, `polar_oat_…`; the products are UUIDs. |
| `POLAR_WEBHOOK_SECRET` / `POLAR_ENVIRONMENT` | Polar webhooks | `whsec_…`, and `sandbox` or **`production`**. No public counterpart — the checkout is hosted, so the browser needs nothing. |
| `PAYPAL_CLIENT_ID` / `PAYPAL_CLIENT_SECRET` | Payments (interim) | Either gateway is enough to sell. Both values are needed or PayPal stays off. |
| `PAYPAL_WEBHOOK_ID` / `PAYPAL_ENVIRONMENT` | PayPal webhooks | `sandbox` or **`live`** — PayPal's word, not `production`. Without the webhook id that route acts on nothing. |
| `NEXT_PUBLIC_STORE_CURRENCY` | Pricing | Currency `lib/plans.ts` is priced in. Falls back to the retired `NEXT_PUBLIC_PAYPAL_CURRENCY`, so a deployment that predates the rename needs no new entry. |
| `PDF_RENDER_SECRET` | PDF/print | `openssl rand -hex 32`. |
| `ADMIN_EMAILS` | Admin bootstrap | Comma-separated. |

Nothing is hardcoded: the production domain, brand name and currency all come from the
environment.

---

## Firebase setup

### 1. Create the project

1. Go to <https://console.firebase.google.com> and **Add project**.
2. Google Analytics is optional — enable it if you want `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID`.

### 2. Enable Authentication

1. **Build → Authentication → Get started**.
2. Enable **Email/Password**.
3. Enable **Google** (set a support e-mail).
4. **Settings → Authorized domains** — add `localhost` and your production domain.

### 3. Create Firestore

1. **Build → Firestore Database → Create database**.
2. Start in **production mode** (the rules in this repo replace the defaults).
3. Pick the region closest to your users. It cannot be changed later.

### 4. Configure Storage (only if you want photo uploads)

1. **Build → Storage → Get started**.
2. Note the bucket name for `FIREBASE_STORAGE_BUCKET`.

### 5. Get the web config

**Project settings → General → Your apps → Web app** (`</>`). Copy each value into the
`NEXT_PUBLIC_FIREBASE_*` variables.

### 6. Get the service-account key

**Project settings → Service accounts → Generate new private key**. From the downloaded
JSON:

```env
FIREBASE_PROJECT_ID=your-project
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEv...\n-----END PRIVATE KEY-----\n"
```

Keep the literal `\n` sequences and the surrounding double quotes. On hosts that dislike
multiline secrets, paste the whole file into `FIREBASE_SERVICE_ACCOUNT_JSON` instead.

### 7. Deploy the rules and indexes

```bash
npm install -g firebase-tools
firebase login
firebase use --add                 # select your project
npm run firebase:rules             # deploys firestore.rules, indexes and storage.rules
```

The composite indexes in `firestore.indexes.json` are **required** — the share-link
lookup and the admin console query across collection groups and will fail without them.

### 8. Grant yourself admin

**From the hosting dashboard, no terminal needed.** Set `ADMIN_EMAILS` to your address,
redeploy, then **sign out and sign back in**:

```
ADMIN_EMAILS=you@example.com,someone-else@example.com
```

The address is honoured on the very next request, and the `admin` custom claim is granted
in the background so the role survives outside this app — in Firestore rules, for
instance. It works on an account that already exists, so you do not have to have planned
ahead.

Signing out and back in is belt-and-braces rather than required: `ADMIN_EMAILS` is read
per request, so the console opens as soon as the deployment carrying the variable is
live.

**From your machine**, if you prefer, or to *revoke*:

```bash
npm run set-admin -- --all-from-env        # uses ADMIN_EMAILS
npm run set-admin -- --email you@example.com
npm run set-admin -- --email them@example.com --revoke
```

Removing an address from `ADMIN_EMAILS` does **not** demote anyone — the claim persists
until revoked. Use `--revoke`, or the role control on `/admin/users/[uid]`.

Optional seed data:

```bash
npm run seed
```

Optional demo data:

```bash
npm run seed -- --demo-user demo@example.com --demo-password 'choose-something-strong'
```

---

## Payments

Two gateways can be live at once, behind one interface. Configure either and the site can
sell; configure both and the checkout shows a picker.

| | Polar | PayPal |
| --- | --- | --- |
| Role | The intended long-term gateway | Interim, until Polar is live |
| Merchant of record | **Yes** — Polar owes the VAT | **No** — *we* owe the VAT |
| Methods | Card only | PayPal balance, bank, card |
| Checkout | Redirect to `polar.sh` | Redirect to `paypal.com` |
| Grant path | Signed webhook is authoritative; the browser's verify is the shortcut | Browser capture is the main path; the webhook is the backstop |
| Setup | [`docs/POLAR_SETUP.md`](docs/POLAR_SETUP.md) | [`docs/PAYPAL_SETUP.md`](docs/PAYPAL_SETUP.md) |

### Why a merchant of record, and what PayPal costs

Polar is a merchant of record: **Polar Software, Inc.** is the seller on the customer's
statement, and it collects and remits VAT and sales tax in every country it sells into. That
is the whole reason a merchant of record was chosen — the alternative is a small business
tracking its own registration thresholds across several dozen tax regimes, and this site
sells to Germany, France and the Netherlands. It is also why Stripe direct was rejected:
going direct would mean registering for EU VAT OSS and filing it ourselves.

**PayPal is a plain processor and does not do this.** While PayPal is the gateway, this
business is the seller of record and owes the VAT on every EU sale itself. Nothing in the
codebase computes, collects or reports it — the plan price is charged flat, with no tax
component — so it has to be accounted for outside the application. That is the price of
having a working checkout before Polar's account is approved, and it is why PayPal is
described everywhere here as interim rather than as a second option. Turning it off is
unsetting two variables; see [`docs/PAYPAL_SETUP.md` §8](docs/PAYPAL_SETUP.md#8-turning-it-off).

### Why not Paddle any more

Paddle held this role first and **declined the seller account during review**, which ends
an integration before it takes a single payment. Polar replaced it.

The gateway interface in `lib/payments/index.ts` is what made that a contained change
rather than a rewrite — it has now survived PayPal out, Paddle in, Paddle out, Polar in and
PayPal back, without a route or a component changing to suit any of them.

Two things did change for customers, and neither is cosmetic:

- **The checkout is a redirect, not an overlay.** Paddle rendered a card form inside our own
  pages. Polar hosts its checkout on `polar.sh`, so nothing of the provider's runs here: no
  script, no iframe, no third-party cookie on our domain, and no Content Security Policy
  entry. `next.config.ts` grants no payment origin at all, which is a stronger position than
  the wildcard it used to carry.
- **Card payments only, through Polar.** Paddle's overlay offered PayPal, Apple Pay and
  Google Pay alongside cards. Polar processes through Stripe and its own legal pages describe
  only card processing, so those methods are gone from *its* checkout and the marketing copy
  no longer promises them. Do not put them back without checking Polar's current
  documentation. PayPal being available again is a separate gateway sitting beside Polar, not
  a method inside it — that distinction is what the checkout picker exists to make.

**The full sandbox walkthrough is [`docs/POLAR_SETUP.md`](docs/POLAR_SETUP.md)** — account,
products, every variable, the webhook, going live, and how to confirm a purchase actually
granted a plan. The application copy for Polar's own review is in
[`docs/payments/POLAR_APPLICATION.md`](docs/payments/POLAR_APPLICATION.md).

The short version:

```env
POLAR_ACCESS_TOKEN=polar_oat_…            # secret  — Settings > Developers
POLAR_PRODUCT_PRO=<uuid>                  # not secret, but sandbox ≠ production
POLAR_PRODUCT_LIFETIME=<uuid>
POLAR_WEBHOOK_SECRET=whsec_…              # secret  — Settings > Webhooks
POLAR_ENVIRONMENT=sandbox                 # "production" to go live
NEXT_PUBLIC_STORE_CURRENCY=USD
```

Webhook URL `https://your-domain.com/api/payments/polar/webhook`, subscribed to
`order.paid` and `order.refunded`. Without `POLAR_WEBHOOK_SECRET` that endpoint **rejects
every event with 403**. That is deliberate: the route cannot tell a misconfiguration from a
forgery, and an unverifiable webhook that granted paid access would be the worst bug in the
codebase.

The gateway counts as configured only when the access token *and* both product ids are
present and well-formed. Half a configuration offers no checkout at all — an honest
"payments are not available" message rather than a button that fails on the customer's card.

> **`@polar-sh/sdk` is pinned to `1.0.0-alpha.20` on purpose.** Polar moved webhook signing
> to Standard Webhooks on 8 September 2026, and the old and new schemes derive different
> signing keys from the same `whsec_…` secret. The pinned version derives both and accepts
> either. The `0.49.x` release npm tags `latest` implements only the old scheme, so a secret
> generated after the cutover fails every signature check — checkout keeps working while
> fulfilment silently stops. Do not "upgrade" it.

### Taking a test payment

1. `npm run dev`, sign in, go to `/pricing`, choose Pro.
2. You land on `/payment/checkout?plan=pro` — the order summary. Signed out, you are sent
   through `/login?next=…` and returned here, which is why `/pricing` can stay static.
3. The checkout button calls `POST /api/payments/polar/create-checkout`. The browser sends
   only `{ planId }`; the product id comes from the environment and the amount from Polar.
4. You are redirected to `polar.sh`. Pay with the Stripe test card `4242 4242 4242 4242`.
5. Polar returns you to `/payment/success?plan=pro&checkout_id=…`, which calls
   `POST /api/payments/polar/verify`.
6. Confirm in `/dashboard/account` that the plan is now Pro, and in `/admin/payments` that
   the payment is `completed`.

`npm run polar:doctor -- https://your-site` checks a deployment from the outside:
configuration, whether the configured products exist, and that an unsigned webhook is
refused.

### How the money is protected

- The browser sends a **plan id**, never a price. The amount comes from Polar's own product.
- The session is created **server-side** against the product configured for that plan, and
  the browser is handed only the URL to go to. It cannot name an amount or a product.
- The plan a webhook grants is derived from the **product id**, not from the `metadata` we
  round-tripped through Polar. If the two disagree, the money is the truth.
- Verification checks the payment was billed against that plan's product, rather than
  comparing amounts. Polar localises prices, so a German customer legitimately pays in EUR
  for a plan listed in USD — matching the product delegates the arithmetic to the party that
  performed it. (The amount is still checked as a second gate in the store currency, where
  it means something.)
- Fulfilment is a Firestore transaction keyed by the Polar checkout id, so a retry, the
  webhook and the success page all converge on one grant.
- `order.refunded` marks the payment refunded **and takes the plan back**, which matters
  most for Lifetime: it has no expiry to lapse at.

See `tests/lib/polar.test.ts`.

### Payments taken through PayPal, before the removal

`types/payment.ts` lists every provider that has ever written a row — `paypal`, `paddle`,
`polar` and `manual` — and that is deliberate rather than an oversight. Drop a value and
each document written under it stops parsing and disappears from `/admin/payments`, which is
the one place support looks when a customer asks about a charge from last year.

`gatewayFor()` is stricter than the schema, and on purpose: it resolves a provider only when
*this deployment* has credentials for it, and throws otherwise. Two cases follow from that.

- **Paddle** is unreachable by design. The seller account was declined, so the only rows that
  exist are sandbox ones from the aborted integration. They display; they cannot be
  re-checked.
- **PayPal** is reachable exactly while it is configured. Turn it off after Polar goes live
  and its historical rows behave like Paddle's — readable in the console, not re-checkable,
  with any refund issued from the PayPal dashboard.

What never happens is a fallback. Asking Polar about a payment PayPal took returns "not
found", which reads as "this customer never paid" — and a confident wrong answer about
somebody's money is worse than a refused one.

`'paddle'` is in the same schema for the same reason. Paddle never took a live payment
here, so in practice the only such rows are sandbox ones, but a schema that can only parse
the happy path is not a schema.

---

## PDF export

Resolution order at run time:

1. `PDF_BROWSER_WS_ENDPOINT` — a remote Chrome (Browserless, a sidecar container).
2. `PDF_CHROMIUM_EXECUTABLE_PATH` — an explicit binary.
3. `@sparticuz/chromium` — used automatically on Vercel and AWS Lambda.
4. A Chromium already installed on the machine.

Local development on macOS or Linux usually needs nothing; if export fails, point
`PDF_CHROMIUM_EXECUTABLE_PATH` at your Chrome. On Vercel the route already declares
`maxDuration = 60`; a three-page CV with webfonts takes roughly two seconds.

Users can also print directly: `/print/[id]` renders the bare document and opens the
browser print dialog once webfonts have loaded.

---

## Adding a template

Full guide: [`docs/TEMPLATE_AUTHORING.md`](docs/TEMPLATE_AUTHORING.md).

1. Create `components/cv/templates/<category>/MyTemplate.tsx`.
2. Export a default component `({ cv, customization }: CVTemplateProps)` and a
   `meta: TemplateMeta`.
3. Run `npm run generate:templates` (or just build).

It is then live everywhere: the gallery, the editor's picker, its own indexable page at
`/templates/<slug>`, the sitemap and PDF export. The test suite will immediately check it
renders against full, sparse and empty CVs, keeps one `<h1>`, honours the accent colour
and declares an ATS score consistent with its layout.

## Adding a blog article

1. Create `content/blog/my-article.ts` exporting a `BlogPost` as the default.
2. Add one import line to `content/blog/index.ts`.

Reading time is computed from the body. The integrity suite checks length, description
size, unique titles and that every `related` slug exists.

---

## SEO

- **Landing pages**: `/cv-builder`, `/cv-maker`, `/create-cv-online`, `/resume-builder`,
  `/resume-maker`, `/cv-templates`, `/resume-templates`, `/professional-cv`, `/ats-cv`,
  `/ats-resume`, `/free-cv-builder`, `/cv-examples`, `/resume-examples` — each with a
  distinct angle, not thirteen versions of one page.
- **Template pages**: one per template, with preview, audience, features, honest ATS
  notes, FAQ, related templates and structured data.
- **Internal linking**: Home → landing page → gallery → template → related → builder, and
  Blog → landing page → template → builder.
- **Sitemap** (`app/sitemap.ts`) is generated from the registry and the content layer, and
  filtered through `isPrivatePath` — the same constant `robots.ts` and `proxy.ts` use, so
  a private route cannot leak in.
- **OG images** are generated on demand at `/api/og` and cached for a year.

### Page inventory

| Family | Count | Route |
| --- | --- | --- |
| High-intent landing pages | 13 | `/cv-builder`, `/ats-cv`, `/free-cv-builder`, … |
| Template pages | 56 | `/templates/[slug]` |
| Template category pages | 6 | `/templates/modern`, `/templates/ats`, … |
| Profession guides | 10 | `/cv-for/[profession]` |
| Worked CV examples | 5 | `/cv-examples/[role]` |
| Blog articles | 10 | `/blog/[slug]` |
| Product, company and legal | 14 | `/pricing`, `/about`, `/privacy`, … |

118 URLs in the sitemap. `/templates/[slug]` serves both categories and templates from one
segment, resolving a category slug first; a test fails the build if the two namespaces
ever collide.

### `npm run seo:check`

An auditor that crawls the **rendered HTML** of every URL in the sitemap — not the source.
Metadata in Next.js is assembled from a layout, a page, a `generateMetadata` and sometimes
a redirect, so the response body is the only place the truth exists.

```bash
npm run verify:seo                              # build, start, audit, stop
npm run seo:check -- --url https://your-site    # audit a deployment
npm run seo:check -- --json report.json         # machine-readable output
```

It exits non-zero on any error, so it can gate a deploy. What it checks, per page:

- title present, unique, sane length, brand not repeated
- description present, unique, 70–200 characters
- canonical present, absolute, self-referencing by path, not duplicated
- `robots` matches the page's intent — and that private pages are *actually* noindex
- exactly one `<h1>`, and at least one `<h2>`
- all five Open Graph properties and a Twitter card
- every JSON-LD block parses and every node has an `@type`
- every `<img>` has an `alt`
- `<html lang>` and a viewport meta
- enough internal links that the page is not orphaned

And site-wide: `robots.txt` disallows the private areas without blocking CSS or JS, the
sitemap's origin is consistent and HTTPS, no private path is listed in it, and
`/dashboard` and `/admin` redirect an anonymous visitor to `/login`.

Four defects it caught on its first run, all now fixed: every page carried the brand
twice in its title, the auth pages declared the *homepage* as their canonical, the
template titles ran to 82 characters, and `/resume-templates` was 308-ing to `/templates`
instead of ranking as its own landing page.

### After you deploy: Google Search Console

1. **Add the property.** <https://search.google.com/search-console> → *Add property* →
   **Domain** (covers every subdomain and both protocols) if you can edit DNS, otherwise
   **URL prefix** with `https://createcvonline.com`.
2. **Verify ownership.** For a domain property, add the TXT record Google gives you at
   your registrar. For a URL-prefix property, the simplest route here is the HTML tag:
   put the `content` value into `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` and redeploy —
   `rootMetadata()` emits the tag automatically.
3. **Submit the sitemap.** *Sitemaps* → enter `sitemap.xml` → Submit. Confirm it reports
   118 discovered URLs and check the origin is your production domain, not localhost.
4. **Inspect the important URLs.** Use *URL Inspection* on `/`, `/cv-builder`,
   `/templates`, one template page, one profession page and one article. Check the
   rendered HTML, the canonical Google chose, and request indexing for each.
5. **Watch indexing for two weeks.** *Pages* shows what is indexed and why anything is
   excluded. "Discovered – currently not indexed" on a new site is normal and resolves
   with time and links; "Duplicate, Google chose a different canonical" is a real problem
   worth investigating.
6. **Watch Core Web Vitals.** *Core Web Vitals* needs about 28 days of field data before
   it reports. Until then use PageSpeed Insights for lab numbers.
7. **Read the queries.** *Performance* shows what people actually searched before they
   saw you. Pages that rank on page two with a poor CTR are the cheapest wins available —
   usually a better title, not more content.
8. **Fix canonical and coverage issues as they appear** rather than in a batch. Also add
   the property to Bing Webmaster Tools, which can import directly from Search Console.

Search Console data only exists for a live, verified domain — none of it can be generated
locally, and no tool can produce it before the site is deployed.

### What this project deliberately does not do

- **No cover-letter pages.** There is no cover-letter feature, and a landing page for a
  product that does not exist is a doorway page.
- **No `hreflang`.** Only English ships. Declaring alternates for languages that do not
  exist is worse than declaring nothing.
- **No `/resume-for/[profession]`.** It would target the same intent as `/cv-for/` with
  the same advice — duplicate content wearing a different URL. Each profession guide
  instead carries a US résumé section and links to `/resume-builder`.
- **No invented statistics, testimonials or awards.** Where an industry norm is
  referenced it is phrased as widely reported, not as a precise figure.
- **No guaranteed-ATS claims.** The score on each template is described, on every page
  that shows it, as our own layout heuristic rather than a certification.

---

## Security

| Control | Where |
| --- | --- |
| httpOnly, Secure, SameSite=Lax session cookie | `lib/auth/session.ts` |
| Session revocation checked on every verification | `verifySessionCookie(cookie, true)` |
| Admin via Firebase custom claims, never a document field | `lib/db/users.ts`, `guards.ts` |
| Server-side entitlement enforcement | `lib/entitlements.ts` |
| Zod validation on every API body | `lib/api/handler.ts` |
| Rate limiting per route and per IP | `lib/api/rate-limit.ts` |
| CSP, HSTS, `X-Frame-Options`, `Permissions-Policy` | `next.config.ts` |
| Firestore + Storage rules, deny by default | `firestore.rules`, `storage.rules` |
| Signed, expiring render tokens for `/print` | `lib/pdf/token.ts` |
| Polar payment verification, plan derived from the product id, signed webhooks | `lib/payments/polar.ts` |
| PayPal capture verification against the plan price, signed webhooks | `lib/payments/paypal.ts` |
| Honeypot + rate limit on the contact form | `app/api/contact/route.ts` |

Three things worth stating plainly:

**Rate limiting is per instance.** The built-in limiter is in-memory, so on a horizontally
scaled deployment the effective limit is `RATE_LIMIT_MAX × instances`. For a hard global
limit, put Upstash/Redis behind `consume()` in `lib/api/rate-limit.ts` — no call site
changes — or use your platform's edge rate limiting.

**The CSP allows `'unsafe-inline'` for scripts.** Next.js emits inline bootstrap scripts
for statically pre-rendered pages; a nonce-based policy would force every marketing page
into dynamic rendering. To trade that away, set the CSP header from `proxy.ts` with a
per-request nonce instead of in `next.config.ts`.

**The CSP grants no payment origin, and that is now the correct state.** It was not always.
Paddle's overlay was not one script from one host: `cdn.paddle.com` served the script,
`buy.paddle.com` rendered the card form in an iframe, `checkout-service.paddle.com` took
the XHR, each with a `sandbox-` twin, and the set differed by payment method — so
`next.config.ts` carried `https://*.paddle.com` across six directives.

Getting that wrong failed silently everywhere you would look. The customer saw "the payment
window could not load", or an empty rectangle where the card form should be, with a Content
Security Policy violation in the console. Meanwhile the status endpoint reported every field
green, the doctor script passed, and the server log was empty — the browser blocked the
script before a line of our code ran, so nothing server-side could observe it.

Redirecting removes the whole class of failure, and both current gateways redirect: Polar
and PayPal each host the checkout on their own site, so no payment origin is loaded, framed
or called from ours and there is nothing to allow. That is why bringing PayPal back needed no
CSP change at all — the browser leaves our page before it talks to PayPal.

`tests/lib/csp.test.ts` asserts the *absence* of any payment origin rather than the presence
of one, on the reasoning that a policy naming a gateway nothing loads is a standing
permission for a third party to run scripts on the checkout. If a future change ever embeds a
checkout in-page instead of redirecting, that test is where the requirement to add its
origins back lives.

`tests/lib/csp.test.ts`
pins them, and also asserts that the removed PayPal integration's origins left the policy
with it, since a CSP naming a gateway nobody uses is a standing permission for a third
party to run scripts on the checkout page.

---

## Testing

```bash
npm test              # 1802 tests across 42 files
npm run typecheck     # next typegen && tsc --noEmit
npm run lint
npm run verify        # all of the above, then a production build
```

What is covered:

- **The template contract** — all 56 templates × full / sparse / empty CVs × four
  customization extremes. Asserts no crash, exactly one `<h1>`, a heading per visible
  section, no `undefined`/`NaN` leakage, accent colour honoured, no viewport units, and
  page-break classes present.
- **Entitlements** — quotas, expiry, downgrade behaviour, customization sanitisation.
- **Payment verification** — underpayment, plan substitution, currency swap, minor-unit
  conversion (including zero-decimal currencies), price-id-to-plan mapping, the
  localised-currency rule, webhook parsing and HMAC signature checks, and — for PayPal,
  where the amount is ours rather than the provider's — underpayment, plan substitution and
  currency substitution against the plan price. Plus gateway selection: which gateways a
  deployment offers, in which order, and that `gatewayFor()` throws for a provider this
  deployment has no credentials for rather than answering the question with a different one
  (`tests/lib/polar.test.ts`, `tests/lib/paypal.test.ts`).
- **The security headers** — that every remaining allowance stays scoped to a named
  domain, and that no payment origin appears in the policy at all, because every gateway
  here redirects rather than embedding (`tests/lib/csp.test.ts`).
- **Render tokens** — tampering, expiry, cross-user forgery.
- **The real PDF pipeline** — one-page, three-page, sidebar-across-pages, US Letter, and
  one template from every category, rendered in an actual Chromium. Skipped
  automatically when no browser is available.
- **Content and SEO integrity** — every nav link resolves, no duplicate meta description,
  no private path in public navigation, no redirect shadowing a page, no stale brand name.

---

## Deployment

### Vercel

1. Push to GitHub and import the repository.
2. Add every variable from `.env.example` under **Settings → Environment Variables**.
   Set `NEXT_PUBLIC_SITE_URL` to your production URL.
3. Deploy. `prebuild` regenerates the template registry automatically.
4. Add your domain, then add it to Firebase **Authorized domains**.
5. Create a live Polar webhook endpoint for the production domain, and switch all five
   `POLAR_*` variables to production together — a new access token, both product ids, the
   webhook secret, and `POLAR_ENVIRONMENT=production`. The build **refuses to start** if
   that last one still says `sandbox` on a Vercel production deployment: Polar's tokens
   carry no environment marker, so it is the only thing standing between a mis-set variable
   and free Pro accounts (see
   [`docs/POLAR_SETUP.md` §8](docs/POLAR_SETUP.md#8-going-live)).
6. If you are launching on PayPal instead, the same rule applies to all four `PAYPAL_*`
   variables — live client id, live secret, a webhook created on the *live* app, and
   `PAYPAL_ENVIRONMENT=live` — and the build refuses to start on a production deployment
   while that last one says `sandbox`, for the same reason
   ([`docs/PAYPAL_SETUP.md` §7](docs/PAYPAL_SETUP.md#7-going-live)). Remember that PayPal
   leaves the EU VAT with you; see [Payments](#payments).

Pasting `FIREBASE_PRIVATE_KEY` into the Vercel UI: keep the literal `\n` sequences and
wrap the whole value in double quotes.

### Anywhere else

Any Node 20+ host works:

```bash
npm ci && npm run build && npm start
```

For Docker, install Chromium in the image and set
`PDF_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium`.

### Post-deployment checklist

- [ ] `/sitemap.xml` and `/robots.txt` return your production domain
- [ ] Sign-up, verification e-mail and sign-in all work
- [ ] A sandbox payment upgrades the account
- [ ] PDF export downloads a real file
- [ ] `/dashboard` and `/admin` redirect when signed out
- [ ] Submit the sitemap in Google Search Console

---

## Project structure

```
app/
  (marketing)/        public site: home, 13 SEO landing pages, templates, blog, legal
  (auth)/             login, register, forgot-password, verify-email
  dashboard/          CV management, account, settings, and the editor
  admin/              users, payments, templates, blog, configuration
  api/                auth, CVs, Polar, OG images, contact, admin
  print/[id]          bare document for browser printing
  cv/[shareId]        public share view (noindex)
  sitemap.ts robots.ts manifest.ts
components/
  cv/                 CVDocument, previews, shared section renderers
  cv/templates/       56 templates in six category folders
  editor/             editor state, forms, preview pane, design panel
  ui/                 design system
  marketing/          page-building blocks
  dashboard/ admin/ auth/ blog/ payments/ seo/ brand/
lib/
  auth/ db/ payments/ pdf/ seo/ cv/ api/ analytics/ utils/
  plans.ts entitlements.ts env.ts site.ts blog.ts
content/blog/         ten articles as typed data
hooks/ types/ tests/ scripts/ docs/
firestore.rules  firestore.indexes.json  storage.rules  firebase.json
```

---

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` | Regenerates the registry, then a production build |
| `npm start` | Serve the production build |
| `npm run typecheck` | `next typegen && tsc --noEmit` |
| `npm run lint` / `lint:fix` | ESLint |
| `npm test` / `test:watch` | Vitest |
| `npm run verify` | typecheck → lint → test → build |
| `npm run seo:check` | Crawl a running site and audit its SEO (see below) |
| `npm run verify:seo` | Build, start, audit, stop — one command |
| `npm run generate:templates` | Rebuild the template registry |
| `npm run seed` | Seed settings, template stubs, optional demo data |
| `npm run set-admin` | Grant or revoke admin |
| `npm run polar:doctor` | Check a deployment's Polar configuration: `-- https://your-site` |
| `npm run firebase:rules` | Deploy rules, indexes and storage rules |

---

## Known limitations

Stated plainly so nothing is a surprise in production:

- **Rate limiting is per instance** (see [Security](#security)).
- **The CSP permits inline scripts** (see [Security](#security)).
- **Internationalisation is architected, not shipped.** Copy is centralised, dates and
  numbers go through `Intl`, and the CV document renders correctly under RTL — but there
  is no locale router or translation catalogue yet. English only in this version.
- **The contact form writes to Firestore rather than sending e-mail**, so the project has
  no SMTP dependency. Forward `contactMessages` with a Firestore trigger if you want mail.
- **Refunds are recorded, not issued.** `/admin/payments` marks an order refunded locally;
  the actual refund is issued in the Polar dashboard. (A refund made *in Polar* does flow
  back automatically: `order.refunded` marks the payment and revokes the plan.)
- **Legal pages are a starting template**, clearly labelled as such on each page. Have a
  qualified lawyer review them before launch.
- **Analytics is opt-in.** With no measurement id configured, the app makes zero
  third-party requests.

---

## Licence

Proprietary. All rights reserved.
