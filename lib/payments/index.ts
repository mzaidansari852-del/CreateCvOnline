import 'server-only';

import { paypalGateway } from './paypal';
import { isPayPalConfigured } from '@/lib/env';
import type { PaymentGateway } from '@/types/payment';

/**
 * Gateway selection.
 *
 * Every call site in the app imports `gateway()` — nothing outside this folder mentions
 * PayPal. Swapping in Stripe or Paddle later means writing one more file that satisfies
 * `PaymentGateway` and changing the line below.
 */

export class PaymentsUnavailableError extends Error {
  readonly status = 503;
  constructor() {
    super(
      'Payments are not configured on this deployment. Set PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET.',
    );
    this.name = 'PaymentsUnavailableError';
  }
}

export function gateway(): PaymentGateway {
  if (!isPayPalConfigured()) throw new PaymentsUnavailableError();
  return paypalGateway;
}

export function paymentsAvailable(): boolean {
  return isPayPalConfigured();
}

export { captureMatchesPlan, readCustomId, PayPalError } from './paypal';
