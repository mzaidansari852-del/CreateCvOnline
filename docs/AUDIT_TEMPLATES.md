# CV Templates — Design & Search Audit

**Scope:** the 56 CV template designs, and the 62 pages that sell them (`/templates/[slug]` ×56,
`/templates/<category>` ×6).
**Date:** 14 August 2026.
**Method:** every template component read; every prerendered page parsed and shingled;
SERPs and ranking benchmarks researched against current sources.

---

## The short version

The templates are better engineered than they are designed, and the pages that sell them
are better written than they are *findable*.

Three findings dominate everything else:

1. **There is not one indexable image on the site.** Zero `<img>` elements across 121
   prerendered pages. Template previews are live server-rendered DOM inside `role="img"`
   wrappers — elegant, and completely invisible to Google Images. In a niche where
   *Pinterest outranks Resume.io for "modern cv template"*, this forfeits the largest
   channel available to a new site.

2. **Every template page is ~4,650 words, of which ~174 are unique to it.** The same
   fictional CV is rendered eight times per page across all 56 pages. 80% of six-word
   phrases on any template page appear on at least one other. The likely outcome is not a
   penalty but selective indexing: Google keeps 10–20 of the 56 and ignores the tail.

3. **Typography — the one lever that would make 56 templates look like 56 templates — is
   never pulled.** No template selects a font. Switching from Photographer to ATS Resume
   changes rules and boxes but not a single glyph.

Underneath those, a set of correctness bugs that are cheap to fix and currently damaging:
eleven default accent colours print employer names below WCAG AA, four two-column
templates leave an empty coloured column on page 2, and the six category pages have
between zero and three inbound links each.

**On the market:** the head terms are not winnable and should not be targeted. Ahrefs'
344,956-site dataset puts the median DR 0–10 domain at **9 organic clicks a month**. The
realistic openings are non-English CV markets, profession × template long-tail, and image
search.

---

## Part 1 — Design

### 1.1 Distinctiveness: the claim is half true

56 distinct component files, genuinely different header constructions and section chrome.
But they resolve to about **ten structural archetypes**:

| Archetype | Count |
| --- | --- |
| Header band/card over one column | 16 |
| Plain one column, ruled headings | 10 |
| Two column, hairline / no fill | 9 |
| Plain one column, no rules | 5 |
| Centred masthead classic | 5 |
| Two column, filled full-bleed band | 4 |
| Hanging label gutter | 3 |
| Boxed card per section | 2 |
| Parity-dealt two columns | 2 |
| Framed page | 1 |

**Eleven pairs are too close to sell as separate products.** The worst:

| Pair | What separates them |
| --- | --- |
| `modern/ModernElegant` ↔ `classic/ElegantSerif` | Flanking rules vs an underline. Nothing else. |
| `corporate/HumanResourcesCV` ↔ `classic/Government` | `borderRadius: 6` vs `0`. |
| `modern/ModernAts` ↔ `technology/SoftwareEngineer` ↔ `ats/AtsSimple` | Contact position and rule colour. Three products, one design. |
| `classic/SimpleClassic` ↔ `technology/TechMinimal` ↔ `ats/AtsEntryLevel` | A spacing multiplier: 1.0× / 0.85× / 0.75×. |
| `ats/AtsClassic` ↔ `ats/AtsResume` | The file comment admits it: *"Differs in three ways only."* |

Eleven templates carry the catalogue's design credibility: Photographer, Art Director,
Portfolio Style, Editorial, Consultant, Data Scientist, Legal, Academic, Finance, Full
Stack Developer, Modern Minimal.

**Bug:** `creative/GraphicDesigner.tsx:44` declares `columns: 1` and renders two. `columns`
is a live gallery filter, so "One column" returns a two-column poster.

### 1.2 Typography is not exercised at all

`TemplateMeta` has no font field. Every template inherits `--cv-font-body` from user
customisation. `classic/ElegantSerif.tsx:18` markets itself as *"built for a serif body
font — EB Garamond, Lora or Libre Baskerville"* and then cannot request one; the user gets
Inter. Fifteen fonts ship, seven are serifs, one template is designed around them.

Body `line-height` is never set either. So the *texture* of the body copy is identical in
all 56 documents.

The name treatment is generic in the majority: **34 of 56** sit at 1.9–2.35em, **34** at
weight 700, **22** at −0.01em to −0.02em tracking. That is the same masthead on more than
half the catalogue.

Ten centred, heavily letterspaced headings render optically off-centre because the trailing
letter-space is uncompensated — up to ~1.3px of visible asymmetry on a symmetric masthead.
`creative/Photographer.tsx:93` already solves it with `textIndent`; the fix just was not
propagated.

### 1.3 Contrast: eleven defaults fail WCAG AA

`parts.tsx:304` prints every employer name, certification issuer and institution in the
accent colour on white.

| Template | Accent | Ratio |
| --- | --- | --- |
| Graphic Designer | `#f59e0b` | **2.15** |
| Cybersecurity | `#22c55e` | **2.28** |
| Modern Tech | `#0ea5e9` | **2.77** |
| Developer | `#16a34a` | 3.30 |
| DevOps | `#ea580c` | 3.56 |
| Creative Designer | `#ef476f` | 3.62 |
| Content Creator | `#f43f5e` | 3.67 |
| Full Stack Developer | `#0891b2` | 3.68 |
| Creative Professional | `#0d9488` | 3.74 |
| Modern Clean | `#059669` | 3.77 |
| UI/UX Designer | `#6366f1` | 4.47 |

Two related defects:

- **`readableOn()` has a dead band.** `lib/cv/format.ts:496` switches to dark ink above
  luminance 0.45, but white text needs ≤ 0.179 for 4.5:1. Anything in **0.18–0.45 gets
  white text at 2.1–4.5:1**. A user picking a mid-tone teal gets an unreadable masthead.
- **Muted grey is used for body prose.** Eleven templates override `muted` to
  `tint(text, 0.38–0.45)` — as low as **3.60:1** — and `ExperienceBody` renders every job
  description in `muted`. Modern Minimal's whole pitch is "hierarchy carried by space"; it
  achieves that by making the text too light.

Also: on Modern Executive's near-black sidebar the skill bars read **inverted** — the
unfilled track is bright, the filled portion dark. The bars show the wrong quantity, in the
reference implementation for two-column templates.

### 1.4 Print fidelity

Good foundations — no `position: fixed`, no viewport units, `break-inside: avoid` on
blocks, one stylesheet shared by preview, print route and PDF.

Four real risks:

1. **Absolutely positioned rails do not survive a page break.** `parts.tsx:387` (timeline
   variant) and `technology/DevOpsEngineer.tsx:108`. Page 2 gets dots with no line — and in
   DevOps' case loses the template's only structural idea. `ModernClean` documents the
   correct pattern (`border-left` on a flowing wrapper); it was not applied.
2. **Orphaned sidebars.** Four templates paint a full-bleed band that correctly continues to
   page 2 — with no content in it. Nothing repeats identity or a page marker.
3. **Empty aside collapses in 7 of 13 two-column templates.** Turn off skills, languages,
   certifications and interests and `ManagementCV` paints a full-height tinted band
   containing nothing. Five templates guard against this; seven do not. The test suite
   renders an empty CV but only asserts "does not throw".
4. **Rail gradients restart per page** rather than continuing, contradicting
   `AiEngineer.tsx:20`'s own claim.

### 1.5 ATS category

The six `ats/` templates hold up against every real parsing failure mode: single column,
no tables, no images, no meaningful icons, no pills, text skills, standard headings. That
is verified and enforced by tests.

Two honest caveats: they are six variations of one layout differentiated by spacing and
heading colour; and `atsScore: 5` on Modern Clean and IT Professional is generous — the
score is measuring column count more than parseability.

### 1.6 Catalogue gaps

Ranked by commercial impact:

1. **No functional or hybrid CV.** All 56 are chronological. "Functional resume" and
   "skills-based CV" are named formats with their own demand and their own buyer.
2. **No cover letter.** Resume.io, Zety and Novoresume all sell matched pairs. Major upsell
   path, entirely absent.
3. **No Europass.** The data model is already 90% there — `languageLevelSchema` is literally
   CEFR. Cheap to build, high intent, and this product is clearly EU-facing.
4. **No saturated sidebar.** Nothing produces the single most-purchased look in the
   category (Zety's Cascade): a full-height coloured sidebar with white text.
5. **No infographic beyond bars**, no monospace/terminal, no dark page, no US Federal
   format, no German Lebenslauf conventions, no competency matrix.
6. **Creative has almost no ATS-safe option** — eight of ten score 2–3. A designer applying
   through Greenhouse has to leave the category.

---

## Part 2 — Search

### 2.1 Zero indexable images — the largest single finding

```
$ grep -c '<img' .next/server/app/**/*.html   →  0
```

`components/cv/CVThumbnail.tsx:22` renders the CV with `renderToStaticMarkup` and injects
it via `dangerouslySetInnerHTML`, wrapped in `role="img"`. That is one source of truth for
preview and PDF with no image pipeline — good engineering. It is also **no image resource,
no URL, no alt text, nothing crawlable**.

Why it matters here specifically: Pinterest holds the **top two slots for "modern cv
template"**. Behance, Figma, Freepik and Dribbble appear across "creative cv template" and
"minimalist cv template". Design-adjective template queries are image-discovery queries,
and a page with no image cannot enter that surface at all.

Knock-on: nothing to attach as `Product.image` or `ImageObject`; `max-image-preview: large`
is set correctly with no image to apply it to.

### 2.2 og:image is generated, then blocked

`app/api/og/route.tsx` builds a 1200×630 card per page. `app/robots.ts:19` derives its
disallow list from `PRIVATE_PATH_PREFIXES`, which contains `/api`. Result:
**120 of 121 pages point `og:image` at a robots-disallowed path.**

Separately, the card is a fixed navy gradient with text — every one of the 56 share cards
looks identical. For a product whose value proposition is visual, the share card should be
a render of the actual template.

### 2.3 Content: 174 unique words in 4,650

Measured across the build:

| Measure | Value |
| --- | --- |
| Words in `<main>` per template page | ~4,650 |
| — identical sample-CV text | **3,361 (72%)** |
| — editorial prose | 1,286 |
| Words unique to that one page | **~174 (3.7%)** |
| 6-grams appearing on all 56 pages | 16.1% |
| 6-grams appearing on ≥2 pages | **80.2%** |
| Pairs with >60% prose overlap | 10 |

**The sample CV is the bulk of it.** `[slug]/page.tsx:193` calls `createSampleCV()` with no
arguments — the same "Amina El Fassi, Senior Product Designer" on all 56 pages, rendered
**eight times per page** (two preview sizes plus six related-template thumbnails). All of it
is real crawlable DOM.

**The generated prose collides too.** `template-copy.ts` is a sentence matrix keyed on
category × columns × photo × ATS band. 33 axis signatures cover 56 templates, so **40 pairs
share a signature** and render on average 5.3 of 13 sentence slots identically. Some pools
hold only four options.

The 138 hand-written words per template are genuinely good — only 2 of 399 bullets are
reused. The problem is quantity relative to the scaffolding around them.

**Likely outcome:** not a penalty. Selective indexing — Google keeps 10–20 of the 56 and
marks the rest "Crawled – currently not indexed". Highest risk: the same-axis clusters
(5 ATS, 4 classic, 4 creative, 4 technology).

### 2.4 Titles, descriptions, cannibalisation

- **46 of 56 titles exceed 60 characters.** `template-copy.ts:861` sets
  `TITLE_BUDGET = 68`; the doc comment directly above it states the target is *"the roughly
  60-character window a search result actually displays"*. The constant contradicts its own
  documented intent, and the qualifier — the differentiating part — is what gets truncated.
- **The qualifiers carry no demand.** 17 distinct qualifiers across 56 titles, dominated by
  `Free ATS-Friendly` (10) and `Pro One-Column` (8). Nobody searches "pro one-column".
- **Descriptions lead with design copy, not search copy.** *"A hairline gallery frame around
  a centred, letterspaced document."* No template name, no query match, no benefit. Two
  closers cover 36 of 56.
- **`/templates/<category>` competes with `/templates?category=<x>`.** `app/sitemap.ts:76`
  argues correctly that the static path is the canonical one — and then
  `[slug]/page.tsx:459` links every template page to the query view. The facets receive
  **11 internal links each**; the real category pages receive **zero from outside their own
  cluster**.
- **57 keyword strings are claimed by more than one page.** The sharpest: `/templates/ats-cv`
  (template) vs `/ats-cv` (guide) — near-identical URLs, overlapping keywords, and the
  guide gets 88 internal links to the template's handful.

The 13 landing pages are otherwise well differentiated. The cannibalisation is concentrated
inside `/templates`.

### 2.5 Internal linking

- The six category pages receive **0–3 inbound links each**; `/templates/creative` has
  **zero**. They link only to one another. Nothing in the header, footer, gallery, homepage
  or 56 template pages reaches them.
- **15 of 56 templates receive no sibling link at all.** `relatedTemplates()` takes the
  first N in registry order within a category, so later-listed templates are never reached.
- The homepage links to **10 of 56**. The other 46 depend on `/templates` being crawled —
  and `/templates` is **not statically rendered** (it awaits `searchParams`), so it is
  SSR'd on every request, rendering 56 live CV components each time. That is the single
  point of failure for 82% of the money pages.

### 2.6 Other material issues

| Issue | Detail |
| --- | --- |
| **Canonicals** | The local build emitted `http://localhost:3000` on 112 pages because `NEXT_PUBLIC_SITE_URL` was unset. **Verify production immediately** — `view-source` on a live template page and check `<link rel="canonical">`. There is no build-time guard against shipping this. |
| **Googlebot exempted** | `app/robots.ts:22` writes a `*` group with `Disallow: /templates?*q=` and an explicit `Googlebot`/`Bingbot` group **without** it. Most-specific-group-wins means the two crawlers that matter get unbounded search URLs. |
| **Page weight** | 647KB per template page; 371KB (57%) is the RSC flight payload — a second serialisation of the same tree, including all eight CV previews, on a page with no client interactivity. 38.3MB across the 56. |
| **Invalid HTML** | 32 template components render their own `<main>`, so pages carry up to **9 `<main>` landmarks**. Breaks main-content extraction and is an accessibility defect. |
| **Sitemap** | `lastModified` is `new Date()` for every static route — every URL claims to change on every deploy. Google learns to ignore the signal. |
| **Structured data** | `CreativeWork` has no `image`. No `Product`/`Offer` despite 40 premium and 16 free. No `ItemList` on detail pages. No `WebPage` node tying the graph together. `FAQPage` earns nothing since Google's 2023 change. |

---

## Part 3 — What the market actually looks like

### 3.1 The head terms are not winnable

"professional cv template" is 100% commercial galleries — and **four of the six are the same
company**. BOLD owns MyPerfectResume, Zety, LiveCareer and ResumeNow (plus Monster,
FlexJobs, CareerBuilder). That SERP is roughly three competitors wearing six hats.

"cv template" and "ats resume template" are the softest — `.edu` pages, Overleaf and even
Gumroad listings rank — but still contain Canva (794M visits/month), Microsoft, Adobe.

Ages: LiveCareer 2005, resume.io 2013, Zety 2014. resume.io has 500+ profession guides and
25,000 daily signups; Zety has 1,400+ career guides.

### 3.2 The benchmark nobody wants to hear

Ahrefs, 344,956 sites, anonymised Search Console data (July 2026):

| Domain Rating | Median monthly organic clicks |
| --- | --- |
| **0–10** | **9** |
| 10–20 | 60 |
| 20–30 | 133 |
| 30–40 | 308 |

And: **1.74% of newly published pages reach the top 10 within a year.** The average #1
ranking page is five years old.

Realistic projection for createcvonline.com, assuming good execution and some passive link
acquisition:

| | Organic clicks/month |
| --- | --- |
| Month 3 (Nov 2026) | 0–50 |
| Month 6 (Feb 2027) | 50–400 |
| Month 12 (Aug 2027) | 300–1,500 |

With genuinely zero links, the honest number stays near the DR 0–10 median.

### 3.3 But the site profile is favourable

Zyppy's re-analysis of 400+ sites through the December 2025 core update found five traits
separating winners from losers:

| Trait | Winners | Losers |
| --- | --- | --- |
| Offers own product/service | 70% | 34% |
| Lets the user complete the task on-page | 83% | 50% |
| Owns hard-to-replicate proprietary assets | **92%** | 57% |
| High branded search relative to traffic | 32% | 16% |
| Narrow topical focus | correlated | — |

All five → 69.7% win rate. Zero → 13.5%. **CreateCVOnline has four of the five** — real
product, task completed on-page, 56 original templates, tight focus. Only brand demand is
missing.

Notably, the study found first-hand experience, personal perspectives and UGC **not**
correlated with winning — a direct argument against pouring effort into author bios and
anecdotal blog content for this page type.

Amsive's read on the March 2026 core update: *"the top of the winner list is almost entirely
'the company that owns the thing'; the top of the loser list is almost entirely 'the
platform people use to talk about the thing.'"* Applied here: **the 56 templates are the
strongest asset; the 10 blog articles and 10 profession guides are the weakest.**

### 3.4 Where the openings actually are

**Strong — majors effectively absent:**

- **French.** "modèle de CV gratuit" returns cvcrea.fr, aidecv.fr, modeles-de-cv.com,
  cvexemple.com, cv-boost.app. Zero Canva, zero Zety, zero Resume.io. Competitors your size.
- **German.** "lebenslauf template" returns simplegermany.com, liveingermany.de,
  coolfreecv.com, expatrio.com. Same picture.
- **Academic CV** — fragmented across GitHub repos and university PDFs; no gallery site owns
  it. Partial fit, since that audience prefers LaTeX.

**Moderate:** profession × country ("cv template for teachers uk"), Europass, age-specific
("cv template for 16 year old uk"). Page 2–3 in 6–12 months is realistic.

**Avoid:** "cv template for nurses uk" and similar are completely closed. And critically —
**the six design-adjective category pages target the most thoroughly pre-covered ground on
the map.** Every major player has a dedicated modern/minimalist/creative/professional
subcategory page. Those six pages are the least likely of the ~100 to ever rank.

**One competitive note:** cvtemplatemaster and freesumes put **"no signup"** in their title
tags. CreateCVOnline requires registration to download. On free-intent queries you compete
against sites marketing the absence of your gate.

### 3.5 A launch-velocity risk worth taking seriously

A documented first-party case (seeindie.com): domain launched June 2026, 284 pages published
mid-to-late July, 100 within three days. Impressions fell **176.8/day → 44.8/day (−75%)**,
average position 12.5 → 27.6, and only 158 of 284 pages were indexed at ten weeks.

~118 pages shipped simultaneously on a zero-authority domain is the same shape. This may be
crawl-budget redistribution rather than a quality signal, but it argues for **fixing and
consolidating what exists before publishing more**.

---

## Part 4 — Phases

Ordered by impact per unit of work. Phases 0–2 are the ones that matter.

### Phase 0 — Stop the active damage · half a day

Everything here is currently costing you something and is a one-to-ten-line change.

| # | Task | Files | Status |
| --- | --- | --- | --- |
| 0.1 | **Verify `NEXT_PUBLIC_SITE_URL` on production.** View-source a live template page, check `<link rel="canonical">`. If it says `localhost`, nothing else in this document matters until it is fixed. | Vercel env | **You** — one look at view-source |
| 0.2 | Add a build-time guard: fail the build when `NODE_ENV=production` and the URL is missing or localhost | `lib/env.ts` | Done, with a caveat ↓ |
| 0.3 | Allow `/api/og` in robots.txt — currently every share card is blocked | `app/robots.ts` | Done |
| 0.4 | Add the `?q=` disallow to the Googlebot group | `app/robots.ts:22` | Done — both groups now derive from one array |
| 0.5 | Link the six category pages from the gallery, the footer and each template page. Change `?category=` links to `/templates/<category>` | `[slug]/page.tsx`, `cv-for/[profession]`, `CategoryCards`, `SiteFooter` | Done — all six now linked site-wide from the footer |
| 0.6 | Cut `TITLE_BUDGET` 68 → 60, per the file's own doc comment | `template-copy.ts` | Done |
| 0.7 | Fix `GraphicDesigner.meta.columns` → 2 | `creative/GraphicDesigner.tsx` | Done |
| 0.8 | Sitemap `lastModified` from source-file mtime, not `new Date()` | `app/sitemap.ts` | Done differently ↓ |

**0.2, the caveat.** The guard throws only when `VERCEL` or `CI` is set; locally it warns. A
production build against localhost is a normal thing to do in this repo — `npm run previews`
and `npm run verify:seo` both do exactly that — so a hard failure there would have traded a
real problem for an invented one. The deploy path, which is the one that can actually publish
a localhost canonical, still fails hard.

**0.8, why not mtime.** Git does not record mtimes. A CI checkout stamps every file with the
time of the clone, so "last modified" from mtime is the build time wearing a disguise — the
same claim `new Date()` was making, with more code. Google uses `lastmod` only while it is
"consistently and verifiably accurate", and one page that fails the check discounts the
element site-wide, including on the blog where the dates are real.

So `lastmod` is now emitted **only where a real editorial date exists** — the ten blog posts,
which carry `publishedAt`/`updatedAt` in their own source. The other 108 URLs have none. An
absent `lastmod` costs a recrawl hint on pages that change a few times a year; a wrong one
costs the hint on the pages that change weekly. If template or guide pages ever grow a real
"last reviewed" field, `app/sitemap.ts` says where it plugs in.

### Phase 1 — Make the templates correct · 2–3 days

These are defects a paying customer will hit.

| # | Task |
| --- | --- |
| 1.1 | Fix `readableOn()` — threshold to ~0.18, or pick whichever of white/ink scores higher |
| 1.2 | Add an `onWhite(accent)` guard in `EntryHead` so light accents darken. Fixes eleven templates. |
| 1.3 | Clamp `muted` at `tint(text, 0.32)` maximum — body prose must not print at 3.6:1 |
| 1.4 | Replace the two absolutely positioned rails with `border-left` on a flowing wrapper |
| 1.5 | Pass an explicit `track` colour to `LevelBar`/`LevelDots` on dark sidebars |
| 1.6 | Guard the seven unguarded two-column templates against an empty aside |
| 1.7 | Add an empty-CV **layout** assertion to `tests/cv/templates.test.tsx` — it currently only asserts "does not throw" |
| 1.8 | Fix the ten uncompensated letterspaced headings with `textIndent`, as Photographer does |
| 1.9 | Remove `<main>` from the 32 template components — use `<div>` |

### Phase 2 — Ship images · 3–5 days · **highest traffic impact**

| # | Task | Status |
| --- | --- | --- |
| 2.1 | Generate a static preview PNG/WebP per template at build time (the Puppeteer pipeline already exists — point it at the sample CV, 800×1130, output to `public/previews/`) | Done — `npm run previews`, 3 files × 56 |
| 2.2 | Render `<Image>` with descriptive `alt` on gallery, category and detail pages. Keep the live DOM preview for the interactive column; add the static image as the indexable one | Done |
| 2.3 | Make `og:image` the actual template render, not the navy gradient card | Done |
| 2.4 | Add `Product` + `Offer` + `image` to template JSON-LD; add `ItemList` for the related grid; add a `WebPage` node with `mainEntityOfPage` | Done, partly ↓ |
| 2.5 | Submit an image sitemap | Done — 168 `<image:image>` nodes in `/sitemap.xml`; **you still have to resubmit it in Search Console** |

**2.4, what changed.** `image`, `ItemList` and `WebPage` went in as written. `Product` did
not, for the premium templates.

A premium template is not sold. Pro and Lifetime are sold, and they unlock all 56. An `Offer`
on `/templates/modern-executive` stating the Lifetime price would be saying *this template
costs that*, which is not what happens when you click — you would be buying every template.
Google's requirement is that markup describes the item it sits on, and a price for something
that is not individually purchasable is the sort of detail that earns a manual action instead
of a rich result. Premium templates therefore carry `isAccessibleForFree: false` and a pointer
to `/pricing`, where the plan prices are already stated once, correctly, by
`softwareApplicationSchema`.

The **free** templates are `['CreativeWork', 'Product']` with an `Offer` at zero — literally
true, and the only route by which the word "Free" can reach a search result. That is also the
half you want clicked.

### Phase 3 — Make the pages distinguishable · 1 week

| # | Task |
| --- | --- |
| 3.1 | **Give each template a different sample CV.** `createSampleCV()` takes no arguments today; pass a profession that matches the template. This removes 3,361 duplicated words per page and makes the preview more persuasive — a nurse sees a nurse's CV on the nursing-suited template |
| 3.2 | Render the preview **once** per page, not eight times. Related-template thumbnails become static images from Phase 2 |
| 3.3 | Widen the `template-copy.ts` pools so no two templates share more than ~2 of 13 slots — or replace generation with 200 hand-written words per template |
| 3.4 | Make `/templates` statically rendered; move filtering to the already-static `/templates/<category>` pages |
| 3.5 | Rewrite meta descriptions to lead with the query and a benefit, not the design vocabulary |
| 3.6 | Make `relatedTemplates()` reciprocal so all 56 receive sibling links |

### Phase 4 — Make 56 templates look like 56 templates · 1–2 weeks

| # | Task |
| --- | --- |
| 4.1 | Add `recommendedFonts` to `TemplateMeta` and apply on template switch. **The single highest-impact design change in this document.** |
| 4.2 | Set body `line-height` per template |
| 4.3 | Attack the name treatment — vary size, weight and case across the catalogue instead of 2em/700 on 34 of 56 |
| 4.4 | Resolve the eleven duplicate pairs: differentiate, or merge and retire |
| 4.5 | Vary `pageMargin` per template — measure is a design variable and it is currently frozen |

### Phase 5 — Fill the gaps that have buyers · 2–3 weeks

Ordered by demand:

1. **Functional / hybrid CV** — a named format with its own searches, entirely missing
2. **Europass** — the data model is already CEFR-ready; high intent, low effort
3. **Saturated coloured sidebar** — the most-purchased look in the category
4. **Cover letter templates** — matched pairs, the standard upsell
5. **Two-page-aware templates** — repeat identity, add a page marker
6. **ATS-safe creative** — eight of ten creative templates score 2–3

### Phase 6 — Go where the traffic is · ongoing

| # | Task |
| --- | --- |
| 6.1 | **French CV market.** `modèle de CV` SERPs contain no major player. The i18n architecture already exists. Highest-ROI expansion available. |
| 6.2 | **German Lebenslauf** — same picture, plus the format conventions from Phase 5 |
| 6.3 | Profession × template pages, built on the Phase 3.1 per-template sample CVs — this is the matrix approach that took Rezi from 23K to 200K monthly clicks |
| 6.4 | Reconsider the download gate, or offer one ungated download. Competitors put "no signup" in their title tags |
| 6.5 | **Do not publish more pages until Phases 0–3 are done.** ~118 pages already shipped at once on a zero-authority domain |

---

## What to do first

Phase 0 and Phase 2 are done and deployed. What is left of them is not code:

1. **0.1 — view-source a live template page** and confirm `<link rel="canonical">` says
   `https://www.createcvonline.com/…` and not `localhost`. Nothing else in this document
   matters until that is true. The build guard added in 0.2 prevents it recurring; it cannot
   retroactively check the deploy that is live right now.
2. **Resubmit `/sitemap.xml` in Google Search Console.** It carries 168 image entries that
   were not there before, and image discovery is the whole point of Phase 2.
3. **Request indexing for three or four template pages** and watch whether the preview
   images appear in Google Images over the following fortnight. That is the measurement
   that tells you whether Phase 2 worked.

Then **Phase 1** — the contrast and layout defects. Those are the ones a paying customer
hits, and unlike everything above, they are visible in the product rather than in a crawler.

The canonical check takes thirty seconds and invalidates everything else if it is wrong.
The images are the difference between competing for image search and not appearing in it.
