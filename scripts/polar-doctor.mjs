#!/usr/bin/env node
/**
 * Checks a deployed site's Polar configuration from the outside.
 *
 * The successor to `paddle-doctor.mjs`, and shorter than it, because Polar's redirect
 * checkout removes most of what that script had to probe: there is no client token to
 * compare, no payment script to confirm loads, and no default payment link page to check
 * for a 404.
 *
 * What it cannot do is tell you whether a *sandbox* token has been deployed to production.
 * Polar's tokens use the same prefix in both environments, so no external check can see the
 * difference. The probe is the closest thing: a token pointed at the wrong environment
 * cannot see the other environment's products, so it fails where the booleans look green.
 *
 *   node scripts/polar-doctor.mjs https://createcvonline.com
 *   npm run polar:doctor -- https://createcvonline.com
 */

const UA = { 'user-agent': 'polar-doctor/1.0' };

const base = (process.argv[2] ?? process.env.NEXT_PUBLIC_SITE_URL ?? '')
  .trim()
  .replace(/\/+$/, '');

if (!base) {
  console.error('Usage: node scripts/polar-doctor.mjs https://your-domain.com');
  process.exit(2);
}

let failures = 0;

function pass(message) {
  console.log(`  ok    ${message}`);
}

function fail(message) {
  failures += 1;
  console.log(`  FAIL  ${message}`);
}

function warn(message) {
  console.log(`  warn  ${message}`);
}

console.log(`\nChecking ${base}\n`);

/* -------------------------------------------------------------------------- */

let status;
try {
  const response = await fetch(`${base}/api/payments/polar/status`, { headers: UA });
  if (!response.ok) {
    fail(`/api/payments/polar/status responded ${response.status}. Is the site deployed?`);
    process.exit(1);
  }
  status = await response.json();
} catch (cause) {
  fail(`Could not reach ${base} — ${cause instanceof Error ? cause.message : cause}`);
  process.exit(1);
}

const polar = status.polar ?? {};

console.log('Configuration');

if (polar.configured) pass('the gateway is configured and checkout is offered');
else fail('the gateway is NOT configured — the pricing page cannot take money');

if (polar.accessToken) pass('POLAR_ACCESS_TOKEN is present');
else fail('POLAR_ACCESS_TOKEN is missing from the running build');

if (polar.accessTokenShape?.usable) {
  pass(`the access token looks like a ${polar.accessTokenShape.kind} token`);
} else if (polar.accessToken) {
  fail(polar.accessTokenShape?.explanation ?? 'the access token is not usable');
}

if (polar.accessTokenShape?.kind === 'personal') {
  warn('this is a personal token — it dies when that user rotates it or leaves');
}

if (polar.productPro) pass('POLAR_PRODUCT_PRO is present');
else fail('POLAR_PRODUCT_PRO is missing');

if (polar.productLifetime) pass('POLAR_PRODUCT_LIFETIME is present');
else fail('POLAR_PRODUCT_LIFETIME is missing');

for (const problem of polar.productIdShape?.problems ?? []) fail(problem);

if (polar.webhookSecret) {
  pass('POLAR_WEBHOOK_SECRET is present');
} else {
  fail(
    'POLAR_WEBHOOK_SECRET is missing — the webhook rejects every event with 403, so a plan ' +
      'is granted only if the customer’s browser finishes the verify step',
  );
}

/* -------------------------------------------------------------------------- */

console.log('\nEnvironment');

console.log(`  note  POLAR_ENVIRONMENT says "${polar.environment ?? 'unset'}"`);
warn(
  'that is a declaration, not a verified fact: Polar tokens carry no environment marker, ' +
    'so nothing here can prove a sandbox token was not deployed to production',
);

/* -------------------------------------------------------------------------- */

console.log('\nProducts (probe)');

if (!polar.configured) {
  warn('skipped — the gateway is not configured');
} else {
  try {
    const response = await fetch(`${base}/api/payments/polar/status?probe=1`, { headers: UA });
    const probed = await response.json();
    const products = probed.probe?.products ?? [];

    if (products.length === 0) {
      warn('the probe returned no products');
    }

    for (const product of products) {
      if (product.ok) {
        pass(`${product.label} → "${product.name}"${product.archived ? ' (ARCHIVED)' : ''}`);
        if (product.archived) {
          fail(`the ${product.label} product is archived in Polar and cannot be bought`);
        }
      } else {
        fail(`${product.label} → ${product.error}`);
      }
    }
  } catch (cause) {
    fail(`the probe failed — ${cause instanceof Error ? cause.message : cause}`);
  }
}

/* -------------------------------------------------------------------------- */

console.log('\nWebhook endpoint');

try {
  /*
   * An unsigned POST must be rejected. A 403 is the healthy answer: it proves the route is
   * deployed, reachable, and refusing anything it cannot verify. A 200 here would mean the
   * endpoint grants plans to strangers.
   */
  const response = await fetch(`${base}/api/payments/polar/webhook`, {
    method: 'POST',
    headers: { ...UA, 'content-type': 'application/json' },
    body: '{}',
  });

  if (response.status === 403) {
    pass('an unsigned webhook is rejected with 403');
  } else if (response.status === 503) {
    fail('the webhook answers 503 — the gateway is not configured on this deployment');
  } else if (response.status === 200) {
    fail('an unsigned webhook was ACCEPTED. Investigate immediately.');
  } else {
    warn(`an unsigned webhook answered ${response.status}; expected 403`);
  }
} catch (cause) {
  fail(`could not reach the webhook — ${cause instanceof Error ? cause.message : cause}`);
}

/* -------------------------------------------------------------------------- */

console.log(
  failures === 0
    ? '\nNo problems found.\n'
    : `\n${failures} problem${failures === 1 ? '' : 's'} found. See docs/POLAR_SETUP.md.\n`,
);

process.exit(failures === 0 ? 0 : 1);
