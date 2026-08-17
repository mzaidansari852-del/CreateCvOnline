# CreateCVOnline — full-site test checklist

Grounded in this codebase: 61 templates, 6 categories, 3 languages, PayPal, Firebase. Counts and route names below are read from the source, not guessed — if a number on screen disagrees with a number here, that is the finding.

**154 checks across 17 areas.**

> Generated from `docs/qa/checklist.json`. Edit that file, not this one.

## How to test

- Measure the rendered artefact, not the source. Nearly every real defect in this project was invisible in the code and obvious in the built page: a footer that asked for the wrong locale, a search box advertising terms that returned nothing, a price computed from the wrong count. Open the page, read what it actually says.
- Test the failure paths in all three languages. The half-English error card survived weeks of review because it only appeared when a payment failed — every screenshot of a working checkout looked perfectly translated.
- NEXT_PUBLIC_* is inlined at build time. Changing one in the hosting dashboard does nothing until the next deploy. If you changed one, confirm the deploy happened after you saved it.
- Use a fresh incognito window. A warm session and an existing locale cookie hide most auth, paywall and language bugs.
- Keep the browser console open the whole time. Several bugs here logged loudly and showed nothing on screen.

## Contents

- [Before you start](#prep) — 5
- [Marketing pages — English](#marketing-en) — 18
- [French — /fr](#fr) — 10
- [German — /de](#de) — 8
- [Language switching and the locale cookie](#locale) — 6
- [Authentication](#auth) — 10
- [Dashboard and CV management](#dashboard) — 10
- [The editor](#editor) — 13
- [Templates — 61 of them](#templates) — 6
- [PDF export](#pdf) — 7
- [Sharing and the public CV page](#share) — 6
- [Payment — PayPal](#payment) — 16
- [Admin](#admin) — 9
- [SEO and crawlability](#seo) — 9
- [Security spot checks](#security) — 8
- [Mobile and performance](#mobile) — 6
- [Five-minute smoke test](#smoke) — 7

<a id="prep"></a>

## Before you start

_Five minutes here saves an afternoon of testing the wrong build._

- [ ] **The deployed commit is the one you pushed**
      Vercel → Deployments → top entry. Compare the SHA with `git log --oneline -1`. A green deploy of yesterday's commit looks identical to a fresh one.
- [ ] **The build finished without warnings you have not read**
      Open the build log. `next build` reports unused variables, failed prerenders and missing env vars, and nobody reads it until something breaks.
- [ ] **Two accounts ready: one free, one paid**
      Most quota and paywall bugs only appear on the free account. Grant the paid one through /admin so you are not spending sandbox money on every pass.
- [ ] **Fresh incognito window, console open, network tab open**
      Console for the errors, network for the request bodies — you will need both in the payment section.
- [ ] **A phone on the same page as the desktop**
      Not DevTools' device mode. Real touch targets, real font rendering, real keyboard.

<a id="marketing-en"></a>

## Marketing pages — English

_28 public routes. For each: it renders, exactly one <h1>, no `undefined` or `NaN` anywhere on the page, header and footer present, no console errors._

- [ ] **/**
      Home. Hero, template preview strip, CTAs all resolve.
- [ ] **/pricing**
      Free / Pro $9 per month / Lifetime $69. Check the FREE plan claims **20 templates, 18 of them rated 5/5 for ATS** — those two numbers are computed from the registry. If they read 16 and 5, the computation broke.
- [ ] **/templates — the gallery**
      **61** templates, **6** categories (modern, corporate, creative, technology, classic, ats). Count them.
- [ ] **Category filter on /templates**
      Each of the 6 filters narrows the grid and the count matches. Clearing returns to 61.
- [ ] **Search on /templates**
      Search the exact terms the placeholder advertises. Every suggested term must return results — a placeholder promising a word that returns zero is worse than an empty box.
- [ ] **Phrase search returns the phrase, not the words**
      Search `two column`. It must return the templates that are two-column (17), not every template matching `two` OR `column` (20). This exact off-by-three is how the bug was found.
- [ ] **/templates/[slug] — spot-check 6, one per category**
      Preview image loads, description present, CTA works, related templates resolve.
- [ ] **/cv-templates and /resume-templates**
      Both landing variants.
- [ ] **/cv-builder, /resume-builder, /cv-maker, /resume-maker**
      Four keyword landing pages.
- [ ] **/free-cv-builder, /professional-cv, /create-cv-online**
      Three more.
- [ ] **/ats-cv and /ats-resume**
      ATS landing pages. Any template count quoted here must match the 18 figure.
- [ ] **/cv-examples and /cv-examples/[role]**
      Index plus at least three roles.
- [ ] **/cv-for/[profession]**
      At least three professions.
- [ ] **/features, /about, /faq**
      Static content pages.
- [ ] **/contact — and actually submit it**
      The form posts to /api/contact. Submit it and confirm the message arrives; a contact form that silently fails is the most expensive kind of broken.
- [ ] **/blog and /blog/[slug]**
      Index paginates, at least three articles render, no broken images.
- [ ] **/terms, /privacy, /cookies, /refund-policy**
      Legal pages. Every footer link resolves — these are the links nobody clicks until a customer does.
- [ ] **Every footer and nav link, clicked**
      Tedious, and it is where dead links live.

<a id="fr"></a>

## French — /fr

_Translation bugs hide in the parts nobody screenshots: filter bars, search terms, footers, error states._

- [ ] **/fr — home**
      Fully French. No English strings.
- [ ] **/fr/tarifs**
      Pricing. Plan names, taglines, all 15 highlights, the billing cadence, and the currency.
- [ ] **/fr/modeles-de-cv**
      Gallery. All 61 templates with French taglines.
- [ ] **The filter bar is in French**
      The category filter component was absent from the French gallery entirely until a widened test caught it. Check the labels, not just that the buttons exist.
- [ ] **Search works in French**
      Try « banque », « étudiant », « minimaliste ». All three were advertised in the placeholder and all three returned zero results, because the query was never translated before matching.
- [ ] **/fr/modeles-de-cv/[slug] — spot-check 3**
      French description, and the URLs in the page point at /fr/ paths.
- [ ] **The footer is French**
      German shipped correct copy that never rendered for weeks because the footer asked `locale === 'fr'`. Read the footer in every language.
- [ ] **`<html lang="fr">`**
      View source. Screen readers and Google both use it.
- [ ] **Canonical and hreflang**
      Canonical points at the /fr URL, not the English one. hreflang lists en, fr, de and x-default, and each points back.
- [ ] **JSON-LD uses French URLs and images**
      The structured data on the French gallery used English URLs and English preview images. View source and read the ld+json block.

<a id="de"></a>

## German — /de

_Same list, different language. Do not assume it follows from French — these two diverged in production._

- [ ] **/de — home**
      Fully German.
- [ ] **/de/preise**
      Pricing, all plan copy and highlights.
- [ ] **/de/lebenslauf-vorlagen**
      Gallery, 61 templates, German taglines.
- [ ] **The filter bar is in German**
      Labels, not just presence.
- [ ] **Search works in German**
      Try „Bank", „Student", „minimalistisch" — and any term the placeholder advertises.
- [ ] **/de/lebenslauf-vorlagen/[slug] — spot-check 3**
      German description, /de/ URLs.
- [ ] **The footer is German**
      This is the one that was silently English.
- [ ] **`<html lang="de">`, canonical, hreflang, JSON-LD**
      Same four checks as French.

<a id="locale"></a>

## Language switching and the locale cookie

_The subtlest bugs in the project live here. All four items below were real._

- [ ] **The switcher changes the language and it sticks**
      EN → FR, then navigate to two more pages. Still French.
- [ ] **A French preference survives a visit to /dashboard**
      Switch to French, then open /dashboard, then go back to the marketing site. If you are in English, the cookie was reset — /dashboard is not in a translated cluster and only paths that are may write the cookie.
- [ ] **Prefetch does not change the language**
      Set French. Scroll a page with many in-viewport links so Next prefetches them. Then navigate. Still French. Prefetches used to rewrite the locale cookie, and curl never reproduced it — this one needs a real browser.
- [ ] **A signed-in profile locale beats the cookie**
      Set the account language to German in /dashboard/settings, then set the cookie to French by visiting /fr. Signed in, you should get German.
- [ ] **The preference survives sign-out and sign-in**
      Set French, sign out, sign in. Still French.
- [ ] **Switching language inside the editor does not lose work**
      Type into a CV, switch language, confirm nothing was dropped and your renamed sections kept their custom names.

<a id="auth"></a>

## Authentication

- [ ] **Register with email and password**
      New address. Account created, verification email arrives.
- [ ] **The unverified state is honest about what is blocked**
      Sign in before verifying. You should be told what to do, not silently limited.
- [ ] **The verification link works, and works only once**
      Click it. Then click it again.
- [ ] **Google sign-in**
      Both a brand-new Google account and one that already has an email/password account with the same address.
- [ ] **Forgot password, end to end**
      Request → email → reset → sign in with the new password → old password rejected.
- [ ] **Wrong password and unknown email give useful, localised errors**
      In all three languages. Auth errors are an error path, which is exactly where English leaks.
- [ ] **The session cookie is httpOnly**
      DevTools → Application → Cookies. If JavaScript can read it, a single XSS becomes account takeover.
- [ ] **Protected routes bounce to /login and come back**
      Open /dashboard/cvs signed out. You should land on /login?next=… and be returned to /dashboard/cvs after signing in.
- [ ] **Sign out really ends the session**
      Sign out, then press Back. No dashboard content, no cached private data. Then reload.
- [ ] **An expired session mid-action is handled**
      Sign in, delete the session cookie in DevTools, then try to save a CV. You should be asked to sign in, not shown a stack trace.

<a id="dashboard"></a>

## Dashboard and CV management

- [ ] **/dashboard loads and the quota meters are right**
      On a free account: 0 of 2 CVs, 0 of 5 downloads.
- [ ] **Create, rename, duplicate, delete a CV**
      All four, and each survives a page reload.
- [ ] **/dashboard/cvs and /dashboard/cvs/[id]**
      List and detail.
- [ ] **The free CV limit is enforced by the SERVER**
      Create 2 CVs on a free account. The button should disappear — then POST to /api/cvs directly from the console and confirm the server also refuses. A limit enforced by hiding a button is not a limit.
- [ ] **The completeness score changes as you fill the CV**
      And is not stuck at a number.
- [ ] **/dashboard/account shows the right plan and expiry**
      Pro should show 31 days from purchase. Lifetime should show no expiry. Free should show no expiry either — not "expired".
- [ ] **Billing history lists real orders**
      And nothing belonging to anyone else.
- [ ] **/dashboard/settings**
      Profile fields save; the language switcher works.
- [ ] **/dashboard/templates**
      Premium templates marked locked on free, unlocked on Pro.
- [ ] **A brand-new account's empty dashboard reads well**
      Empty states are shipped once and reviewed never. Register a fresh account and look at it.

<a id="editor"></a>

## The editor

- [ ] **Split pane on desktop, three tabs on mobile**
      Both layouts, both usable.
- [ ] **Autosave**
      Edit, wait, reload without touching a save button. The change is there.
- [ ] **Undo and redo**
      Several steps deep, including after a template switch.
- [ ] **Drag and drop section reordering**
      With a mouse and with touch.
- [ ] **Add, remove and rename sections**
      Then switch language: a section YOU renamed must keep your name, while untouched ones translate.
- [ ] **Template switching preserves every field**
      Fill a CV completely, switch template three times, and confirm nothing was dropped — including custom sections.
- [ ] **Accent colour, fonts, spacing**
      Each visibly changes the preview and persists.
- [ ] **Paper size A4 and US Letter**
      Both, and the PDF matches the choice.
- [ ] **Photo upload**
      Known dependency: this needs Firebase Storage enabled on the project. If it fails, check that before debugging the code.
- [ ] **Page-break guides match the real PDF**
      Add content until a guide appears, export, and compare. A guide that lies is worse than no guide.
- [ ] **A CV long enough to be 2 pages, and one long enough to be 3+**
      Both in the preview and the PDF.
- [ ] **A completely empty CV does not crash the preview**
      New CV, type nothing, look at the preview.
- [ ] **Hostile content**
      300-character job title, emoji, accented and non-Latin characters, a URL with no spaces. Nothing should overflow the page or break the layout.

<a id="templates"></a>

## Templates — 61 of them

_The automated suite covers all 61 against full, sparse and empty CVs. This is the human pass: does it look like something you would send to an employer._

- [ ] **One template from each of the 6 categories, with a FULL CV**
      modern, corporate, creative, technology, classic, ats.
- [ ] **The same six with a SPARSE CV**
      Name and one job only. Nothing should collapse or leave a huge void.
- [ ] **The same six with an EMPTY CV**
      No crash, no `undefined`, no `NaN`.
- [ ] **Accent colour is honoured in every one you check**
      Some templates ignore it, which reads as the setting being broken.
- [ ] **Premium templates are locked on free and open on Pro**
      And the lock is enforced server-side when rendering the PDF, not just in the picker.
- [ ] **Every preview image in the gallery loads**
      61 cards. A missing preview is a template nobody will choose.

<a id="pdf"></a>

## PDF export

- [ ] **Download from the editor and from the dashboard**
      Both entry points.
- [ ] **The PDF matches the on-screen preview**
      Same fonts, same spacing, same page breaks. Open it in a real PDF reader, not the browser's inline viewer.
- [ ] **1-page, 3-page, sidebar-crossing-pages, and US Letter**
      Four shapes that break differently.
- [ ] **Free plan: branding present. Pro: absent.**
      And confirm the Pro version really has none, on the last page too.
- [ ] **The free download limit is enforced**
      Five downloads in a calendar month, then the sixth is refused — by the server. Call /api/cvs/[id]/pdf directly to be sure.
- [ ] **The filename is something a person would keep**
      Not `download.pdf` or a UUID.
- [ ] **A render token cannot be reused across users**
      Take the PDF request from one account and replay it against another account's CV id. It must be refused.

<a id="share"></a>

## Sharing and the public CV page

_This is the one place private user data is deliberately exposed. Get it wrong and it gets indexed._

- [ ] **Free plan cannot create a share link**
      Hidden in the UI and refused by the API.
- [ ] **Pro can create one, and /cv/[shareId] opens in incognito**
      Signed out, in a different browser.
- [ ] **The share page is noindex**
      View source and check the robots meta. Then check /robots.txt disallows /cv/.
- [ ] **Revoking the link kills it**
      Revoke, then reload the old URL. 404, not a cached copy.
- [ ] **A guessed share id returns nothing**
      Change a character. No data, no error detail that helps a guesser.
- [ ] **The public page shows only the CV**
      No email address, no account details, no dashboard chrome.

<a id="payment"></a>

## Payment — PayPal

_The only path where a bug costs money or a customer. PayPal is the sole gateway; Paddle has been removed._

- [ ] **/pricing → Pro → /payment/checkout?plan=pro**
      The card reads: Pro, $9, every 31 days, cancellable, and YOUR email address.
- [ ] **The same for Lifetime**
      $69, one-time, no renewal.
- [ ] **The checkout card is fully translated — in all three languages**
      Heading, order summary, all six feature bullets, the button, and the small print under it. This is where an English feature list sat under a French heading.
- [ ] **The request body contains a plan id and NO amount**
      Network tab → the POST to /api/payments/paypal/create-order. If a price, amount or currency appears in that body, a customer can name their own price.
- [ ] **Happy path, end to end**
      Continue → PayPal sandbox → approve → return → /payment/success → the plan is active in /dashboard/account.
- [ ] **Cancel at PayPal**
      → /payment/cancel. Nothing charged, no plan granted, and the page says so plainly.
- [ ] **Close the tab immediately after approving**
      The webhook must still grant the plan. Check /dashboard/account a minute later. This is the case a customer will hit on a phone.
- [ ] **Pay twice in a row for Pro**
      The second purchase must not double-charge or corrupt the expiry. Idempotent fulfilment is claimed — verify it.
- [ ] **A Lifetime owner opening /payment/checkout?plan=pro**
      Told there is nothing to buy, with a way back — not shown a pay button.
- [ ] **A Pro owner CAN still upgrade to Lifetime**
      That purchase must remain available.
- [ ] **/payment/checkout?plan=nonsense**
      Refused cleanly.
- [ ] **/payment/success with no ?token=**
      "Missing reference" and a way forward. Not a crash, not a spinner forever.
- [ ] **A forced failure is reported ENTIRELY in the page's language**
      The important one. Break PayPal on a preview deploy (wrong secret), set the site to French, and try to pay. The heading AND the body AND the next step must all be French. The old code rendered our API's English `message` in preference to the translated string sitting beside it — and it only ever showed on failure.
- [ ] **Network failure mid-payment**
      Approve, then kill your connection before the return. The page should tell you the payment may have gone through and not to pay twice.
- [ ] **The admin ledger records the order**
      /admin/payments shows it with the right plan, amount and provider.
- [ ] **No PADDLE_ variables remain in Vercel**
      Nothing reads them now. A live API key sitting in a dashboard that no code uses is a credential nobody is watching.

<a id="admin"></a>

## Admin

- [ ] **A normal account cannot reach /admin**
      Not "the link is hidden" — type the URL. Then call /api/admin/users/[uid] directly and confirm 403.
- [ ] **/admin overview**
      Counts and readiness indicators load.
- [ ] **/admin/users and /admin/users/[uid]**
      Search, pagination, detail.
- [ ] **Granting and revoking a plan by hand**
      Grant Pro to a test account, confirm the account sees it, revoke it, confirm it is gone.
- [ ] **Changing a role**
      Promote a test account to admin and back. Confirm the change takes effect on their next request.
- [ ] **/admin/payments**
      The ledger, and a single order's detail.
- [ ] **/admin/templates**
      Usage figures across 61 templates.
- [ ] **/admin/blog**
      Inventory.
- [ ] **/admin/settings — configuration readiness**
      Should now report PayPal configured, Firebase configured, and no Paddle anywhere.

<a id="seo"></a>

## SEO and crawlability

- [ ] **/robots.txt**
      Correct production host. /api/, /dashboard/, /admin/, /cv/ and /payment/ disallowed.
- [ ] **/sitemap.xml**
      Every public URL in all three languages. No /dashboard, no /admin, no /cv/[shareId], and no `localhost` — that last one has no runtime symptom at all.
- [ ] **Canonicals are absolute and locale-correct**
      Spot-check six pages across all three languages.
- [ ] **hreflang is reciprocal**
      The English page points at fr and de; each of those points back at the other two and at x-default.
- [ ] **OG and Twitter images resolve**
      Paste three URLs into a link-preview debugger and look at the rendered card.
- [ ] **JSON-LD validates**
      Google Rich Results Test on /, /pricing, a template page and a blog post — in each language.
- [ ] **noindex is on exactly the right pages**
      Present on /payment/*, /cv/[shareId], /dashboard/*, /admin/*. ABSENT from every marketing page — a stray noindex on /pricing is silent and expensive.
- [ ] **/manifest.webmanifest and the favicons**
      Install the PWA on a phone and look at the icon.
- [ ] **404 page**
      A real 404 status, in all three languages, with a way back.

<a id="security"></a>

## Security spot checks

- [ ] **No secret is in the client bundle**
      View source on /pricing, then search the /_next/static/*.js chunks for `pdl_`, `sk_`, `-----BEGIN`, your admin email and your PayPal secret. The browser is the only honest place to check this.
- [ ] **Another user's CV is not readable by id**
      GET /api/cvs/[someone-elses-id] while signed in as a different user. 403 or 404 — never their data.
- [ ] **Another user's CV is not editable by id**
      PATCH and DELETE the same id.
- [ ] **A normal user cannot change a plan**
      POST to /api/admin/users/[uid]/plan. 403.
- [ ] **Rate limiting bites**
      Hammer /api/contact and the create-order endpoint. You should get 429 with a Retry-After, and the message should be translated.
- [ ] **Firestore rules deny direct client reads of other users' data**
      Test from the Firebase console rules simulator, not only through the app.
- [ ] **The contact form cannot be used to send mail as someone else**
      Submit with a spoofed from-address and check what actually arrives.
- [ ] **Private CV data is not indexed**
      Search `site:createcvonline.com` for /cv/ and /dashboard URLs. Do this after the site has been live a while, not just today.

<a id="mobile"></a>

## Mobile and performance

- [ ] **375px wide: nav, pricing cards, template grid, checkout**
      Nothing overflows horizontally. No two-finger zoom needed to read a price.
- [ ] **The editor on a real phone**
      Three tabs, keyboard does not cover the field you are typing into, drag-to-reorder works with touch.
- [ ] **Tap targets are big enough**
      Anything you have to aim at on a phone is a bug.
- [ ] **Lighthouse on /, /pricing, /templates**
      Mobile profile. Watch LCP and CLS specifically — the template grid is the likely CLS offender.
- [ ] **The template grid does not shift as images load**
      Reload with a throttled connection and watch.
- [ ] **The site is usable with JavaScript slow, not just absent**
      Throttle to Slow 3G and load /pricing. Anything that renders the wrong branch until hydration will show here — that class of bug put "this link is missing its payment reference" in front of paying customers.

<a id="smoke"></a>

## Five-minute smoke test

_Run this after EVERY deploy. If all seven pass, nothing structural is broken._

- [ ] **/ loads in English, French and German**
      Three URLs, three languages, no console errors.
- [ ] **/pricing shows 20 free templates and 18 ATS-rated**
      The computed numbers are a canary for the whole registry.
- [ ] **/templates shows 61 templates**
      Count the grid or read the heading.
- [ ] **Sign in works**
      One account, one password.
- [ ] **Create a CV, type a name, reload — it persisted**
      Proves auth, Firestore write and autosave in one action.
- [ ] **Download a PDF and open it**
      Proves the render pipeline and the quota check.
- [ ] **/payment/checkout?plan=pro shows the PayPal button and the right price**
      Do not complete it. Just confirm the gateway is offered and says $9.
