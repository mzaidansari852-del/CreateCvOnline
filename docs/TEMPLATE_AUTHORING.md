# Authoring a CV template

Every template is a plain React server component that receives the same normalised data.
Adding one is: create a file, export a default component and a `meta` object, run
`npm run generate:templates` (which also runs automatically before `next build`).

```
components/cv/templates/<category>/<PascalCaseName>.tsx
```

Categories: `modern`, `corporate`, `creative`, `technology`, `classic`, `ats`.

---

## 1. The contract

```tsx
import type { CVTemplateProps, TemplateMeta } from '@/types/cv';

export const meta: TemplateMeta = { /* see §5 */ };

export default function MyTemplate({ cv, customization: c }: CVTemplateProps) { … }

// optional — only for templates with a full-bleed coloured band
export function pageBackground(c: CVCustomization): string { … }
```

`CVTemplateProps` is `{ cv: CVData; customization: CVCustomization }`. Nothing else is
passed in and nothing else may be imported from app state — a template must render
identically in the editor preview, the public gallery and the headless-Chromium PDF.

---

## 2. What the frame already does for you

`components/cv/CVDocument.tsx` wraps your component in `.cv-page` and sets:

- page width/height for A4 or US Letter,
- `font-family` from `customization.bodyFont` / `headingFont`,
- base `font-size` (`customization.fontSize`) and `line-height`,
- `color` from `customization.textColor`,
- the `pageBackground` you export, if any.

**Therefore your template must never set** `width`, `height`, `font-family` on the root,
or a base `font-size` in `px`/`rem`. Size everything in **`em`** so the user's font-size
slider scales the whole document.

Use these three customization values for spacing:

| value               | meaning                                    | typical use                        |
| ------------------- | ------------------------------------------ | ---------------------------------- |
| `c.pageMargin`      | page padding in px (16–96, default 44)     | `padding: c.pageMargin`            |
| `c.sectionSpacing`  | vertical rhythm between sections (6–48)    | `marginTop: c.sectionSpacing`      |
| `c.fontSize`        | already applied by the frame               | do not read it directly            |

---

## 3. Rendering sections

Never hardcode a section order and never read `cv.sections` directly.

```tsx
import { visibleSections, splitSections } from '@/lib/cv/sections';
import { SectionContent } from '@/components/cv/parts';

const sections = visibleSections(cv);                      // ordered, enabled, non-empty
const { main, aside } = splitSections(sections, SIDEBAR);  // for two-column templates
```

`visibleSections` already drops disabled and empty sections, so a template never renders
an orphan heading. Then, for each section, render **your own heading chrome** and delegate
the body:

```tsx
{main.map((section, i) => (
  <section key={section.id} className="cv-section" style={{ marginTop: i === 0 ? 0 : c.sectionSpacing }}>
    <h2 className="cv-section-title" style={/* your design */}>{section.label}</h2>
    <SectionContent
      sectionId={section.id}
      cv={cv}
      c={c}
      accent={accent}
      color={c.textColor}
      muted="#5b6472"
      variants={{ experience: 'timeline', education: 'two-col' }}
      skillColumns={2}
    />
  </section>
))}
```

### Available `variants` per section

| section          | variants                                                   |
| ---------------- | ---------------------------------------------------------- |
| `experience`     | `stack` (default), `timeline`, `two-col`, `compact`, `minimal` |
| `education`      | `stack`, `two-col`, `compact`, `inline`                     |
| `skills`         | driven by `skillDisplay`: `bars`, `dots`, `tags`, `text`    |
| `languages`      | `stack`, `bars`, `dots`, `grid`, `inline`                   |
| `projects`       | `stack`, `cards`, `compact`                                 |
| `certifications` | `stack`, `compact`                                          |
| `awards`         | `stack`, `compact`                                          |
| `volunteer`      | `stack`, `compact`                                          |
| `publications`   | `stack`, `compact`                                          |
| `interests`      | `inline`, `tags`, `stack`                                   |
| `references`     | `stack`, `grid`                                             |

Pass `skillDisplay="tags"` to override the user's setting when a layout demands it (a
narrow sidebar cannot show bars *and* labels, for instance) — but prefer honouring `c`.

---

## 4. Header building blocks

```tsx
import { ContactList, Photo, ContactIcon, Tags, LevelBar, LevelDots } from '@/components/cv/parts';
import { fullName, initials, headingTransform, headingTracking, tint, shade, readableOn, prettyUrl } from '@/lib/cv/format';
```

- `<Photo cv={cv} c={c} size={96} border="#fff" fallbackBackground={accent} />` — respects
  `showPhoto` / `photoShape` and falls back to initials. Renders nothing when photos are off.
- `<ContactList cv={cv} accent={accent} icons={c.showIcons} layout="inline|stack|grid" />`
- `headingTransform(c)` → the `text-transform` value the user selected.
- `tint(hex, 0..1)` lightens toward white, `shade(hex, 0..1)` darkens,
  `readableOn(hex)` returns `#ffffff` or a dark ink for guaranteed contrast.

Always render the name as `<h1>` and section titles as `<h2>` — heading hierarchy is part
of what makes a document machine-readable.

---

## 5. `meta`

```tsx
export const meta: TemplateMeta = {
  id: 'modern-03',                    // stable, never changes (stored on user documents)
  slug: 'modern-executive',           // public URL: /templates/modern-executive
  name: 'Modern Executive',
  category: 'modern',
  premium: true,
  atsScore: 4,                        // 1–5, be honest: heavy graphics ⇒ lower
  columns: 2,
  hasPhoto: true,
  accentDefault: '#1f3af5',
  tagline: 'A dark sidebar keeps contact details and skills out of the way of your story.',
  description: '2–3 sentences of genuinely useful copy for the public template page.',
  bestFor: ['Senior managers', 'Directors', 'Heads of department'],
  features: ['Full-height sidebar', 'Timeline experience', 'Skill bars'],
  keywords: ['executive cv template', 'senior manager cv', 'two column cv'],
};
```

`id` is persisted on user documents — changing it orphans saved CVs. `slug` is the public
URL and should read like something a person would search for.

---

## 6. Pagination rules

Chromium paginates the document when exporting a PDF. Two class names control it:

- `className="cv-block"` — never split this element across a page break. Put it on each
  job entry, each education entry, each card. The shared content renderers already do this.
- `className="cv-section-title"` — never leave this heading alone at the bottom of a page.

For a full-bleed coloured sidebar, export `pageBackground` returning a gradient with a hard
stop at the sidebar width. The print route copies it onto `<body>` so the band continues
across every page:

```tsx
export function pageBackground(c: CVCustomization): string {
  return `linear-gradient(to right, ${shade(c.secondaryColor, 0.05)} 0 34%, #ffffff 34% 100%)`;
}
```

The sidebar `<aside>` itself must then be **transparent** and simply occupy that 34% column.

---

## 7. Hard rules

1. No `'use client'`. Templates are server components with zero interactivity.
2. No imports from `lucide-react`, `next/image`, `next/link` or anything under `app/`.
   Use the inline SVGs in `parts.tsx`.
3. No Tailwind utility classes for typography inside the document — only the three
   document class names (`cv-page`, `cv-block`, `cv-section`, `cv-section-title`) plus
   inline styles. Tailwind's `rem` scale would break font-size scaling.
4. Handle missing data. Every field can be empty; the sample CV is the *maximum*, not the
   minimum. Guard optional blocks with a truthiness check.
5. `overflow: hidden` is forbidden on anything that can contain flowing text — it silently
   eats content on page 2.
6. Never use `position: fixed`, `height: 100vh` or viewport units.
7. Colours come from `c.accentColor`, `c.secondaryColor`, `c.textColor` and the
   `tint`/`shade` helpers. Do not hardcode a brand colour.

---

## 8. Reference implementations

- `components/cv/templates/modern/ModernProfessional.tsx` — single column, header band.
- `components/cv/templates/modern/ModernExecutive.tsx` — two column, full-bleed sidebar.

Read both before writing a new one.
