import 'server-only';

import { paypalGateway } from './paypal';
import { isPayPalConfigured } from '@/lib/env';
import type { PaymentGateway, PaymentProvider } from '@/types/payment';

/**
 * Gateway selection.
 *
 * One gateway, PayPal. The indirection stays because it is what makes adding a second one a
 * contained change rather than a rewrite: `gateway()` is what every checkout path calls, and
 * `gatewayFor()` is what the reconciliation paths call, so neither has to learn a provider
 * name. A Paddle integration lived behind this interface for a while and was removed without
 * any call site changing, which is the argument for keeping the seam.
 */

export class PaymentsUnavailableError extends Error {
  readonly status = 503;
  constructor() {
    super(
      'Payments are not configured on this deployment. Set PAYPAL_CLIENT_ID and ' +
        'PAYPAL_CLIENT_SECRET.',
    );
    this.name = 'PaymentsUnavailableError';
  }
}

/** The gateway a new checkout should use. */
export function gateway(): PaymentGateway {
  if (isPayPalConfigured()) return paypalGateway;
  throw new PaymentsUnavailableError();
}

/**
 * A specific gateway by name, for paths that cannot choose.
 *
 * A webhook arrives at a provider-specific URL, and a payment recorded last month must be
 * reconciled against the provider that took it — not against whichever gateway happens to
 * be preferred today. Throws rather than falling back, because reconciling an order through
 * the wrong provider would produce a confident wrong answer.
 */
export function gatewayFor(provider: PaymentProvider): PaymentGateway {
  if (provider === 'paypal') {
    if (!isPayPalConfigured()) throw new PaymentsUnavailableError();
    return paypalGateway;
  }
  /*
   * `manual` is an admin grant with no gateway behind it, and `paddle` is a provider this
   * deployment no longer talks to. Both reach here, and both must throw rather than resolve
   * to PayPal: asking PayPal about an order it never took returns "not found", which reads
   * as "this customer did not pay".
   */
  throw new PaymentsUnavailableError();
}

export function paymentsAvailable(): boolean {
  return isPayPalConfigured();
}

/** Which gateways a checkout page may offer, in preference order. */
export function availableGateways(): PaymentProvider[] {
  return isPayPalConfigured() ? ['paypal'] : [];
}

export { captureMatchesPlan, readCustomId, PayPalError } from './paypal';
