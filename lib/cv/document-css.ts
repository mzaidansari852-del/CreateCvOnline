/**
 * The stylesheet for a rendered CV document.
 *
 * Single source of truth, shared by three consumers that must agree exactly:
 *   1. the in-app live preview (injected once from the root layout),
 *   2. the `/print/[id]` route the browser prints from,
 *   3. the headless-Chromium PDF renderer, which inlines it into a standalone document.
 *
 * If these ever diverged, a PDF would stop matching what the user saw on screen — so
 * there is only one copy and everything imports it.
 */
export const CV_DOCUMENT_CSS = `
.cv-page {
  width: var(--cv-page-width, 794px);
  min-height: var(--cv-page-height, 1123px);
  background: #ffffff;
  color: #111111;
  font-family: var(--cv-font-body, 'Inter', system-ui, sans-serif);
  font-size: calc(var(--cv-font-size, 10.5) * 1px);
  line-height: var(--cv-line-height, 1.5);
  overflow-wrap: break-word;
  word-break: normal;
  position: relative;
  box-sizing: border-box;
}
.cv-page *,
.cv-page *::before,
.cv-page *::after { box-sizing: border-box; }
.cv-page h1, .cv-page h2, .cv-page h3, .cv-page h4, .cv-page h5, .cv-page h6 {
  font-family: var(--cv-font-heading, var(--cv-font-body, 'Inter', system-ui, sans-serif));
  color: inherit;
  letter-spacing: normal;
  margin: 0;
  font-size: inherit;
  font-weight: inherit;
}
.cv-page p, .cv-page ul, .cv-page ol, .cv-page li { margin: 0; padding: 0; }
.cv-page ul, .cv-page ol { list-style: none; }
.cv-page a { color: inherit; text-decoration: none; }
.cv-page img { max-width: 100%; }
.cv-block { break-inside: avoid; page-break-inside: avoid; }
.cv-allow-break { break-inside: auto; page-break-inside: auto; }
.cv-section { break-inside: auto; }
.cv-section-title { break-after: avoid; page-break-after: avoid; }
`.trim();

/**
 * Page-box rules. Only injected in the print/PDF document — in the app the preview is a
 * scaled box inside a normal page, so `@page` must not leak into the editor's own printing.
 */
export function printPageCss(size: 'A4' | 'Letter'): string {
  return `
@page { size: ${size}; margin: 0; }
html, body {
  margin: 0;
  padding: 0;
  background: #ffffff;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}
body > .cv-page { margin: 0 auto; }
`.trim();
}
