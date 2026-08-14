#!/usr/bin/env node
/**
 * SEO auditor.
 *
 *   npm run seo:check                       # against http://localhost:3000
 *   npm run seo:check -- --url https://…    # against a deployed site
 *   npm run seo:check -- --json report.json # machine-readable output
 *
 * Crawls every public URL the sitemap advertises, plus the private routes that must
 * *not* be indexed, and asserts the things a search engine and a screen reader both care
 * about. It exits non-zero on any error, so it can gate a deploy.
 *
 * This is deliberately a crawler over the real rendered HTML rather than a static
 * analysis of the source. Metadata in Next.js is assembled from a layout, a page, a
 * `generateMetadata` and sometimes a redirect — the only place the truth exists is the
 * response body.
 *
 * Start the server first:
 *
 *   npm run build && npm start
 */

import { writeFileSync } from 'node:fs';

import { withServer } from './lib/with-server.mjs';

/* -------------------------------------------------------------------------- */
/* Arguments                                                                   */
/* -------------------------------------------------------------------------- */

function arg(name, fallback) {
  const prefix = `--${name}=`;
  const inline = process.argv.find((value) => value.startsWith(prefix));
  if (inline) return inline.slice(prefix.length);
  const index = process.argv.indexOf(`--${name}`);
  if (index > -1) {
    const next = process.argv[index + 1];
    if (next && !next.startsWith('--')) return next;
  }
  return fallback;
}

/**
 * `--serve` builds nothing but starts and stops the production server itself, so the
 * command works the same on Windows as on a Unix shell. Without it, `--url` (or an already
 * running local server) is used.
 */
const SERVE = process.argv.includes('--serve');
let BASE = (arg('url', process.env.SEO_CHECK_URL || 'http://localhost:3000')).replace(/\/+$/, '');
/**
 * The origin the site believes it is served from, discovered from its own sitemap.
 *
 * Auditing a preview deployment or a non-default port is normal, and in that case the
 * crawl origin and the configured `NEXT_PUBLIC_SITE_URL` legitimately differ. Canonicals
 * are therefore compared by *path* against this origin — a canonical pointing at the
 * wrong path is a real defect; one pointing at the configured production host while you
 * crawl localhost is not.
 */
let canonicalOrigin = BASE;
const JSON_OUT = arg('json', null);
const VERBOSE = process.argv.includes('--verbose');

/* -------------------------------------------------------------------------- */
/* Rules                                                                       */
/* -------------------------------------------------------------------------- */

const TITLE_MIN = 15;
const TITLE_MAX = 75;
const DESCRIPTION_MIN = 70;
const DESCRIPTION_MAX = 200;

/** Routes that must be reachable but must never be indexed. */
const MUST_BE_NOINDEX = [
  '/login',
  '/register',
  '/forgot-password',
  '/verify-email',
  '/payment/cancel',
];

/** Routes that must redirect an anonymous visitor rather than render. */
const MUST_REDIRECT = ['/dashboard', '/dashboard/cvs', '/admin', '/admin/users'];

/* -------------------------------------------------------------------------- */
/* Tiny HTML helpers — no parser dependency for a build-gate script            */
/* -------------------------------------------------------------------------- */

function match(html, pattern) {
  const found = pattern.exec(html);
  return found?.[1]?.trim() ?? null;
}

function matchAll(html, pattern) {
  return [...html.matchAll(pattern)].map((entry) => entry[1]);
}

function decode(value) {
  if (value === null) return null;
  return value
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;|&#39;/g, "'");
}

function meta(html, name) {
  return decode(
    match(html, new RegExp(`<meta[^>]+name="${name}"[^>]+content="([^"]*)"`, 'i')) ??
      match(html, new RegExp(`<meta[^>]+content="([^"]*)"[^>]+name="${name}"`, 'i')),
  );
}

function property(html, key) {
  return decode(
    match(html, new RegExp(`<meta[^>]+property="${key}"[^>]+content="([^"]*)"`, 'i')) ??
      match(html, new RegExp(`<meta[^>]+content="([^"]*)"[^>]+property="${key}"`, 'i')),
  );
}

/* -------------------------------------------------------------------------- */
/* Findings                                                                    */
/* -------------------------------------------------------------------------- */

const findings = [];
let checked = 0;

function fail(path, rule, detail) {
  findings.push({ level: 'error', path, rule, detail });
}
function warn(path, rule, detail) {
  findings.push({ level: 'warning', path, rule, detail });
}

/* -------------------------------------------------------------------------- */
/* Audit                                                                       */
/* -------------------------------------------------------------------------- */

const seenTitles = new Map();
const seenDescriptions = new Map();
const seenCanonicals = new Map();

async function auditPage(path) {
  let response;
  try {
    response = await fetch(`${BASE}${path}`, { redirect: 'manual' });
  } catch (error) {
    fail(path, 'unreachable', error instanceof Error ? error.message : String(error));
    return;
  }

  if (response.status >= 300 && response.status < 400) {
    fail(path, 'status', `unexpected ${response.status} redirect to ${response.headers.get('location')}`);
    return;
  }
  if (response.status !== 200) {
    fail(path, 'status', `expected 200, got ${response.status}`);
    return;
  }

  const html = await response.text();
  checked += 1;

  /* --- title ------------------------------------------------------------- */
  const title = decode(match(html, /<title>([\s\S]*?)<\/title>/i));
  if (!title) {
    fail(path, 'title', 'missing');
  } else {
    if (title.length < TITLE_MIN) fail(path, 'title', `too short (${title.length}): "${title}"`);
    if (title.length > TITLE_MAX) warn(path, 'title', `${title.length} chars may truncate in results`);
    const brandCount = title.split('CreateCVOnline').length - 1;
    if (brandCount > 1) fail(path, 'title', `brand repeated ${brandCount}× : "${title}"`);
    const previous = seenTitles.get(title);
    if (previous) fail(path, 'title', `duplicate of ${previous}`);
    else seenTitles.set(title, path);
  }

  /* --- description ------------------------------------------------------- */
  const indexable = !MUST_BE_NOINDEX.includes(path);
  const description = meta(html, 'description');
  if (!description) {
    fail(path, 'description', 'missing');
  } else if (indexable) {
    // Length and uniqueness only matter for a page that can appear in results.
    if (description.length < DESCRIPTION_MIN)
      fail(path, 'description', `too short (${description.length})`);
    if (description.length > DESCRIPTION_MAX)
      warn(path, 'description', `${description.length} chars will truncate`);
    const previous = seenDescriptions.get(description);
    if (previous) fail(path, 'description', `duplicate of ${previous}`);
    else seenDescriptions.set(description, path);
  }

  /* --- canonical --------------------------------------------------------- */
  const canonical = decode(match(html, /<link[^>]+rel="canonical"[^>]+href="([^"]*)"/i));
  if (!canonical) {
    // A noindex page should not declare one; an indexable page must.
    if (!MUST_BE_NOINDEX.includes(path)) fail(path, 'canonical', 'missing');
  } else if (MUST_BE_NOINDEX.includes(path)) {
    fail(path, 'canonical', `noindex page declares a canonical (${canonical})`);
  } else {
    if (!/^https?:\/\//.test(canonical)) fail(path, 'canonical', `not absolute: ${canonical}`);
    if (canonical !== canonical.toLowerCase().replace(/%[0-9a-f]{2}/gi, (m) => m.toUpperCase()))
      warn(path, 'canonical', `mixed case: ${canonical}`);
    if (canonical.endsWith('/') && canonical !== `${BASE}/`)
      warn(path, 'canonical', `trailing slash: ${canonical}`);

    const expected = `${canonicalOrigin}${path === '/' ? '' : path}`;
    if (canonical !== expected) {
      fail(path, 'canonical', `should self-reference ${expected}, got ${canonical}`);
    }
    const previous = seenCanonicals.get(canonical);
    if (previous) fail(path, 'canonical', `duplicate canonical, also on ${previous}`);
    else seenCanonicals.set(canonical, path);
  }

  /* --- robots ------------------------------------------------------------ */
  const robots = meta(html, 'robots') ?? '';
  const shouldBeNoindex = !indexable;
  const isNoindex = /noindex/i.test(robots);

  if (shouldBeNoindex && !isNoindex) {
    fail(path, 'robots', 'must be noindex but is indexable');
  }
  if (!shouldBeNoindex && isNoindex) {
    fail(path, 'robots', `unexpectedly noindex ("${robots}")`);
  }

  /* --- headings ---------------------------------------------------------- */
  const h1s = matchAll(html, /<h1[^>]*>([\s\S]*?)<\/h1>/gi);
  if (h1s.length === 0) fail(path, 'h1', 'no h1 on the page');
  if (h1s.length > 1) fail(path, 'h1', `${h1s.length} h1 elements (expected exactly 1)`);

  const h2Count = (html.match(/<h2[\s>]/gi) ?? []).length;
  if (h2Count === 0 && !shouldBeNoindex) warn(path, 'headings', 'no h2 — page may be thin');

  /* --- Open Graph and Twitter -------------------------------------------- */
  if (!shouldBeNoindex) {
    for (const key of ['og:title', 'og:description', 'og:url', 'og:image', 'og:type']) {
      if (!property(html, key)) fail(path, 'open-graph', `missing ${key}`);
    }
    if (!meta(html, 'twitter:card')) fail(path, 'twitter', 'missing twitter:card');
  }

  /* --- structured data --------------------------------------------------- */
  const blocks = matchAll(
    html,
    /<script[^>]+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi,
  );
  if (blocks.length === 0 && !shouldBeNoindex) {
    warn(path, 'json-ld', 'no structured data');
  }
  for (const [index, block] of blocks.entries()) {
    try {
      const parsed = JSON.parse(block.replace(/\\u003c/g, '<'));
      const nodes = parsed['@graph'] ?? [parsed];
      for (const node of nodes) {
        if (!node['@type']) fail(path, 'json-ld', `block ${index} has a node with no @type`);
      }
    } catch (error) {
      fail(path, 'json-ld', `block ${index} is not valid JSON: ${String(error)}`);
    }
  }

  /* --- images ------------------------------------------------------------ */
  for (const tag of html.match(/<img\b[^>]*>/gi) ?? []) {
    if (!/\balt\s*=/.test(tag)) {
      fail(path, 'image-alt', `<img> without an alt attribute: ${tag.slice(0, 90)}`);
    }
  }

  /* --- language and viewport --------------------------------------------- */
  if (!/<html[^>]+lang="/i.test(html)) fail(path, 'lang', 'no lang attribute on <html>');
  if (!meta(html, 'viewport')) fail(path, 'viewport', 'no viewport meta');

  /* --- internal links ---------------------------------------------------- */
  const links = matchAll(html, /<a\b[^>]+href="(\/[^"#?]*)"/gi);
  const internal = [...new Set(links)].filter((href) => !href.startsWith('//'));
  if (internal.length < 3 && !shouldBeNoindex) {
    warn(path, 'internal-links', `only ${internal.length} internal links — likely orphaned`);
  }

  return internal;
}

/* -------------------------------------------------------------------------- */
/* Run                                                                         */
/* -------------------------------------------------------------------------- */

async function readSitemap() {
  const response = await fetch(`${BASE}/sitemap.xml`);
  if (!response.ok) throw new Error(`sitemap.xml returned ${response.status}`);
  const xml = await response.text();
  const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((entry) => entry[1]);
  if (urls.length === 0) throw new Error('sitemap.xml contains no <loc> entries');
  return urls;
}

async function checkRobots() {
  const response = await fetch(`${BASE}/robots.txt`);
  if (!response.ok) {
    fail('/robots.txt', 'status', `returned ${response.status}`);
    return;
  }
  const text = await response.text();
  if (!/^User-Agent:/im.test(text)) fail('/robots.txt', 'format', 'no User-Agent directive');
  if (!/^Sitemap:/im.test(text)) fail('/robots.txt', 'format', 'no Sitemap reference');

  for (const blocked of ['/dashboard/', '/admin/', '/api/']) {
    if (!text.includes(`Disallow: ${blocked}`)) {
      fail('/robots.txt', 'privacy', `${blocked} is not disallowed`);
    }
  }
  // Blocking these would stop Google rendering the page at all.
  for (const critical of ['/_next/static', '.css', '.js']) {
    if (text.includes(`Disallow: ${critical}`)) {
      fail('/robots.txt', 'rendering', `blocks ${critical}, which Google needs to render pages`);
    }
  }
}

async function checkPrivateRedirects() {
  for (const path of MUST_REDIRECT) {
    const response = await fetch(`${BASE}${path}`, { redirect: 'manual' });
    if (response.status < 300 || response.status >= 400) {
      fail(path, 'auth', `expected a redirect for an anonymous visitor, got ${response.status}`);
      continue;
    }
    const location = response.headers.get('location') ?? '';
    if (!location.includes('/login')) {
      fail(path, 'auth', `redirects to ${location} rather than /login`);
    }
  }
}

async function main() {
  console.log(`\nSEO check → ${BASE}\n`);

  await checkRobots();
  await checkPrivateRedirects();

  const sitemapUrls = await readSitemap();
  const paths = sitemapUrls
    .map((url) => {
      try {
        return new URL(url).pathname + (new URL(url).search || '');
      } catch {
        fail(url, 'sitemap', 'not a valid URL');
        return null;
      }
    })
    .filter(Boolean);

  console.log(`  sitemap advertises ${paths.length} URLs`);

  // Confirm the sitemap's own host matches the site being audited — the classic
  // "deployed with localhost in NEXT_PUBLIC_SITE_URL" mistake.
  const firstUrl = sitemapUrls[0];
  if (firstUrl) {
    canonicalOrigin = new URL(firstUrl).origin;
    if (canonicalOrigin !== BASE) {
      console.log(
        `  note: the site is configured as ${canonicalOrigin}; canonicals are checked ` +
          `by path against that origin, not the crawl origin.`,
      );
    }
    if (!/^https:/.test(canonicalOrigin) && !/localhost|127\.0\.0\.1/.test(canonicalOrigin)) {
      fail('/sitemap.xml', 'https', `sitemap advertises a non-HTTPS origin: ${canonicalOrigin}`);
    }
  }
  // Every sitemap URL must share one origin — a mixed sitemap is a configuration error.
  for (const url of sitemapUrls) {
    if (!url.startsWith(canonicalOrigin)) {
      fail('/sitemap.xml', 'host', `mixed origins: ${url} is not under ${canonicalOrigin}`);
      break;
    }
  }

  for (const path of paths) {
    if (VERBOSE) console.log(`  · ${path}`);
    await auditPage(path);
  }

  for (const path of MUST_BE_NOINDEX) {
    if (VERBOSE) console.log(`  · ${path} (noindex expected)`);
    await auditPage(path);
  }

  // The sitemap must not advertise anything private.
  for (const path of paths) {
    if (/^\/(dashboard|admin|account|login|register|api|print|cv\/)/.test(path)) {
      fail(path, 'sitemap', 'private path listed in the sitemap');
    }
  }

  /* --- report ------------------------------------------------------------ */

  const errors = findings.filter((finding) => finding.level === 'error');
  const warnings = findings.filter((finding) => finding.level === 'warning');

  console.log(`\n  pages audited : ${checked}`);
  console.log(`  errors        : ${errors.length}`);
  console.log(`  warnings      : ${warnings.length}\n`);

  const byRule = new Map();
  for (const finding of findings) {
    const key = `${finding.level}:${finding.rule}`;
    byRule.set(key, [...(byRule.get(key) ?? []), finding]);
  }

  for (const [key, group] of [...byRule.entries()].sort()) {
    const [level, rule] = key.split(':');
    console.log(`${level === 'error' ? '✗' : '⚠'} ${rule} (${group.length})`);
    for (const finding of group.slice(0, 8)) {
      console.log(`    ${finding.path} — ${finding.detail}`);
    }
    if (group.length > 8) console.log(`    …and ${group.length - 8} more`);
  }

  if (JSON_OUT) {
    writeFileSync(JSON_OUT, JSON.stringify({ base: BASE, checked, findings }, null, 2));
    console.log(`\nreport written to ${JSON_OUT}`);
  }

  if (errors.length > 0) {
    console.log(`\n✗ SEO check failed with ${errors.length} error(s).\n`);
    process.exit(1);
  }

  console.log(`✓ SEO check passed${warnings.length ? ` (${warnings.length} warning(s))` : ''}.\n`);
}

const run = SERVE
  ? () =>
      withServer(async (baseUrl) => {
        BASE = baseUrl;
        canonicalOrigin = BASE;
        await main();
      })
  : main;

run().catch((error) => {
  console.error('\n✗ SEO check could not run:', error instanceof Error ? error.message : error);
  console.error('  Is the server running?  npm run build && npm start\n');
  process.exit(1);
});
