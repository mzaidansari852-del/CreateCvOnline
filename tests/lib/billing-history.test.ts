import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import { DASHBOARD_COPY } from '@/lib/i18n/copy/dashboard';
import { LOCALES } from '@/lib/i18n/locales';

import type { PaymentStatus } from '@/types/payment';

/**
 * "Billing history" must only ever list money that actually moved.
 *
 * An order sits at `created` from the moment checkout starts until PayPal confirms a
 * capture, and plenty never get further — the payer closes the tab, or PayPal refuses
 * (`CANNOT_PAY_SELF` during sandbox testing, a declined card in production). Listing those
 * rows under a heading that says "Billing history", beside a column headed "Amount"
 * showing `69.00 USD`, reads as a charge however the status chip is styled. That is the
 * kind of thing that generates a panicked support email, or a chargeback.
 */

const source = readFileSync(join(process.cwd(), 'app/dashboard/account/page.tsx'), 'utf8');

/** Statuses where money has genuinely moved. */
const CHARGED: PaymentStatus[] = ['completed', 'refunded'];
const NOT_CHARGED: PaymentStatus[] = ['created', 'approved', 'failed', 'cancelled'];

describe('billing history', () => {
  it('splits charged payments from unfinished checkouts', () => {
    expect(source).toContain('const charged = payments.filter');
    expect(source).toContain('const unfinished = payments.filter');
  });

  it('treats exactly completed and refunded as charged', () => {
    // Refunded belongs in the table: money moved and then moved back, and the payer needs
    // the record. Everything else never debited anything.
    for (const status of CHARGED) {
      expect(source).toContain(`payment.status === '${status}'`);
    }
    for (const status of NOT_CHARGED) {
      expect(source).not.toContain(`charged.push('${status}')`);
    }
  });

  it('renders the main table from `charged`, never from every payment', () => {
    expect(source).toContain('{charged.map((payment) => (');
    expect(source).not.toContain('{payments.map((payment) => (');
  });

  it('shows the empty state based on charged payments, not on any activity', () => {
    // A user with three abandoned checkouts and no completed one has no billing history.
    expect(source).toContain('charged.length === 0');
  });

  it('states in words that unfinished checkouts were not charged', () => {
    /*
     * This used to grep the page source for the English sentence, which pinned the words
     * in the JSX and blocked translating them. Asserting on the copy table instead is
     * strictly stronger: the reassurance now has to exist in *every* language, and a
     * French user reading an abandoned PayPal order still gets told plainly that nothing
     * was taken. That is the expensive support call this test exists to prevent.
     */
    expect(source).toContain('copy.account.unfinishedHeading');
    expect(source).toContain('copy.account.unfinishedBody');

    for (const locale of LOCALES) {
      const account = DASHBOARD_COPY[locale].account;
      expect(account.unfinishedHeading, locale).toBeTruthy();
      // Both singular and plural must read as complete sentences.
      for (const count of [1, 3]) {
        const body = account.unfinishedBody(count);
        expect(body.length, `${locale} × ${count}`).toBeGreaterThan(80);
        expect(body, `${locale} × ${count}`).not.toContain('undefined');
      }
    }

    // And the English wording itself is unchanged, so the guarantee did not quietly soften.
    expect(DASHBOARD_COPY.en.account.unfinishedHeading).toContain('nothing was charged');
    expect(DASHBOARD_COPY.en.account.unfinishedBody(1)).toMatch(/No money left your account/);
  });

  it('keeps the abandoned order ids visible for support', () => {
    // Anchored on the copy key rather than on the heading text, which now lives in the
    // copy table — the block below the heading is what these two assertions are about.
    const section = source.slice(source.indexOf('copy.account.unfinishedHeading'));
    expect(section).toContain('payment.providerOrderId');
  });

  it('strikes through the amount that was never taken', () => {
    const section = source.slice(source.indexOf('copy.account.unfinishedHeading'));
    expect(section).toContain('line-through');
  });

  it('hides the unfinished block entirely when there is nothing to explain', () => {
    expect(source).toContain('unfinished.length > 0');
  });
});
