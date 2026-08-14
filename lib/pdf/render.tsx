import 'server-only';

import type { Browser, LaunchOptions } from 'puppeteer-core';

import { CVDocument, documentPageBackground } from '@/components/cv/CVDocument';
import { CV_DOCUMENT_CSS, printPageCss } from '@/lib/cv/document-css';
import { googleFontsHref, PAPER } from '@/lib/cv/format';
import { fullName } from '@/lib/cv/format';
import { serverEnv } from '@/lib/env';
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
}: RenderOptions): Promise<string> {
  const { renderToStaticMarkup } = await import('react-dom/server');
  const markup = renderToStaticMarkup(<CVDocument cv={cv} customization={customization} />);
  const paper = PAPER[customization.paperSize];
  const fontsHref = googleFontsHref([customization.bodyFont, customization.headingFont]);
  const background = documentPageBackground(customization, cv);
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

    const data = await page.pdf({
      format: paper.puppeteerFormat,
      printBackground: true,
      preferCSSPageSize: true,
      margin: { top: '0', right: '0', bottom: '0', left: '0' },
      timeout: 30_000,
    });

    const buffer = Buffer.from(data);
    return { buffer, pageCount: countPdfPages(buffer), bytes: buffer.byteLength };
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
