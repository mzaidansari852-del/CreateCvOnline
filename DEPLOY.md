# Deploying CreateCVOnline to Vercel

Everything in the repo is deploy-ready. This is the exact sequence, plus the three things
that genuinely bite people on this stack.

Budget about 25 minutes: 5 for the deploy, 20 for Firebase and PayPal.

---

## Before you start

You need:

- a **Vercel** account (Hobby is fine to start — see the PDF warning below),
- a **GitHub/GitLab/Bitbucket** account,
- a **Firebase** project — [README → Firebase setup](README.md#firebase-setup),
- a **PayPal** developer app — [README → PayPal setup](README.md#paypal-setup),
- the **createcvonline.com** domain, if you want it live on the real address.

You can deploy *before* Firebase and PayPal are ready. The site will render completely —
all 133 pages, all 56 template previews — and sign-in will show an honest "not configured"
message rather than breaking. Adding the variables later triggers a redeploy that lights
everything up.

---

## 1. Push to Git

The repo is already initialised with a first commit. Create an **empty** repository on
GitHub (no README, no .gitignore — you have both), then:

```bash
git remote add origin https://github.com/YOUR-USERNAME/createcvonline.git
git branch -M main
git push -u origin main
```

Nothing secret is committed: `.gitignore` excludes `.env.local`, `.env`, `node_modules`,
`.next` and any `*-serviceaccount*.json`.

## 2. Import into Vercel

1. <https://vercel.com/new> → **Import Git Repository** → pick the repo.
2. Vercel detects Next.js. **Leave every build setting alone** — `vercel.json` already
   pins the framework, the build command and the region.
3. **Do not deploy yet.** Expand **Environment Variables** first (step 3), or the first
   build will succeed but the site will boot with no configuration.

## 3. Environment variables

Paste every variable from `.env.example`. Set each for **Production, Preview and
Development** unless noted.

The one that matters most on day one:

```
NEXT_PUBLIC_SITE_URL = https://createcvonline.com
```

Get this wrong and every canonical URL, every sitemap entry, every Open Graph tag and
every PayPal return URL points at the wrong host. If you have not attached the domain
yet, use your `*.vercel.app` URL and change it later — but do change it before you submit
anything to Search Console.

### Pasting `FIREBASE_PRIVATE_KEY`

This is the single most common deploy failure on this stack. In the Vercel UI, paste the
value **exactly as it appears in `.env.example`**: the surrounding double quotes, and the
literal `\n` sequences left as backslash-n, not real newlines.

```
"-----BEGIN PRIVATE KEY-----\nMIIEv...\n-----END PRIVATE KEY-----\n"
```

`lib/env.ts` converts `\n` back into newlines at run time. If Firestore later fails with
`error:1E08010C:DECODER routines::unsupported`, this variable is the cause.

If your host mangles it anyway, use the single-line alternative instead: paste the entire
downloaded service-account JSON into `FIREBASE_SERVICE_ACCOUNT_JSON` and leave the three
discrete variables empty.

### Generate the render secret

```bash
openssl rand -hex 32     # → PDF_RENDER_SECRET
```

## 4. Deploy

Click **Deploy**. First build takes roughly 2–4 minutes: it regenerates the template
registry, compiles, and prerenders 133 pages.

## 5. Attach the domain

**Settings → Domains → Add** `createcvonline.com`. Vercel gives you either an A record or
a set of nameservers — add them at your registrar. DNS usually propagates in minutes;
allow up to 48 hours. Vercel issues the TLS certificate automatically.

Then, in **Firebase Console → Authentication → Settings → Authorized domains**, add both
`createcvonline.com` and your `*.vercel.app` domain. Google sign-in fails silently
without this.

## 6. Post-deploy verification

```bash
npm run seo:check -- --url https://createcvonline.com
```

This crawls every page on the live site and checks titles, descriptions, canonicals,
robots directives, heading structure, structured data and that the private areas actually
redirect. It should report **0 errors**. If canonicals still say `localhost`,
`NEXT_PUBLIC_SITE_URL` is wrong — fix it and redeploy.

Then by hand:

- [ ] Register an account. The verification e-mail arrives.
- [ ] Create a CV, edit it, confirm autosave shows "Saved".
- [ ] **Download a PDF.** See the warning below if this fails.
- [ ] Buy Pro with a PayPal **sandbox** account; confirm `/dashboard/account` shows Pro
      and `/admin/payments` shows the order as completed.
- [ ] `npm run set-admin -- --email you@example.com`, sign out and in, open `/admin`.
- [ ] Open the site on a real phone.

## 7. Search Console

[README → After you deploy: Google Search Console](README.md#after-you-deploy-google-search-console)
— eight steps, including submitting the sitemap and verifying the property.

---

## Three things that will bite you

### 1. PDF export on the Hobby plan

This is the honest one. PDF export launches a headless Chromium
(`@sparticuz/chromium` + `puppeteer-core`) inside a serverless function. That is a heavy
thing to do on a small function:

- the Chromium binary is around 50 MB compressed and needs real memory to run,
- cold starts add several seconds on top of the render,
- Hobby functions get less memory than Pro.

Everything else in the app is light and will run happily on Hobby. **PDF export is the
one route that may OOM or time out there.** You have three options:

| Option | What to do | Cost |
| --- | --- | --- |
| **Upgrade to Pro** | Raise the function memory in **Settings → Functions** | $20/mo |
| **Use a remote browser** | Set `PDF_BROWSER_WS_ENDPOINT` to a Browserless (or similar) websocket URL — `lib/pdf/render.ts` prefers it over the bundled Chromium, no code change | free tier available |
| **Ship without it initially** | Users can still print to PDF from `/print/[id]` in their own browser, which is client-side and costs you nothing | free |

Test it on the deployed site before you assume it works. If it fails, the error the user
sees is a clear "PDF export is not available" message rather than a crash — `lib/pdf/render.ts`
throws `PdfUnavailableError` and the route turns it into a 503.

### 2. Pick the region near your Firestore

`vercel.json` pins functions to `cdg1` (Paris) — a sensible default for Europe and North
Africa. If your Firestore lives in `us-central1`, change it to `iad1`, or every database
read pays an ocean crossing. Firestore's region is fixed at creation and cannot be moved,
so match Vercel to Firestore rather than the other way round.

### 3. Deploy the Firestore rules separately

Vercel deploys the app. It does **not** deploy `firestore.rules`. Run this once from your
machine, and again whenever the rules change:

```bash
npm install -g firebase-tools
firebase login
firebase use --add
npm run firebase:rules
```

Until you do, your database is running on whatever defaults the Firebase console created —
which in production mode denies everything, so the app will appear broken in ways that
look like application bugs.

If the deploy stops with:

```
HTTP Error: 400, this index is not necessary, configure using single field index controls
```

your `firestore.indexes.json` has a composite index carrying only one field. Firestore
builds single-field indexes automatically at `COLLECTION` scope, so the only reason to
declare one is to widen it to `COLLECTION_GROUP` — and that belongs under
`fieldOverrides`, not `indexes`. The shipped file is already correct; `npm test` guards it
(`tests/lib/firestore-indexes.test.ts`), because the CLI validates the file's *shape*
locally and only discovers this at deploy time.

Be aware that a `fieldOverride` **replaces** the automatic configuration for that field
rather than adding to it. That is why each override below re-lists its `COLLECTION`-scoped
entries — drop them and the per-user queries lose their index in production.

---

## Deploying without Git

If you would rather not use a Git repository:

```bash
npm i -g vercel
vercel login
vercel --prod
```

The CLI prompts for the environment variables, or reads them from `.env.local` with
`vercel env pull` / `vercel env add`. You lose automatic deploys on push, which is worth
having — prefer the Git route unless you have a reason not to.

---

## Rolling back

**Deployments → the previous one → Promote to Production.** Instant, and it does not
rebuild. Note that a rollback does not revert Firestore data or security rules.
