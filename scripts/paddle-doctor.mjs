#!/usr/bin/env node
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

/*
 * Why this exists
 *
 * "The checkout says payments are unavailable" has at least five different causes, and
 * they are indistinguishable from the page itself — it falls back silently on purpose,
 * because a customer must never be shown a payment button that cannot work. That is right
 * for the payer and useless for whoever is configuring the deployment.
 *
 * This checks each layer in the order they have to be true, and stops being polite about
 * which one failed. It reads `.env.local` directly rather than through the app, so it works
 * without a build and without Next.js.
 */

const root = process.cwd();

/*
 * `--remote https://your-site` checks the *deployed* build instead of this folder.
 *
 * This exists because the local checks cannot answer the question that actually matters
 * once a site is live: the hosting dashboard shows the variable is set, and the running
 * JavaScript was compiled before it was. NEXT_PUBLIC_* is inlined at build time, so the
 * only honest test is to read the bundle the browser is being served and look for the
 * token in it. Nothing secret is exposed by doing so — the client token is public by
 * design, which is exactly why it can be checked this way.
 */
const remoteArg = process.argv.indexOf('--remote');
const remote = remoteArg > -1 ? process.argv[remoteArg + 1] : null;

if (remote) {
  const base = remote.replace(/\/$/, '');
  console.log(`\nChecking the deployed build at ${base}\n`);

  /*
   * A browser user-agent, because hosts and WAFs answer 403 to an unidentified client and
   * that would read here as "the route is missing" — a wrong diagnosis is worse than none.
   */
  const UA = {
    'user-agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
    accept: 'text/html,application/xhtml+xml',
  };

  const page = await fetch(`${base}/pay`, { redirect: 'follow', headers: UA });
  console.log(`  /pay responded ${page.status}`);
  if (!page.ok) {
    console.log(
      page.status === 404
        ? '  FAIL  /pay is not deployed yet — push and deploy the Paddle changes first.'
        : `  FAIL  the page returned ${page.status}. If that is 401/403 the site is behind`,
    );
    if (page.status !== 404) {
      console.log('        password protection or a firewall — run this from a network that');
      console.log('        can reach it, or check the deployment protection setting.');
    }
    process.exit(1);
  }

  const html = await page.text();
  const chunks = [...html.matchAll(/src="([^"]*\/_next\/static\/[^"]+\.js)"/g)].map((m) => m[1]);
  console.log(`  found ${chunks.length} script chunk(s)`);

  // Paddle client tokens are `test_…` (sandbox) or `live_…`, hex-ish and long.
  const TOKEN = /\b(test|live)_[a-f0-9]{20,}\b/i;
  let token = null;
  for (const chunk of chunks) {
    const url = chunk.startsWith('http') ? chunk : `${base}${chunk}`;
    const body = await fetch(url, { headers: UA }).then((r) => (r.ok ? r.text() : ''));
    const hit = TOKEN.exec(body);
    if (hit) {
      token = hit[0];
      break;
    }
  }

  console.log('');
  if (token) {
    const kind = token.startsWith('test') ? 'sandbox' : 'live';
    console.log(`  ok    a ${kind} Paddle client token IS in the deployed bundle`);
    console.log(`        (${token.slice(0, 9)}…${token.slice(-4)})`);
    console.log('');
    console.log('  So the token is not the problem. Open /pay?_ptxn=<a real transaction id>');
    console.log("  and read the browser console — the failure is on Paddle's side:");
    console.log('    · the domain is not approved for Paddle.js in your Paddle account');
    console.log('    · or the token is from a different account than the API key');
    process.exit(0);
  }

  console.log('  FAIL  no Paddle client token found in the deployed JavaScript.');
  console.log('');
  console.log('  The variable is set in your dashboard but this build was compiled without it.');
  console.log('  NEXT_PUBLIC_* is baked in at build time. Redeploy with the build cache OFF:');
  console.log('    Vercel → Deployments → ⋯ → Redeploy → untick "Use existing Build Cache"');
  process.exit(1);
}
const problems = [];
const ok = (m) => console.log(`  ok    ${m}`);
const bad = (m, fix) => {
  console.log(`  FAIL  ${m}`);
  problems.push({ m, fix });
};

/* ---------------------------------------------------------------- 1. the code */

console.log('\n1. Is the Paddle code present?');

const required = [
  'lib/payments/paddle.ts',
  'app/api/payments/paddle/create-transaction/route.ts',
  'app/api/payments/paddle/verify/route.ts',
  'app/api/payments/paddle/webhook/route.ts',
  'components/payments/PaddleCheckoutButton.tsx',
  'components/payments/CheckoutMethodChoice.tsx',
];
const missing = required.filter((f) => !existsSync(join(root, f)));
if (missing.length) {
  bad(
    `${missing.length} of ${required.length} Paddle files are missing (e.g. ${missing[0]})`,
    'The Paddle changes were never copied into this project. Extract the zip again and choose Replace, not Skip.',
  );
} else {
  ok('all six Paddle source files are here');
}

// The checkout page has to ask the server what it may offer, rather than assuming.
const checkoutPath = join(root, 'app/payment/checkout/page.tsx');
if (existsSync(checkoutPath)) {
  const checkout = readFileSync(checkoutPath, 'utf8');
  if (checkout.includes('availableGateways'))
    ok('the checkout page asks the server whether a gateway is configured');
  else
    bad(
      'app/payment/checkout/page.tsx does not consult availableGateways()',
      'Without that check the page renders a pay button on a deployment that has no ' +
        'credentials, and the customer meets a 503 after deciding to buy.',
    );
}

/* -------------------------------------------------------- 2. the dependencies */

console.log('\n2. Are the Paddle packages installed?');
for (const pkg of ['@paddle/paddle-node-sdk', '@paddle/paddle-js']) {
  if (existsSync(join(root, 'node_modules', pkg))) ok(`${pkg} installed`);
  else bad(`${pkg} is not installed`, 'Run: npm install');
}

/* ------------------------------------------------------------ 3. the env vars */

console.log('\n3. Are the environment variables set?');

/** Reads a .env file well enough for this check: KEY=value, quotes stripped, # ignored. */
function readEnvFile(name) {
  const path = join(root, name);
  if (!existsSync(path)) return {};
  const out = {};
  for (const line of readFileSync(path, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq < 1) continue;
    out[trimmed.slice(0, eq).trim()] = trimmed
      .slice(eq + 1)
      .trim()
      .replace(/^['"]|['"]$/g, '');
  }
  return out;
}

const fromFiles = { ...readEnvFile('.env'), ...readEnvFile('.env.local') };
const env = (key) => process.env[key] || fromFiles[key] || '';
const files = ['.env', '.env.local'].filter((f) => existsSync(join(root, f)));
console.log(
  `  (reading ${files.length ? files.join(' and ') : 'no .env file — process env only'})`,
);

const mask = (v) => (v.length <= 8 ? '*'.repeat(v.length) : `${v.slice(0, 6)}…${v.slice(-3)}`);

const vars = [
  {
    key: 'PADDLE_API_KEY',
    required: true,
    /*
     * Paddle's documented format, not just the prefix. A key that starts `pdl_` and is
     * four characters short passes a prefix check and is rejected by Paddle with
     * "Authentication header included, but incorrectly formatted" — which reads, from the
     * outside, exactly like a key that was never set. 69 characters, five underscores.
     */
    expect: /^pdl_(live|sdbx)_apikey_[a-z\d]{26}_[a-zA-Z\d]{22}_[a-zA-Z\d]{3}$/,
    hint: 'should be 69 characters: pdl_sdbx_apikey_… (sandbox) or pdl_live_apikey_… (live)',
  },
  { key: 'PADDLE_PRICE_PRO', required: true, expect: /^pri_/, hint: 'should start with pri_' },
  { key: 'PADDLE_PRICE_LIFETIME', required: true, expect: /^pri_/, hint: 'should start with pri_' },
  {
    key: 'NEXT_PUBLIC_PADDLE_CLIENT_TOKEN',
    required: true,
    expect: /^(test_|live_)/,
    hint: 'should start with test_ (sandbox) or live_',
  },
  {
    key: 'PADDLE_WEBHOOK_SECRET',
    required: false,
    expect: /^pdl_/,
    hint: 'should start with pdl_',
  },
  { key: 'PADDLE_ENVIRONMENT', required: false, expect: /^(sandbox|production)$/, hint: '' },
  {
    key: 'NEXT_PUBLIC_PADDLE_ENVIRONMENT',
    required: false,
    expect: /^(sandbox|production)$/,
    hint: '',
  },
];

for (const { key, required: isRequired, expect, hint } of vars) {
  const value = env(key);
  if (!value) {
    if (isRequired) bad(`${key} is not set`, `Add ${key} to .env.local (and to Vercel).`);
    else console.log(`  --    ${key} not set (optional)`);
    continue;
  }
  if (expect && !expect.test(value)) {
    // The length is what identifies a truncated paste, and it is the one detail a masked
    // value hides. It reveals nothing: it is a property of the format, not of the secret.
    bad(`${key} = ${mask(value)} (${value.length} chars) — ${hint}`, `Check the value of ${key}.`);
  } else {
    ok(`${key} = ${mask(value)}`);
  }
}

/* ------------------------------------------------ 4. the mistake that matters */

console.log('\n4. Is anything dangerous or swapped?');

const apiKey = env('PADDLE_API_KEY');
const clientToken = env('NEXT_PUBLIC_PADDLE_CLIENT_TOKEN');

if (clientToken.startsWith('pdl_')) {
  bad(
    'NEXT_PUBLIC_PADDLE_CLIENT_TOKEN holds what looks like an API KEY',
    'This publishes a secret key to every browser. Rotate that key in Paddle NOW, then put the client-side token here instead.',
  );
} else if (clientToken) {
  ok('the client token is not an API key');
}

if (apiKey && apiKey === clientToken) {
  bad('the API key and the client token are the same value', 'They are two different credentials.');
}
if (apiKey.startsWith('test_') || apiKey.startsWith('live_')) {
  bad(
    'PADDLE_API_KEY holds what looks like a CLIENT TOKEN',
    'The two are swapped. The API key starts pdl_.',
  );
}
if (env('PADDLE_PRICE_PRO') && env('PADDLE_PRICE_PRO') === env('PADDLE_PRICE_LIFETIME')) {
  bad(
    'PADDLE_PRICE_PRO and PADDLE_PRICE_LIFETIME are the same id',
    'One plan would charge the other plan’s price.',
  );
}

/* --------------------------------------------------- 5. did the build see it? */

console.log('\n5. Did the build bake in the client token?');

const staticDir = join(root, '.next', 'static');
if (!existsSync(staticDir)) {
  console.log('  --    no .next build yet — run: npm run build');
} else if (!clientToken) {
  console.log('  --    skipped, no client token set');
} else {
  /*
   * The trap this whole section exists for. NEXT_PUBLIC_* variables are inlined into the
   * JavaScript bundle when it is built, not read at run time — so setting the token and
   * restarting changes nothing, and setting it in a hosting dashboard after a deploy
   * changes nothing until the next deploy.
   */
  const { execSync } = await import('node:child_process');
  let found = '';
  try {
    found = execSync(
      `grep -rl ${JSON.stringify(clientToken)} ${JSON.stringify(staticDir)} 2>/dev/null | head -1`,
      { encoding: 'utf8' },
    ).trim();
  } catch {
    found = '';
  }
  if (found) ok('the current client token is present in the built bundle');
  else
    bad(
      'the client token is NOT in the built bundle',
      'NEXT_PUBLIC_* is baked in at build time. Run npm run build again (or redeploy).',
    );
}

/* ----------------------------------------------------------------- the verdict */

console.log('\n' + '─'.repeat(70));
if (problems.length === 0) {
  console.log('Everything checks out. The checkout page should offer Paddle by default.');
  console.log('If it still does not, the running server is serving an older build —');
  console.log('stop it, run `npm run build`, then `npm start`.');
} else {
  console.log(`${problems.length} problem(s) found. Fix in this order:\n`);
  problems.forEach((p, i) => {
    console.log(`  ${i + 1}. ${p.m}`);
    console.log(`     → ${p.fix}\n`);
  });
}
console.log('─'.repeat(70) + '\n');
process.exit(problems.length ? 1 : 0);
