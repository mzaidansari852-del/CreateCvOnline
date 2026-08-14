/**
 * Renders a static preview image for every template.
 *
 *   npm run build && npm start &        # the script screenshots the real site
 *   npm run generate:previews
 *
 * Why static images at all, when the gallery already renders live previews?
 *
 *  1. **Google Images.** A CV builder competes for "modern cv template" in the image tab
 *     as much as the web tab, and image results need an `<img>` with an `alt` and a real
 *     file behind it. The live previews are `<div>`s of styled text: there is nothing for
 *     an image crawler to index, so the site is absent from that surface entirely.
 *  2. **Weight.** A template page ships eight full CV documents as inline DOM — roughly
 *     650KB of HTML, and the same markup again inside the RSC payload. A `<picture>` with
 *     a 40KB WebP replaces all of it.
 *  3. **Social previews.** `og:image` pointed at `/api/og`, which `robots.txt` disallows,
 *     so crawlers that respect robots could not fetch a card image.
 *
 * The screenshots are taken from the deployed markup rather than re-rendering the React
 * tree here. That keeps them honest: the picture is literally the page, so it cannot drift
 * from the layout the user gets. The cost is that the site must be running.
 *
 * Output is committed to the repository. Generation never runs on the hosting platform —
 * it needs Chromium and several minutes, neither of which belongs in a deploy.
 */
import { mkdir, writeFile, readFile, readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

import puppeteer from 'puppeteer-core';
import sharp from 'sharp';

import { withServer } from './lib/with-server.mjs';

/**
 * `--serve` starts and stops the production server itself, which is what `npm run
 * previews` uses. Without it the script expects one to already be running, so you can
 * point it at a `next dev` session while iterating on a template.
 */
const SERVE = process.argv.includes('--serve');
let BASE = process.env.PREVIEW_BASE_URL ?? 'http://localhost:3000';
const OUT = join(process.cwd(), 'public', 'previews');

/**
 * Chromium rasterises a CSS-transformed element at the device pixel ratio, so a preview
 * scaled down to 560px in the page still captures crisply at 3×. That is what lets the
 * screenshots come from the real page instead of a bespoke full-size render route.
 */
const DEVICE_SCALE = 3;

/** Card in the gallery grid, full-page detail image, and the social card. */
const SIZES = {
  card: { width: 520, suffix: '-card' },
  full: { width: 1000, suffix: '' },
};
const OG = { width: 1200, height: 630, background: '#0a0e18' };

const CHROMIUM_CANDIDATES = [
  process.env.PREVIEW_CHROMIUM_PATH,
  '/opt/pw-browsers/chromium',
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser',
  '/usr/bin/google-chrome-stable',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
].filter(Boolean);

function chromiumPath() {
  const found = CHROMIUM_CANDIDATES.find((candidate) => existsSync(candidate));
  if (!found) {
    throw new Error(
      `No Chromium found. Tried:\n  ${CHROMIUM_CANDIDATES.join('\n  ')}\n` +
        'Set PREVIEW_CHROMIUM_PATH to a Chrome or Chromium binary.',
    );
  }
  return found;
}

/**
 * Reads the slugs from the template sources rather than duplicating the list.
 *
 * The generated registry only re-exports each template's `meta`, so the slugs are not in
 * it. Scanning the sources also keeps category slugs out: `/templates/modern` is a
 * category page, and screenshotting it would capture a grid of cards rather than a CV.
 */
async function templates() {
  const root = join(process.cwd(), 'components', 'cv', 'templates');
  const files = await readdir(root, { recursive: true, withFileTypes: true });

  const slugs = [];
  for (const entry of files) {
    if (!entry.isFile() || !entry.name.endsWith('.tsx')) continue;
    const source = await readFile(join(entry.parentPath ?? entry.path, entry.name), 'utf8');
    // Quote style is not consistent across the template files — the ATS six use double
    // quotes — so accept either rather than silently skipping six templates.
    const match = /slug:\s*['"]([a-z0-9-]+)['"]/.exec(source);
    if (match) slugs.push(match[1]);
  }

  const unique = [...new Set(slugs)].sort();
  if (unique.length === 0) {
    throw new Error(`No template slugs found under ${root}.`);
  }
  return unique;
}

async function capture(page, slug) {
  const url = `${BASE}/template-preview/${slug}`;
  const response = await page.goto(url, { waitUntil: 'networkidle0', timeout: 45_000 });
  if (!response || !response.ok()) {
    throw new Error(`${url} returned ${response ? response.status() : 'no response'}`);
  }

  // Web fonts change metrics, and a screenshot taken mid-swap shows the fallback face.
  await page.evaluate(() => document.fonts.ready);

  /*
   * `/template-preview/[slug]` renders exactly one CV, at page pixels, already cropped to
   * the first sheet. There is nothing to disambiguate and no clipping arithmetic — the
   * element is the shot. That page exists for this reason: screenshotting the public
   * template page stopped working the moment it started showing these images instead of a
   * live preview, which made regeneration impossible.
   */
  const target = await page.$('[data-template-preview]');
  if (!target) {
    throw new Error(
      `no preview element on ${url} — is the /template-preview route present and built?`,
    );
  }

  const png = await target.screenshot({ type: 'png', captureBeyondViewport: true });
  return { png, meta: await metaFor(page, slug) };
}

/**
 * Reads the copy for the social card from the public template page.
 *
 * A separate visit, because the render target deliberately carries no headings or prose.
 */
async function metaFor(page, slug) {
  const previous = page.url();
  await page.goto(`${BASE}/templates/${slug}`, { waitUntil: 'domcontentloaded', timeout: 45_000 });
  const meta = await page.evaluate(() => {
    const heading = document.querySelector('h1');
    return {
      name: heading?.textContent?.trim() ?? '',
      tagline: heading?.nextElementSibling?.textContent?.trim() ?? '',
      eyebrow: heading?.previousElementSibling?.textContent?.trim() ?? '',
    };
  });
  if (previous) await page.goto(previous, { waitUntil: 'domcontentloaded' }).catch(() => undefined);
  return meta;
}

async function writeVariants(slug, png) {
  const image = sharp(png);
  const { width, height } = await image.metadata();

  for (const { width: target, suffix } of Object.values(SIZES)) {
    await sharp(png)
      .resize({ width: target, withoutEnlargement: true })
      .webp({ quality: 82, effort: 5 })
      .toFile(join(OUT, `${slug}${suffix}.webp`));
  }

  return { source: `${width}×${height}` };
}

/**
 * Composes the social card in the browser rather than with an image library.
 *
 * A 1200×630 frame is landscape and a CV is portrait, so a card that is only the document
 * leaves two dark gutters and renders the body text at about 3px in a timeline — legible
 * to nobody. Pairing the page with the template name at a size that survives a feed is
 * what makes the card do any work.
 *
 * Doing it in Chromium keeps the type consistent with the site's own headings, which an
 * SVG composite through sharp cannot: it would fall back to whatever fontconfig picks.
 */
async function renderOgCard(page, png, meta) {
  const dataUri = `data:image/png;base64,${png.toString('base64')}`;
  const escape = (value) =>
    value.replace(/[&<>]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[char] ?? char);

  await page.setViewport({ width: OG.width, height: OG.height, deviceScaleFactor: 1 });
  await page.setContent(
    `<!DOCTYPE html><html><head><meta charset="utf-8">
<link rel="stylesheet" href="${BASE}/_next/static/css/nonexistent.css" onerror="">
<style>
  @font-face { font-family: Inter; src: local('Inter'); }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    width: ${OG.width}px; height: ${OG.height}px; display: flex; align-items: center;
    gap: 56px; padding: 0 72px; background: ${OG.background};
    font-family: Inter, system-ui, sans-serif; color: #fff; overflow: hidden;
  }
  .copy { flex: 1; min-width: 0; }
  .brand { font-size: 22px; font-weight: 800; letter-spacing: -0.01em; color: #fff; }
  .brand span { color: #6b83ff; }
  .eyebrow {
    margin-top: 34px; font-size: 15px; font-weight: 700; letter-spacing: 0.14em;
    text-transform: uppercase; color: #8ea0ff;
  }
  h1 {
    margin-top: 14px; font-size: 60px; line-height: 1.05; font-weight: 800;
    letter-spacing: -0.025em; color: #fff;
  }
  p { margin-top: 20px; font-size: 22px; line-height: 1.45; color: #aab3c5; }
  .sheet {
    width: 340px; flex-shrink: 0; border-radius: 10px; overflow: hidden;
    box-shadow: 0 30px 70px rgba(0,0,0,.55); transform: rotate(-2deg);
  }
  .sheet img { display: block; width: 100%; }
</style></head><body>
  <div class="copy">
    <div class="brand">Create<span>CV</span>Online</div>
    <div class="eyebrow">${escape(meta.eyebrow || 'CV template')}</div>
    <h1>${escape(meta.name || 'CV template')}</h1>
    <p>${escape(meta.tagline || 'Free, ATS-friendly and editable online.')}</p>
  </div>
  <div class="sheet"><img src="${dataUri}" alt=""></div>
</body></html>`,
    { waitUntil: 'load' },
  );
  await page.evaluate(() => document.fonts.ready);

  const card = await page.screenshot({ type: 'jpeg', quality: 88 });
  await page.setViewport({ width: 1440, height: 1200, deviceScaleFactor: DEVICE_SCALE });
  return card;
}

async function main() {
  await mkdir(OUT, { recursive: true });

  const slugs = await templates();
  console.log(`Generating previews for ${slugs.length} templates from ${BASE}\n`);

  const browser = await puppeteer.launch({
    executablePath: chromiumPath(),
    args: ['--no-sandbox', '--disable-dev-shm-usage', '--font-render-hinting=none'],
  });

  const failures = [];
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 1200, deviceScaleFactor: DEVICE_SCALE });

    for (const [index, slug] of slugs.entries()) {
      const label = `[${String(index + 1).padStart(2, ' ')}/${slugs.length}] ${slug}`;
      try {
        const { png, meta } = await capture(page, slug);
        const { source } = await writeVariants(slug, png);
        const card = await renderOgCard(page, png, meta);
        await writeFile(join(OUT, `${slug}-og.jpg`), card);
        console.log(`${label}  ✓  ${source}`);
      } catch (error) {
        failures.push({ slug, message: error.message });
        console.log(`${label}  ✗  ${error.message}`);
      }
    }
  } finally {
    await browser.close();
  }

  const manifest = {
    generatedFrom: BASE,
    deviceScaleFactor: DEVICE_SCALE,
    slugs: slugs.filter((slug) => !failures.some((failure) => failure.slug === slug)),
  };
  await writeFile(join(OUT, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);

  /*
   * Mirror the list into a TypeScript module. The components need to know which slugs have
   * an image, and reading `public/` at render time is not an option in a static build or
   * in the browser bundle. A literal also turns a forgotten regeneration into a failing
   * test rather than a 404 in production.
   */
  const slugModule = [
    '/**',
    ' * AUTO-GENERATED — do not edit.',
    ' * Run `npm run previews` to regenerate the images and this list.',
    ' */',
    'export const PREVIEW_SLUGS: readonly string[] = [',
    ...manifest.slugs.map((slug) => `  '${slug}',`),
    '];',
    '',
  ].join('\n');
  await writeFile(join(process.cwd(), 'lib', 'cv', 'previews.ts'), slugModule);

  console.log(`\n${manifest.slugs.length} generated, ${failures.length} failed.`);
  if (failures.length > 0) {
    // A silently missing preview shows as a broken image in the gallery, so fail loudly.
    console.error('\nFailed:');
    for (const { slug, message } of failures) console.error(`  ${slug}: ${message}`);
    process.exitCode = 1;
  }
}

if (SERVE) {
  await withServer(async (baseUrl) => {
    BASE = baseUrl;
    await main();
  });
} else {
  await main();
}
