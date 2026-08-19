import 'server-only';

import { paddleGateway } from './paddle';
import { isPaddleConfigured } from '@/lib/env';
import type { PaymentGateway, PaymentProvider } from '@/types/payment';

/**
 * Gateway selection.
 *
 * One gateway, Paddle. The indirection stays because it is what makes adding or swapping
 * one a contained change rather than a rewrite: `gateway()` is what every checkout path
 * calls and `gatewayFor()` is what the reconciliation paths call, so neither has to learn
 * a provider name. A PayPal integration lived behind this interface for a while and was
 * removed without any call site changing, which is the argument for keeping the seam.
 *
 * PayPal was removed because Paddle's overlay already offers PayPal as a payment method,
 * so maintaining a second gateway bought nothing a customer could see — while costing a
 * second set of credentials, a second webhook to verify and a second failure mode.
 */

export class PaymentsUnavailableError extends Error {
  readonly status = 503;
  constructor() {
    super(
      'Payments are not configured on this deployment. Set PADDLE_API_KEY together with ' +
        'PADDLE_PRICE_PRO and PADDLE_PRICE_LIFETIME.',
    );
    this.name = 'PaymentsUnavailableError';
  }
}

/** The gateway a new checkout should use. */
export function gateway(): PaymentGateway {
  if (isPaddleConfigured()) return paddleGateway;
  throw new PaymentsUnavailableError();
}

/**
 * A specific gateway by name, for paths that cannot choose.
 *
 * A webhook arrives at a provider-specific URL, and a payment recorded last year must be
 * reconciled against the provider that took it — not against whichever gateway happens to
 * be configured today. Throws rather than falling back, because reconciling a PayPal order
 * through Paddle would produce a confident wrong answer.
 */
export function gatewayFor(provider: PaymentProvider): PaymentGateway {
  if (provider === 'paddle') {
    if (!isPaddleConfigured()) throw new PaymentsUnavailableError();
    return paddleGateway;
  }
  /*
   * `manual` is an admin grant with no gateway behind it, and `paypal` is a provider this
   * deployment no longer talks to. Both reach here, and both must throw rather than resolve
   * to Paddle: asking Paddle about a transaction it never took returns "not found", which
   * reads as "this customer did not pay". Historical PayPal rows still display in the admin
   * console — they just cannot be re-checked against a live API.
   */
  throw new PaymentsUnavailableError();
}

export function paymentsAvailable(): boolean {
  return isPaddleConfigured();
}

/** Which gateways a checkout page may offer, in preference order. */
export function availableGateways(): PaymentProvider[] {
  return isPaddleConfigured() ? ['paddle'] : [];
}

export {
  paddleCaptureMatchesPlan,
  planForPriceId,
  priceIdFor,
  readWebhookTransaction,
  PaddleError,
} from './paddle';
