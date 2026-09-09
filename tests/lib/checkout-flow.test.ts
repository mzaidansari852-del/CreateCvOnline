import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import { PLANS, PLAN_ORDER } from '@/lib/plans';

/**
 * Guards the wiring between "user wants to pay" and "a transaction exists at the gateway".
 *
 * The original build shipped a complete payment backend — order creation, server-side
 * amount verification, webhook, fulfilment, admin ledger — and no button that called any
 * of it. Every purchase CTA pointed at `/pricing`, and `/pricing` pointed at `/register`,
 * so the create-order route had no caller in the entire application.
 *
 * Type-checking cannot catch a route nobody fetches, and the SEO crawler only walks
 * public pages, so nothing failed. These tests assert the chain exists end to end.
 */

const read = (path: string) => readFileSync(join(process.cwd(), path), 'utf8');

const checkoutButton = read('components/payments/PolarCheckoutButton.tsx');
const checkoutPage = read('app/payment/checkout/page.tsx');
const pricingCards = read('components/marketing/PricingCards.tsx');
const upgradeCard = read('components/dashboard/UpgradeCard.tsx');
const accountPage = read('app/dashboard/account/page.tsx');

describe('checkout flow', () => {
  it('has a client component that calls the create-checkout endpoint', () => {
    expect(checkoutButton).toContain("'use client'");
    expect(checkoutButton).toContain('/api/payments/polar/create-checkout');
  });

  it('sends only a plan id to the server, never a price', () => {
    /*
     * The whole anti-tampering design rests on this: the browser names a plan, the server
     * prices it. A body carrying an amount would undo that in one line.
     *
     * Every request body in the file is checked, not just the first, so a second call
     * added later cannot grow a price field unnoticed.
     */
    const bodies = [...checkoutButton.matchAll(/body:\s*JSON\.stringify\(\{([^}]*)\}\)/g)].map(
      (match) => match[1] ?? '',
    );
    expect(bodies.length).toBeGreaterThan(0);
    expect(bodies.some((body) => body.includes('planId'))).toBe(true);
    for (const body of bodies) expect(body).not.toMatch(/amount|price|value|currency/i);
  });

  /*
   * The customer is sent to a URL the *server* returned, never to one this file builds.
   *
   * Under Paddle the equivalent guard was "open the overlay against a transaction id, not
   * against a price". The redirect model moves the risk rather than removing it: a button
   * that assembled a Polar checkout URL out of a product id and an amount would put both
   * the thing being sold and its price back in the browser's hands. So the file must carry
   * no Polar URL of its own, and must navigate to the response field.
   */
  it('navigates to a server-supplied URL rather than one it builds itself', () => {
    expect(checkoutButton).toMatch(/window\.location\.assign\(\s*payload\.url\s*\)/);
    expect(checkoutButton).not.toMatch(/polar\.sh|buy\.polar|checkout\.polar/i);
  });

  /*
   * A second click must not open a second checkout. `location.assign` does not stop React,
   * so without a latch an impatient customer gets two sessions, two ledger rows, and the
   * chance to pay twice for one plan.
   */
  it('latches against starting a second checkout while navigating away', () => {
    expect(checkoutButton).toMatch(/leaving\.current/);
  });

  it('renders the checkout page behind an auth guard that returns the user to it', () => {
    expect(checkoutPage).toContain('requireViewer');
    expect(checkoutPage).toContain('/payment/checkout?plan=');
  });

  it('redirects an unknown or missing plan rather than rendering an empty order', () => {
    expect(checkoutPage).toContain('isPurchasablePlan');
    expect(checkoutPage).toContain("redirect('/pricing')");
  });

  it('mounts the checkout button on the checkout page', () => {
    expect(checkoutPage).toContain('PolarCheckoutButton');
    expect(checkoutPage).toContain("from '@/components/payments/PolarCheckoutButton'");
  });

  it('points every purchasable plan on the pricing table at checkout', () => {
    expect(pricingCards).toContain('/payment/checkout');
    expect(pricingCards).toMatch(/plan\.purchasable \?\s*`\$\{checkoutHref\}\?plan=\$\{plan\.id\}`/);
  });

  it('points the dashboard upsells at checkout too', () => {
    expect(upgradeCard).toContain('/payment/checkout?plan=');
    expect(accountPage).toContain('/payment/checkout?plan=pro');
  });

  it('offers a checkout route for every purchasable plan and none for the free one', () => {
    const purchasable = PLAN_ORDER.filter((id) => PLANS[id].purchasable);
    expect(purchasable).toEqual(['pro', 'lifetime']);
    expect(PLANS.free.purchasable).toBe(false);

    // The free plan's CTA must not land on a checkout page it can never complete.
    expect(pricingCards).toMatch(/: ctaHref/);
  });

  it('keeps the checkout page out of the index', () => {
    expect(checkoutPage).toContain('privateMetadata');
  });
});
