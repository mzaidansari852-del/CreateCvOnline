#!/usr/bin/env node
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

/*
 * Why this exists
 *
 * "The checkout still says Continue with PayPal" has at least five different causes, and
 * they are indistinguishable from the page itself — it falls back silently on purpose,
 * because a customer must never be shown a payment button that cannot work. That is right
 * for the payer and useless for whoever is configuring the deployment.
 *
 * This checks each layer in the order they have to be true, and stops being polite about
 * which one failed. It reads `.env.local` directly rather than through the app, so it works
 * without a build and without Next.js.
 */

const root = process.cwd();
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

// The checkout page has to actually offer the choice.
const checkoutPath = join(root, 'app/payment/checkout/page.tsx');
if (existsSync(checkoutPath)) {
  const checkout = readFileSync(checkoutPath, 'utf8');
  if (checkout.includes('availableGateways')) ok('the checkout page knows about both gateways');
  else
    bad(
      'app/payment/checkout/page.tsx is the old PayPal-only version',
      'That file was not replaced. Extract the zip again with Replace.',
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
console.log(`  (reading ${files.length ? files.join(' and ') : 'no .env file — process env only'})`);

const mask = (v) => (v.length <= 8 ? '*'.repeat(v.length) : `${v.slice(0, 6)}…${v.slice(-3)}`);

const vars = [
  { key: 'PADDLE_API_KEY', required: true, expect: /^pdl_/, hint: 'should start with pdl_' },
  { key: 'PADDLE_PRICE_PRO', required: true, expect: /^pri_/, hint: 'should start with pri_' },
  { key: 'PADDLE_PRICE_LIFETIME', required: true, expect: /^pri_/, hint: 'should start with pri_' },
  {
    key: 'NEXT_PUBLIC_PADDLE_CLIENT_TOKEN',
    required: true,
    expect: /^(test_|live_)/,
    hint: 'should start with test_ (sandbox) or live_',
  },
  { key: 'PADDLE_WEBHOOK_SECRET', required: false, expect: /^pdl_/, hint: 'should start with pdl_' },
  { key: 'PADDLE_ENVIRONMENT', required: false, expect: /^(sandbox|production)$/, hint: '' },
  { key: 'NEXT_PUBLIC_PADDLE_ENVIRONMENT', required: false, expect: /^(sandbox|production)$/, hint: '' },
];

for (const { key, required: isRequired, expect, hint } of vars) {
  const value = env(key);
  if (!value) {
    if (isRequired) bad(`${key} is not set`, `Add ${key} to .env.local (and to Vercel).`);
    else console.log(`  --    ${key} not set (optional)`);
    continue;
  }
  if (expect && !expect.test(value)) {
    bad(`${key} = ${mask(value)} — ${hint}`, `Check the value of ${key}.`);
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
