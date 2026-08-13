import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import { PLANS, PLAN_ORDER } from '@/lib/plans';

/**
 * Guards the wiring between "user wants to pay" and "PayPal order exists".
 *
 * The original build shipped a complete payment backend — create-order, capture with
 * server-side amount verification, webhook, fulfilment, admin ledger — and no button that
 * called any of it. Every purchase CTA pointed at `/pricing`, and `/pricing` pointed at
 * `/register`, so the create-order route had no caller in the entire application.
 *
 * Type-checking cannot catch a route nobody fetches, and the SEO crawler only walks
 * public pages, so nothing failed. These tests assert the chain exists end to end.
 */

const read = (path: string) => readFileSync(join(process.cwd(), path), 'utf8');

const checkoutButton = read('components/payments/CheckoutButton.tsx');
const checkoutPage = read('app/payment/checkout/page.tsx');
const pricingCards = read('components/marketing/PricingCards.tsx');
const upgradeCard = read('components/dashboard/UpgradeCard.tsx');
const accountPage = read('app/dashboard/account/page.tsx');

describe('checkout flow', () => {
  it('has a client component that calls the create-order endpoint', () => {
    expect(checkoutButton).toContain("'use client'");
    expect(checkoutButton).toContain('/api/payments/paypal/create-order');
  });

  it('sends only a plan id to the server, never a price', () => {
    // The whole anti-tampering design rests on this: the browser names a plan, the
    // server prices it. A body carrying an amount would undo that in one line.
    const body = /body:\s*JSON\.stringify\(\{([^}]*)\}\)/.exec(checkoutButton);
    expect(body).not.toBeNull();
    expect(body?.[1]).toContain('planId');
    expect(body?.[1]).not.toMatch(/amount|price|value|currency/i);
  });

  it('refuses to redirect anywhere that is not PayPal', () => {
    expect(checkoutButton).toContain('isPayPalApproveUrl');
    expect(checkoutButton).toMatch(/paypal\.com/);
    // An open redirect here would be handed a URL by an upstream API response.
    expect(checkoutButton).toMatch(/protocol !== 'https:'/);
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
    expect(checkoutPage).toContain('CheckoutButton');
    expect(checkoutPage).toContain("from '@/components/payments/CheckoutButton'");
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
