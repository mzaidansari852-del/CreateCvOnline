import 'server-only';

import { paddleGateway } from './paddle';
import { paypalGateway } from './paypal';
import { isPaddleConfigured, isPayPalConfigured } from '@/lib/env';
import type { PaymentGateway, PaymentProvider } from '@/types/payment';

/**
 * Gateway selection.
 *
 * Two real gateways now run side by side. Paddle is preferred when configured, because it
 * is a merchant of record — it collects and remits VAT and sales tax, which PayPal does
 * not — but PayPal stays wired so that switching is a configuration change rather than a
 * deployment gamble, and so that payments already recorded against it keep resolving.
 *
 * Call sites still ask for `gateway()` and get whichever is in charge. The only places
 * that name a provider are the ones that must: the two webhook routes, which are separate
 * URLs registered with two different companies.
 */

export class PaymentsUnavailableError extends Error {
  readonly status = 503;
  constructor() {
    super(
      'Payments are not configured on this deployment. Set PADDLE_API_KEY with its price ids, ' +
        'or PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET.',
    );
    this.name = 'PaymentsUnavailableError';
  }
}

/** The gateway a new checkout should use. */
export function gateway(): PaymentGateway {
  if (isPaddleConfigured()) return paddleGateway;
  if (isPayPalConfigured()) return paypalGateway;
  throw new PaymentsUnavailableError();
}

/**
 * A specific gateway by name, for paths that cannot choose.
 *
 * A webhook arrives at a provider-specific URL, and a payment recorded last month must be
 * reconciled against the provider that took it — not against whichever gateway happens to
 * be preferred today. Throws rather than falling back, because silently reconciling a
 * PayPal order through Paddle would produce a confident wrong answer.
 */
export function gatewayFor(provider: PaymentProvider): PaymentGateway {
  if (provider === 'paddle') {
    if (!isPaddleConfigured()) throw new PaymentsUnavailableError();
    return paddleGateway;
  }
  if (provider === 'paypal') {
    if (!isPayPalConfigured()) throw new PaymentsUnavailableError();
    return paypalGateway;
  }
  // `manual` is an admin grant with no gateway behind it.
  throw new PaymentsUnavailableError();
}

export function paymentsAvailable(): boolean {
  return isPaddleConfigured() || isPayPalConfigured();
}

/** Which gateways a checkout page may offer, in preference order. */
export function availableGateways(): PaymentProvider[] {
  const available: PaymentProvider[] = [];
  if (isPaddleConfigured()) available.push('paddle');
  if (isPayPalConfigured()) available.push('paypal');
  return available;
}

export { captureMatchesPlan, readCustomId, PayPalError } from './paypal';
export {
  paddleCaptureMatchesPlan,
  planForPriceId,
  priceIdFor,
  readWebhookTransaction,
  PaddleError,
} from './paddle';
