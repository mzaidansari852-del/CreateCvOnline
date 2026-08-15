import 'server-only';

import type { Browser, LaunchOptions } from 'puppeteer-core';

import { CoverLetterDocument } from '@/components/cv/CoverLetterDocument';
import { CVDocument, documentPageBackground } from '@/components/cv/CVDocument';
import { CV_DOCUMENT_CSS, printPageCss } from '@/lib/cv/document-css';
import { googleFontsHref, PAPER } from '@/lib/cv/format';
import { fullName } from '@/lib/cv/format';
import { serverEnv } from '@/lib/env';
import { DEFAULT_LOCALE, type Locale } from '@/lib/i18n/locales';
import type { CVCustomization, CVData } from '@/types/cv';

/**
 * PDF generation.
 *
 * The document is rendered to a *self-contained HTML string* and handed to Chromium via
 * `setContent`, rather than pointing a headless browser at a URL on our own server. That
 * choice matters:
 *
 *  - no auth round-trip, no "can the server reach itself" problem on serverless,
 *  - no risk of the renderer picking up a stale cached page,
 *  - the exported PDF is produced from exactly the same React tree as the live preview.
 *
 * It is only possible because CV templates use inline styles plus four document class
 * names — so the entire stylesheet a CV needs is `CV_DOCUMENT_CSS`, not all of Tailwind.
 */

export interface RenderOptions {
  cv: CVData;
  customization: CVCustomization;
  /** Adds a discreet footer credit. Free-plan exports carry it; Pro exports do not. */
  branding?: { label: string; url: string } | null;
  /**
   * Which document to export.
   *
   * `'cv+letter'` puts the letter first, which is the order it is read in — a recruiter
   * opens one attachment, and the letter is the thing that explains the CV behind it.
   */
  document?: 'cv' | 'letter' | 'cv+letter';
  /** `YYYY-MM-DD` used when the letter carries no explicit date. */
  today?: string;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Builds the standalone HTML document for a CV. Also used by the `/print` route.
 *
 * `react-dom/server` is imported dynamically: Next.js refuses a static import of it from
 * the App Router (it would pull the whole server renderer into any module graph that
 * touches this file), and here it is only ever needed inside a Node route handler.
 */
export async function renderCVHtml({
  cv,
  customization,
  branding = null,
  document = 'cv',
  today,
}: RenderOptions): Promise<string> {
  const { renderToStaticMarkup } = await import('react-dom/server');

  /*
   * The letter is a sheet in the same file, not a second export.
   *
   * `break-after: page` between them is what makes one PDF hold both without the letter
   * bleeding into the CV's first page — and keeping them in one document is also what
   * keeps the pair together on the way to the employer, which is the entire promise.
   */
  const wantsLetter = document !== 'cv' && cv.coverLetter.enabled;
  const wantsCv = document !== 'letter';
  const letterMarkup = wantsLetter
    ? renderToStaticMarkup(
        <CoverLetterDocument
          cv={cv}
          customization={customization}
          today={today}
          className={wantsCv ? 'cv-page-break' : undefined}
        />,
      )
    : '';
  const cvMarkup = wantsCv
    ? renderToStaticMarkup(<CVDocument cv={cv} customization={customization} />)
    : '';
  const markup = `${letterMarkup}${cvMarkup}`;
  const paper = PAPER[customization.paperSize];
  const fontsHref = googleFontsHref([customization.bodyFont, customization.headingFont]);
  const background = wantsCv && !wantsLetter ? documentPageBackground(customization, cv) : undefined;
  const name = fullName(cv) || 'Curriculum Vitae';

  const brandingMarkup = branding
    ? `<div class="cv-credit">${escapeHtml(branding.label)} · ${escapeHtml(branding.url)}</div>`
    : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(name)} — CV</title>
<meta name="robots" content="noindex, nofollow">
${fontsHref ? `<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link rel="stylesheet" href="${fontsHref}">` : ''}
<style>
${printPageCss(paper.puppeteerFormat)}
${background ? `body { background: ${background}; }` : ''}
${CV_DOCUMENT_CSS}
.cv-page-break { break-after: page; page-break-after: always; }
.cv-credit {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 10px;
  text-align: center;
  font-size: 7.5px;
  letter-spacing: 0.04em;
  color: #9aa2b1;
  font-family: 'Inter', system-ui, sans-serif;
}
</style>
</head>
<body>
${markup}
${brandingMarkup}
</body>
</html>`;
}

/* -------------------------------------------------------------------------- */
/* Browser                                                                     */
/* -------------------------------------------------------------------------- */

const LOCAL_CHROMIUM_CANDIDATES = [
  '/opt/pw-browsers/chromium',
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser',
  '/usr/bin/google-chrome-stable',
  '/usr/bin/google-chrome',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
];

export class PdfUnavailableError extends Error {
  readonly status = 503;
  constructor(message: string) {
    super(message);
    this.name = 'PdfUnavailableError';
  }
}

async function firstExistingPath(candidates: string[]): Promise<string | null> {
  const { access } = await import('node:fs/promises');
  for (const candidate of candidates) {
    try {
      await access(candidate);
      return candidate;
    } catch {
      /* try the next one */
    }
  }
  return null;
}

/**
 * Resolves a Chromium, in priority order:
 *   1. a remote CDP endpoint (Browserless, a sidecar container),
 *   2. an explicit executable path,
 *   3. `@sparticuz/chromium` — the serverless build used on Vercel and Lambda,
 *   4. a Chromium already installed on the machine.
 */
async function openBrowser(): Promise<Browser> {
  const puppeteer = (await import('puppeteer-core')).default;
  const { browserWSEndpoint, executablePath } = serverEnv().pdf;

  if (browserWSEndpoint) {
    return puppeteer.connect({ browserWSEndpoint });
  }

  const baseArgs = [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    '--disable-gpu',
    '--font-render-hinting=none',
  ];

  if (executablePath) {
    return puppeteer.launch({ executablePath, args: baseArgs, headless: true });
  }

  // Serverless: @sparticuz/chromium ships a Lambda-compatible binary.
  try {
    const chromium = (await import('@sparticuz/chromium')).default;
    const serverlessPath = await chromium.executablePath();
    if (serverlessPath) {
      const options: LaunchOptions = {
        executablePath: serverlessPath,
        args: [...chromium.args, ...baseArgs],
        headless: true,
      };
      return puppeteer.launch(options);
    }
  } catch {
    /* Not running on a supported serverless platform — fall through to a local browser. */
  }

  const local = await firstExistingPath(LOCAL_CHROMIUM_CANDIDATES);
  if (local) {
    return puppeteer.launch({ executablePath: local, args: baseArgs, headless: true });
  }

  throw new PdfUnavailableError(
    'No Chromium binary is available for PDF export. Set PDF_CHROMIUM_EXECUTABLE_PATH to a Chrome/Chromium ' +
      'executable, or PDF_BROWSER_WS_ENDPOINT to a remote browser. On Vercel and AWS Lambda the bundled ' +
      '@sparticuz/chromium is used automatically. See README.md → "PDF export".',
  );
}

/* -------------------------------------------------------------------------- */
/* Render                                                                      */
/* -------------------------------------------------------------------------- */

export interface PdfResult {
  buffer: Buffer;
  pageCount: number;
  bytes: number;
}

/** Height of the strip reserved for the running footer on a multi-page export. */
const FOOTER_MARGIN = '11mm';

/**
 * The running footer for a CV that runs to more than one page.
 *
 * Two sheets arriving in a recruiter's inbox with nothing tying them together is a real
 * failure mode: page two gets separated, or printed on its own, and there is no name on it.
 * So a multi-page export repeats the candidate's identity and numbers the pages.
 *
 * It has to be Chromium's own header/footer rather than anything in the document, because
 * a live page number is not available to CSS here. Both of the obvious routes were tried
 * and measured: `@page { @bottom-right { content: counter(page) } }` renders nothing at
 * all in Chromium, and `counter(page)` inside a `position: fixed` element renders — on
 * every page, correctly repeated — but always resolves to `0`. The only source of a real
 * page number is the `pageNumber` / `totalPages` spans below.
 *
 * Each half sits on its own opaque pill. Several templates paint a full-bleed colour band
 * that continues into the footer strip, and it is not always on the same edge — Coloured
 * Sidebar and Modern Executive band the left, Management bands the right. Grey text in the
 * margin would be legible on some templates and invisible on others, so the footer carries
 * its own background and reads as a deliberate page tab on all of them.
 */
/**
 * "Page 1 of 2" / "Page 1 sur 2" / "Seite 1 von 2".
 *
 * Split around the two counters rather than interpolated, because Chromium replaces the
 * contents of `.pageNumber` and `.totalPages` itself — the words have to sit outside those
 * spans, and the three languages put them in different places.
 */
const PAGE_LABEL: Record<Locale, { lead: string; between: string }> = {
  en: { lead: 'Page ', between: ' of ' },
  fr: { lead: 'Page ', between: ' sur ' },
  de: { lead: 'Seite ', between: ' von ' },
};

function footerTemplate(name: string, locale: Locale): string {
  const pill =
    'background:#ffffff;border:1px solid #e5e7eb;border-radius:3px;padding:1.5px 5px;' +
    'color:#4b5563;white-space:nowrap';
  const page = PAGE_LABEL[locale] ?? PAGE_LABEL[DEFAULT_LOCALE];
  return (
    `<div style="width:100%;font-family:system-ui,-apple-system,'Segoe UI',sans-serif;font-size:7.5px;` +
    `padding:0 12mm;display:flex;align-items:center;justify-content:space-between;">` +
    `<span style="${pill}">${escapeHtml(name)}</span>` +
    `<span style="${pill}">${escapeHtml(page.lead)}<span class="pageNumber"></span>` +
    `${escapeHtml(page.between)}<span class="totalPages"></span></span>` +
    `</div>`
  );
}

export async function renderCVPdf(options: RenderOptions): Promise<PdfResult> {
  const html = await renderCVHtml(options);
  const paper = PAPER[options.customization.paperSize];

  const browser = await openBrowser();
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: paper.width, height: paper.height, deviceScaleFactor: 2 });

    // `load` waits for the webfont stylesheet to be fetched; the timeout keeps a blocked
    // font CDN from turning a download into a hang.
    await page.setContent(html, { waitUntil: 'load', timeout: 20_000 }).catch(async () => {
      await page.setContent(html, { waitUntil: 'domcontentloaded', timeout: 10_000 });
    });

    // Fonts must be laid out before pagination, or the page breaks land in the wrong place.
    await page
      .evaluate(() => document.fonts?.ready)
      .catch(() => undefined);
    await page.emulateMediaType('print');

    const print = (footer: string | null) =>
      page.pdf({
        format: paper.puppeteerFormat,
        printBackground: true,
        // A margin and `preferCSSPageSize` disagree about who owns the page box; the CSS
        // size wins only while there is no margin to reconcile it with.
        preferCSSPageSize: footer === null,
        margin: { top: '0', right: '0', bottom: footer === null ? '0' : FOOTER_MARGIN, left: '0' },
        displayHeaderFooter: footer !== null,
        headerTemplate: '<span></span>',
        footerTemplate: footer ?? '<span></span>',
        timeout: 30_000,
      });

    /*
     * Two passes, and only when the second one is worth paying for.
     *
     * Whether a CV needs a page footer is not knowable until it has been paginated, and
     * reserving the strip unconditionally would cost every single-page CV — the majority —
     * 11mm of the page it just fitted onto. So: lay it out with no margin, and re-render
     * only if it turned out to be long. The second render is authoritative, including its
     * page count, because reserving the footer strip can itself push content over.
     */
    const first = Buffer.from(await print(null));
    if (countPdfPages(first) <= 1) {
      return { buffer: first, pageCount: 1, bytes: first.byteLength };
    }

    // "Curriculum Vitae" happens to be the same in all three, which is why it survives as a
    // literal — but the page counter beside it does not, so the footer takes the language.
    const name = fullName(options.cv) || 'Curriculum Vitae';
    const second = Buffer.from(await print(footerTemplate(name, options.cv.language)));
    return { buffer: second, pageCount: countPdfPages(second), bytes: second.byteLength };
  } finally {
    // `disconnect` for a remote browser; `close` for one we launched.
    if (serverEnv().pdf.browserWSEndpoint) await browser.disconnect();
    else await browser.close().catch(() => undefined);
  }
}

/** Counts `/Type /Page` objects — enough to report page count without a PDF parser. */
export function countPdfPages(buffer: Buffer): number {
  const text = buffer.toString('latin1');
  const matches = text.match(/\/Type\s*\/Page[^s]/g);
  return matches ? matches.length : 1;
}

/** `amina-el-fassi-cv.pdf` — a filename a person is happy to see in their downloads. */
export function pdfFileName(cv: CVData, title: string): string {
  const name = fullName(cv) || title || 'cv';
  const slug = name
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
  return `${slug || 'cv'}-cv.pdf`;
}
