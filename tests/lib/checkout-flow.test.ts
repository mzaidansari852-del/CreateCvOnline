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

const checkoutButton = read('components/payments/PaddleCheckoutButton.tsx');
const checkoutPage = read('app/payment/checkout/page.tsx');
const pricingCards = read('components/marketing/PricingCards.tsx');
const upgradeCard = read('components/dashboard/UpgradeCard.tsx');
const accountPage = read('app/dashboard/account/page.tsx');

describe('checkout flow', () => {
  it('has a client component that calls the create-transaction endpoint', () => {
    expect(checkoutButton).toContain("'use client'");
    expect(checkoutButton).toContain('/api/payments/paddle/create-transaction');
  });

  it('sends only a plan id to the server, never a price', () => {
    /*
     * The whole anti-tampering design rests on this: the browser names a plan, the server
     * prices it. A body carrying an amount would undo that in one line.
     *
     * Every request body in the file is checked, not just the first. The button makes two
     * calls — create-transaction and verify — and asserting on one of them would leave the
     * other free to grow a price field unnoticed.
     */
    const bodies = [...checkoutButton.matchAll(/body:\s*JSON\.stringify\(\{([^}]*)\}\)/g)].map(
      (match) => match[1] ?? '',
    );
    expect(bodies.length).toBeGreaterThan(0);
    expect(bodies.some((body) => body.includes('planId'))).toBe(true);
    for (const body of bodies) expect(body).not.toMatch(/amount|price|value|currency/i);
  });

  /*
   * The overlay is opened against a transaction id the server created, never against a
   * price id or an amount. Opening with `items: [...]` would put the thing being sold in
   * the browser's hands; opening with an amount would put the price there.
   */
  it('opens the overlay against a server-created transaction, not a price', () => {
    expect(checkoutButton).toMatch(/transactionId/);
    expect(checkoutButton).not.toMatch(/Checkout\.open\(\s*\{\s*items/);
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
    expect(checkoutPage).toContain('PaddleCheckoutButton');
    expect(checkoutPage).toContain("from '@/components/payments/PaddleCheckoutButton'");
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
