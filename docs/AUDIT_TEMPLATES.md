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

| # | Task | Status |
| --- | --- | --- |
| 1.1 | Fix `readableOn()` — threshold to ~0.18, or pick whichever of white/ink scores higher | Done — measured, plus a pure-black fallback ↓ |
| 1.2 | Add an `onWhite(accent)` guard in `EntryHead` so light accents darken. Fixes eleven templates. | Done, generalised ↓ |
| 1.3 | Clamp `muted` at `tint(text, 0.32)` maximum — body prose must not print at 3.6:1 | Done — measured rather than capped ↓ |
| 1.4 | Replace the two absolutely positioned rails with `border-left` on a flowing wrapper | Done |
| 1.5 | Pass an explicit `track` colour to `LevelBar`/`LevelDots` on dark sidebars | Done centrally ↓ |
| 1.6 | Guard the seven unguarded two-column templates against an empty aside | Done — five needed it; the grid collapses and the `<aside>` is not rendered |
| 1.7 | Add an empty-CV **layout** assertion to `tests/cv/templates.test.tsx` — it currently only asserts "does not throw" | Done, and a new `tests/cv/contrast.test.tsx` ↓ |
| 1.8 | Fix the ten uncompensated letterspaced headings with `textIndent`, as Photographer does | Done — eight found, via `centredTracking()` |
| 1.9 | Remove `<main>` from the 32 template components — use `<div>` | Done — 31 of them |

**The shape of the fix.** 1.1, 1.2, 1.3 and 1.5 all had the same cause and got the same
answer, which is worth more than any of them individually: **contrast is a property of a
pair, and the code only ever held one half of it.** A template chose a colour; what was
painted behind it was somebody else's business. The parts now take a `surface`, and `color`,
`muted` and the accent-as-text are all resolved against it in one place — so a template that
declares its panel gets a legible section without having to remember anything else.

Three consequences worth knowing:

- **The accent is split in two.** `c.accentColor` still paints rules, bars, bands, markers
  and photo rings at full saturation; only text moves, and only as far as it must. A designer
  can still choose amber. They cannot get amber employer names at 2.15:1.
- **`readableOn` has a third answer.** White and the soft `#111827` ink cross at background
  luminance ≈ 0.205, where both land at about 4.12:1 and neither clears AA. That band falls
  through to pure black. Verified exhaustively: zero failures across all 256 greys and 20,000
  sampled colours.
- **The `rgba(255,255,255,0.8)` idiom is gone** from all six templates that used it. A fixed
  alpha over a colour the user picks lands on whatever ratio it lands on; on Marketing's pink
  that was 3.73:1.

**1.7 is the part that matters long-term.** `tests/cv/contrast.test.tsx` walks the rendered
DOM — resolving inheritance, gradient stops, layered backgrounds and `rgba` compositing —
rather than reading the source, because a template that computes its colours correctly and
then renders a part on a panel it forgot to declare looks perfect in source and wrong on
screen. Nine of these were found that way and could not have been found any other way. It
runs every template at its default accent and one per category against six accents a user
might actually pick, including the pale yellow and the mid grey.

Two false positives are handled deliberately rather than by allowlist: a background layer
with an explicit size is a rail rather than a field, and a gradient with hard stops is two
regions whose boundary this walk cannot see.

**Also fixed, not in the original list:** the photo fallback. Four templates fill the circle
with the accent and never said what colour the initials should be, so they got white — "AE"
at 2.15:1 on amber, and it is the first thing on the page for anyone who never uploads a
photo. And the level-bar *fill* is now held to the 3:1 non-text bar, not left at whatever the
accent happened to be (2.75:1 on Modern Executive's sidebar). Not 4.5:1 — a bar is a shape,
and holding shapes to the text threshold would drag every accent toward black.

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

Phases 0, 1 and 2 are done. What is left of them is not code:

1. **0.1 — view-source a live template page** and confirm `<link rel="canonical">` says
   `https://www.createcvonline.com/…` and not `localhost`. Nothing else in this document
   matters until that is true. The build guard added in 0.2 prevents it recurring; it cannot
   retroactively check the deploy that is live right now.
2. **Resubmit `/sitemap.xml` in Google Search Console.** It carries 168 image entries that
   were not there before, and image discovery is the whole point of Phase 2.
3. **Request indexing for three or four template pages** and watch whether the preview
   images appear in Google Images over the following fortnight. That is the measurement
   that tells you whether Phase 2 worked.

Then **Phase 3** — the pages are still largely the same words and the same picture 56 times
over, which is the largest remaining SEO problem and the one that takes real writing rather
than a fix.

Two things outside this document are still blocking working features, and both are console
clicks rather than code: **Firebase Storage** is not enabled, so photo upload fails; and
there is no **PayPal webhook**, so a payment can complete without the database hearing
about it.

The canonical check takes thirty seconds and invalidates everything else if it is wrong.
The images are the difference between competing for image search and not appearing in it.

---

## Record — 3.6 and 4.1 as built

### 3.6 — related links were orphaning a third of the catalogue

`relatedTemplates()` took the first six siblings in registry order. A category holds ten
templates and the grid shows six, so all ten were picking from the same front of the list:
positions seven, eight and nine were linked to by nobody. Measured on the pre-change code,
inbound links ranged 0–15 and **fifteen of the fifty-six template pages received no internal
link from any related grid**. On a domain with no external links that is most of the
PageRank those pages were ever going to get.

The fix is to take the siblings as a *cycle* starting after the current template rather than
from the front. In-degree then equals out-degree by construction: every template links to
the six after it and is linked to by the six before it. Still deterministic, so the pages
stay prerenderable. Small categories top up from the closest ATS scores elsewhere, offset by
position so those templates do not all point at the same handful either.

### 4.1 — fonts, and what "recommended" turned out to mean

The audit asked for `recommendedFonts`. What shipped is `fonts: { heading, body }` on
`TemplateMeta` — required, not optional, so a new template cannot be added without deciding
how it is typeset. All 56 were rendering in the same Inter/Inter default, which is the real
reason a shopper scrolling the gallery saw six designs rather than fifty-six: type does more
for perceived difference than column count does.

Three decisions worth recording:

- **Where the pairing is applied.** Nineteen call sites were assembling
  `{ templateId, accentColor: template.accentDefault }` by hand. Adding a third field to
  nineteen places is how the twentieth gets forgotten, so they all now call
  `templateDefaults(template)`. A test greps the tree for the old shape and fails on
  reintroduction.
- **When the editor overrides your fonts.** Switching template is meant to be a non-event.
  But a template that renders in whatever face the previous one used is not a different
  design. The rule: the incoming pairing is applied only when the outgoing one still matches
  *some* template's defaults — not just the current template's, because the user may have
  arrived here from another. Once you pick a font yourself, no template switch touches it
  again.
- **Which constraints are testable.** Same-category pairings must not repeat (that is the
  side-by-side comparison the change exists to lose). ATS templates are held to conventional
  faces. Classic templates are held to `kind: 'serif'` read off the font table itself, so
  adding a face cannot silently widen the definition. No single pairing may cover more than
  six of the 56.

35 distinct pairings across 56 templates; 12 of the 15 available faces are in use. All 168
preview images were regenerated — the typeface changes every one of them.

### 4.2 / 4.3 / 4.5 — measured, and one of the three was a different bug

Everything below was measured from the rendered documents at `/template-preview/<slug>`,
not read out of the source. Two of the findings only exist at that level.

**4.2 and 4.5 were exactly as described.** All 56 templates rendered at `line-height: 1.5`
and `pageMargin: 44` — the schema defaults, untouched. Measuring the typographic *measure*
(characters per line of running body text) gave the number that mattered:

| | n | median cpl | range |
| --- | --- | --- | --- |
| One column | 40 | 92 | 72–135 |
| Two column | 16 | 70 | 60–81 |

The two-column templates were already set at the ideal 60–75 measure. The one-column ones
were running long, and the classic serif family — Academic and Elegant Serif at 135
characters — was running very long.

The first attempt was a formula: derive each margin from its measured line length to hit a
target. It produced a worse catalogue than it started with. Targeting 88 cpl clamped 17
templates at the 72px ceiling; relaxing to 95 cpl piled 21 onto the floor instead. Margin
is a weak lever on measure — at 10.5px on a 210mm page the line length is set by font size,
and even the maximum margin only recovers about 15% — so optimising for it just drove
everything to the clamps and deleted the variation 4.5 exists to create.

What shipped instead: `pageMargin` is banded by *what kind of document the template is* — a
Legal CV is a document and wants a document's margin, a portfolio page is a poster — and
spread inside each band by measured line length so the widest-set templates still get the
most relief. 20 distinct values, no value on more than 5 templates. `lineHeight` is then
derived from the measure that *resulted*, in five bands from 1.36 to 1.60: the longer the
line, the more help the eye needs finding the start of the next one.

**4.3's premise held, but only when measured the way the audit measured it.** Counting
distinct size/weight/case combinations says 40 of 56 are unique, which looks solved — and
is misleading, because the combinations differ by 0.05em. Counting the audit's way, as a
*band*, 31 of 56 still sat between 1.9em and 2.35em and 38 of 56 at weight 700.

**And measuring it turned up a defect nobody had reported: no font in the catalogue ships
a weight 800.** `fontWeight: 800` appeared 29 times across 26 templates. Every one was
synthesised — the browser smearing the 700 outline — which is precisely why 700 and 800
looked identical on the page. The same applied to `600` on Roboto, Lato, Merriweather,
Libre Baskerville and the three system faces. Weight was not a design variable at all; it
was two variables pretending to be five.

That cannot be fixed per template, because the user can put any of the fifteen faces on any
template. It has to resolve at render time against whichever face is active — the same
shape as `contrastAgainst()` resolving a colour against whatever surface it lands on. So:
`FONT_WEIGHTS` is read off each face's own `googleSpec`, and `headingWeight(c, n)` /
`bodyWeight(c, n)` snap a request to the nearest cut that exists. Ties resolve toward 700,
which is the one rule that gets both awkward cases right — 600 on Arial wants the bold,
800 on Lato wants the bold too, because Black overshoots by more than Bold undershoots.

With real weights available, the masthead was rebuilt on two rules: size scales to the
*kind* of face it is set in (display serifs were cut to be set large; Arial at 3.4em is a
shout), and weight comes down as size goes up. Measured after:

| | audit | now |
| --- | --- | --- |
| Sitting in 1.9–2.35em | 34/56 | 20/56 |
| At weight 700 | 34/56 | 17/56 |
| Distinct size + weight + case + face | — | 53/56 |
| Faces the name is set in | 1 | 15 |

One thing the rendered check caught that the numbers alone would have got wrong: Graphic
Designer and Modern Creative appeared to wrap their names onto four lines. They do not —
the name is deliberately stacked in two spans, and `getClientRects()` returns one rect per
line *per span*. Looking at the picture settled in a second what the metric could not.

### 4.4 — the eleven pairs, measured on the pictures

"Too close to sell as separate products" is a claim about what a shopper sees, so it was
measured on the rendered thumbnails rather than the component files. Two signals per
template: the downscaled greyscale page (typeface, weight, density, colour) and the row and
column ink profile (where the blocks are, which survives a font change and so stops new
type from scoring as a new design). Distance is the mean of the two, over all 1,540 pairs.

Across the catalogue, mean pair distance went from **0.753 to 0.776** — the Phase 4 work
separated the catalogue overall. Six of the audit's named pairs moved a long way apart:

| Pair | before | after | rank of 1,540 |
| --- | --- | --- | --- |
| Software Engineer ↔ ATS Simple | 0.524 | 0.765 | #87 → #732 |
| Modern ATS ↔ Software Engineer | 0.582 | 0.711 | #208 → #531 |
| Simple Classic ↔ Tech Minimal | 0.580 | 0.702 | #195 → #487 |
| HR ↔ Government | 0.651 | 0.698 | #380 → #475 |
| Modern ATS ↔ ATS Simple | 0.411 | 0.533 | #19 → #72 |
| ATS CV ↔ ATS Resume | 0.589 | 0.594 | #220 → #166 |

**Measuring after the change also caught two regressions the change itself caused**, which
is the whole reason for measuring after. Banding masthead size by face *kind* gave three
display serifs nearly the same treatment: Executive Classic and Elegant Serif collapsed
from 0.747 apart to 0.310, and Modern Elegant closed on Elegant Serif from 0.596 to 0.437.
A rule that separates templates on average can still fuse the two that were already
closest. Fixed by using case rather than size on Executive Classic — small letterspaced
capitals read nothing like a 3.1em title-case line, whatever the face — and by moving
Modern Elegant off Playfair onto Lora. Both pairs are now clear.

**What remains is not a typography problem.** Five pairs sit under 0.25, and they are one
cluster: Banking, Modern Corporate, Cybersecurity, Art Director and Content Creator are
two-column layouts whose blocks land in the same places. Different faces, different
margins, same page. That is what 4.4 means by "differentiate, or merge and retire", and it
needs layout work, not font work. It is still open.

`tests/cv/distinctiveness.test.ts` now runs this measurement over the committed previews on
every test run: no pair may fall below 0.15, the cluster under 0.25 may not grow past five,
every audit-named pair must stay above 0.45, and the catalogue mean must stay above 0.74.
The count is pinned rather than asserted-to-zero so the open work stays visible and a sixth
pair cannot appear quietly.

---

## Record — Phase 5 as built

Five templates, one new section, one new document type. The catalogue goes 56 → 61, and the
distinctiveness measurement from 4.4 held while it grew: mean pair distance 0.776 → 0.777
across 1,830 pairs, the near-identical cluster still exactly five, and every new template
clear of its nearest neighbour (Coloured Sidebar 0.281, Creative ATS 0.418, Hybrid 0.451,
Functional 0.525, Europass 0.600).

### 5.1 — functional and hybrid needed a section, not a template

The gap was not "no functional template", it was that the data model could not express one.
A functional CV proves a claim by grouping achievements under the capability they
demonstrate; there was nowhere to put that. `competencies` is a new built-in section —
name, framing, evidence — deliberately not the `skills` array with a description bolted on.
A skill is a word with a rating and forty fit on a page; a competency is a short case and
three to six is the section.

Two templates then differ by one variant and one omission. **Functional CV** renders
competencies `stack` and work history `history` — role, employer, dates, no bullets,
because repeating the achievements under the employers hands the timeline back the argument
the competencies just took from it. **Hybrid CV** renders competencies `grouped` (claim
beside evidence) and keeps the history at full strength.

**The bug this shipped with, and what caught it.** `defaultSectionConfigs()` ships
`competencies` disabled — correct for a blank CV, which should not open with nine empty
headings — and the sample builder used it verbatim. So both previews rendered with *no
competency block at all*: the one thing those formats exist for, missing, on the two pages
selling them. Every existing test passed, because a section is allowed to be absent. It was
visible in one glance at the generated preview image. The sample builder now enables any
section it was given content for, and `tests/cv/samples.test.ts` asserts the two formats
actually render the block.

### 5.2 — Europass, and a template that answers to someone else

The data model was already 90% there: `languageLevelSchema` is CEFR. What the format needs
on top is the labelled left gutter and the self-assessment grid, and the grid raised an
honest question — the official form asks for five competences (listening, reading, spoken
interaction, spoken production, writing) against the single level per language we store.
Generating five different values from one would be fabricating a self-assessment on the
candidate's behalf. Three columns carrying the recorded level is the same grid without the
invention.

It also broke a house rule: the design tests require Classic templates to be set in a serif,
and the Europass is a sans because the Commission set it in a sans. `TemplateMeta.standard`
names the authority a template answers to, and the tests skip house rules for those — an
exemption that says *why* rather than a slug on a list.

### 5.3 — the saturated sidebar, and where the band is painted

The band is `pageBackground`, not a `<div>`. A coloured element in the flow stops at the end
of its content and at the first page break, so sheet two of a two-page CV arrives with a
white stripe where the design was. Text on the band resolves against the band, so a yellow
accent prints dark type and a navy one prints white without either being special-cased.

Two defects the tests caught immediately: the job title was set to the band colour and
rendered at 1.03:1 on white (it is now `accentOn(band)` — measured against paper, which is
what it lands on), and the shared two-column skill default turned a 34%-wide band into a
pair of four-character stacks.

### 5.4 — cover letters, and why there is only one

Competitors sell "matched pairs" and the way that promise breaks is that the two documents
are separate records which drift: restyle the CV in March, send February's letter in April.
So the letter has no design of its own. It stores only what is genuinely per-letter —
recipient, vacancy, body — and takes the CV's typefaces, accent, margins, heading case and
date format at render time. It lives on the CV document, so it needs no new collection, no
new guard and no new save path, and a tailored letter per application is a CV duplicate,
which the product already does well.

It exports as the first sheet of the same PDF, because that is the order it is read in. The
full-bleed band is dropped from `<body>` for a pair export — otherwise a sidebar stripe runs
down a document that has no sidebar.

### 5.5 — page numbers, and two approaches that look right and produce nothing

"Repeat identity, add a page marker" turned out to be gated on something not obvious:
Chromium cannot give CSS a live page number. Both routes were built and measured.
`@page { @bottom-right { content: counter(page) } }` renders *nothing at all*. A
`position: fixed` element does repeat correctly on every printed page — verified — but
`counter(page)` inside it always resolves to `0`.

The only real source is Chromium's own `pageNumber` / `totalPages`, which needs a margin to
draw into. So a multi-page export renders twice: once with no margin to find out whether it
is long, then again with an 11mm strip and a footer. Single-page CVs — the majority — pay
nothing and are not pushed onto a second page by the strip reserved to say they are on one.
Each half of the footer sits on an opaque pill, because the full-bleed bands continue into
the footer strip and are not always on the same edge.

The test asserts against text extracted from the rendered PDF. A naive version passes on a
completely absent footer: the streams are Flate-compressed so "Page 2 of 3" is not in the
bytes, while "Amina" *is*, out of the uncompressed `/Title`.

### 5.6 — the ATS-safe creative

Eight of ten creative templates scored 2–3, so a designer applying through Greenhouse had to
leave the category. That was a false choice: multi-column flow, text in graphics, icon
glyphs standing in for labels and rated bars break parsing — scale, two contrasting
typefaces and whitespace do not. Creative ATS spends everything on the second list and
nothing on the first, and scores 5.

### Still open

- The five near-identical pairs from 4.4 (Banking, Modern Corporate, Cybersecurity, Art
  Director, Content Creator) are unchanged. They need layout work, not type.
- 3.4, deferred: `/templates` is still dynamically rendered.
- Of the six gaps in 1.6, the remainder are infographic beyond bars, monospace/terminal,
  dark page, US Federal, and the German Lebenslauf conventions — which belong with 6.2.

---

## Record — 6.1 French, and a correction to the audit

### The audit was wrong about the starting point

6.1 says "the i18n architecture already exists". It does not, and did not. What existed was
a `locale` field on the user profile that nothing reading it ever rendered, and `lang="en"`
hardcoded in the root layout. No locale routing, no dictionaries, no `hreflang`, no
`next.config` i18n block. This was built from nothing, and the estimate in the audit should
be read with that in mind.

### Paths, not prefixes

The cheap way to add a language is `/fr/templates`. It is also self-defeating here: the
entire reason to build a French site is that `modèle de CV` is a term with demand and no
strong incumbent, and a URL that says `templates` to a French searcher throws away the one
part of the address they read. So each page declares its own French path — `moderne`,
`entreprise`, `creatif`, `informatique`, `classique` — and `lib/i18n/locales.ts` holds the
pairing.

That pairing is what makes `hreflang` reciprocal **by construction**. Google discards a
cluster whose annotations disagree, which is indistinguishable from having none except that
it looks like the work was done. Both sides are generated from one table, so a page cannot
name a translation that does not name it back. Verified against the served HTML, not the
metadata objects: `/templates/modern` and `/fr/modeles-de-cv/moderne` each carry all three
annotations, and `/pricing` correctly carries none.

### Eight pages, not seventy-four

The template detail pages are deliberately not translated yet. Audit 3.5 records a
first-party case where ~284 pages published at once on a new domain cut impressions 75%,
and this domain already shipped ~118 in one go. The eight pages here — the home page, the
gallery and the six category pages — carry exactly the terms the audit found unclaimed.
Once those index, the sixty-one detail pages are a known-good follow-up rather than a
repeat of a documented bad outcome. `tests/lib/i18n.test.ts` pins the count so the decision
stays deliberate.

### Written in French, not translated

The home page has a section with no English counterpart, on what a French CV expects: the
photograph is normal where UK and US advice says avoid it, one page is the convention,
languages are stated in CECRL, and Europass is a format some employers ask for by name.
None of that is true on the English site, and it is the part a French reader will recognise
as written for them rather than run through a translator. A test asserts the headlines are
actually French and that the copy says `modèle` rather than `template` — the second is the
query with the demand behind it.

### Two things this increment does not fix

- **`<html lang>` is still `en` on the French pages.** Next.js only allows a per-locale
  `<html>` with multiple root layouts, which requires there to be no `app/layout.tsx` — and
  there is one, shared by the dashboard, editor, auth and print routes. The French subtree
  sets `lang="fr"` on a wrapping element instead, which is valid and is what assistive
  technology and Google use for the content inside it. The inaccuracy is confined to the
  attribute above it.
- **The header and footer are still English**, as are `/register` and `/pricing`. The page
  *content* is French, which is what gets indexed and read, but a French visitor meets
  English chrome. Translating the shared shell is the obvious next step and is a larger
  change than the eight pages were.

### 6.1 completed — what the first French release actually shipped

The first pass shipped eight French pages and called the phase done. It was not, and the
gaps were the visible ones rather than the subtle ones.

**The pictures were English.** The gallery shows pre-rendered images, not live DOM, so
every French page displayed sixty-one photographs of a CV headed `WORK EXPERIENCE` beneath
French copy. The copy can be perfect and the product still looks English, because the
picture *is* the product. `/template-preview/[slug]` now takes `?lang=fr`, the generator
produces a second set into `public/previews/fr/`, and a test fails if a template has an
English image without a French one.

**The chrome was English.** The header nav, the footer, the `Free`/`Pro` badges and the
`two columns` line on every card. Sixty-one cards on a page means the card strings are most
of the text a shopper reads while scrolling.

**Half the links left the language.** French category pages linked to `/templates/<slug>`,
and every French call to action pointed at the English `/pricing`. A visitor who was ready
to pay met an English page.

Now: 61 French template pages, a French pricing page at `/fr/tarifs`, French cards, French
chrome, and 193 URLs in the sitemap with every French entry `hreflang`-paired.

**Two decisions worth recording.**

Template detail copy is *generated from structured metadata*, not translated. Each
template's `description`, `tagline`, `bestFor` and `features` are English prose — sixty-one
templates times four fields is roughly six hundred sentences, and machine-translating them
would put six hundred unread sentences on the pages meant to sell the product. The French
pages are written from category, columns, ATS score, photo, plan and typeface instead:
facts that are true by construction, in sentences written once by someone who could read
them. The cost is real — the English page says something specific about each design that
this cannot.

The sixty-one detail pages were held back at first on the launch-velocity reasoning in
audit 3.5, and publishing them is a different bet from publishing 61 new pages: they are
the second language of pages Google has already been crawling for months, each arriving
paired to an indexed English page rather than unattached.

**A regression caught on the way.** `lib/i18n/nav.ts` imported the template registry to
build a six-item dropdown, and `SiteHeader` is a client component — so all sixty-one CV
template components were being pulled into the browser bundle. The six categories are now
written out in `nav.ts`, with a test holding the list against the registry.

**Still English:** `/register`, `/login`, the editor and the dashboard. Those are the
product behind the sign-up, not the pages that rank, and they are the obvious next step.

---

## Record — 6.2 German

The audit put German alongside French: `lebenslauf template` returns simplegermany.com,
liveingermany.de, coolfreecv.com and expatrio.com — no major player, the same picture. It
was second rather than first only because French was slightly larger.

**It cost a fraction of what French did**, and that is the point worth recording. French
was expensive because it had to build the i18n architecture the audit wrongly said already
existed. German reused all of it: adding `'de'` to `LOCALES` turned every locale-keyed
`Record` into a compile error, and TypeScript listed exactly what needed writing. The work
was the copy, not the plumbing — which is what a second language is supposed to cost.

Same shape as French: 69 pages (home, gallery, six categories, pricing, 61 template pages),
a German image set at `public/previews/de/`, German section headings on every rendered
document, German chrome, and three-way `hreflang` verified against the served HTML.

**Written for German conventions, not translated.** A Lebenslauf is *tabellarisch* — dates
against facts, not prose — and the home page says so. The photo question is hedged rather
than asserted, because it is genuinely contested: still normal, and a growing number of
employers ask for applications without one under the AGG. Claiming either "always" or
"never" would be wrong. Section headings use the words the format uses:
`Berufserfahrung`, `Ausbildung`, `Kenntnisse`.

**Two things the third language forced that the second had not.**

The header's language control was a single "switch to the other one" link, which only works
with two. It now lists every alternative a page actually has, still driven by the path map,
so it cannot offer a translation that does not exist.

`alternatesFor()` had a French-shaped special case for template URLs — two regexes and two
sets of category slugs. Three languages made that untenable, so it now iterates a
`TEMPLATE_ROOT` map. Adding a fourth language is one line there rather than a new branch.

**Still English across all three:** `/register`, `/login`, the editor and the dashboard.
That is the product behind the sign-up rather than the pages that rank.
