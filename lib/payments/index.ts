import 'server-only';

import { paddleGateway } from './paddle';
import { paypalGateway } from './paypal';
import { polarGateway } from './polar';
import { isPaddleConfigured, isPayPalConfigured, isPolarConfigured } from '@/lib/env';
import type { PaymentGateway, PaymentProvider } from '@/types/payment';

/**
 * Gateway selection.
 *
 * The indirection is what makes swapping a provider a contained change rather than a
 * rewrite: `gateway()` is what a checkout path calls when it does not care, `gatewayFor()`
 * is what the provider-specific routes and the reconciliation paths call, and neither
 * exposes a provider name to the pages above them.
 *
 * That claim has been tested three times now. PayPal lived behind this interface and was
 * removed without a call site changing. Paddle replaced it and had to be replaced in turn
 * when Paddle declined the seller account during review. Polar replaced Paddle. Each time,
 * the ledger, the fulfilment transaction and the confirmation UI stayed where they were.
 *
 * ## Which gateways are live, and why there are two
 *
 * **Polar** is the intended long-term gateway and is preferred wherever a choice is made.
 * It is a *merchant of record*: it sells to the customer and it owes the VAT. This site
 * sells into Germany, France and the Netherlands, so that property is the whole reason it
 * was chosen over going direct.
 *
 * **PayPal** is here as an interim, because Polar's account is not live yet and something
 * has to be able to take a payment in the meantime. It is a plain processor, not a merchant
 * of record, which means that while it is the gateway in use *we* are the seller of record
 * and the EU VAT is ours to account for. `lib/payments/paypal.ts` says the same thing at
 * more length. Remove it once Polar is live; it is not meant to be a permanent second
 * option, and every extra day it runs is another day of VAT to reconcile by hand.
 *
 * ## Why Paddle is still here
 *
 * Not as a fallback. Paddle never took a live payment, so there is no revenue path to keep
 * open, and a deployment that quietly failed over to a declined account would be worse
 * than one that said payments were unavailable. It stays only so that any sandbox rows
 * written during the aborted integration remain *reconcilable* rather than becoming
 * unreadable history, and it resolves only when explicitly asked for by name.
 */

export class PaymentsUnavailableError extends Error {
  readonly status = 503;
  constructor() {
    super(
      'Payments are not configured on this deployment. Set POLAR_ACCESS_TOKEN together ' +
        'with POLAR_PRODUCT_PRO and POLAR_PRODUCT_LIFETIME, or — for the interim PayPal ' +
        'gateway — PAYPAL_CLIENT_ID together with PAYPAL_CLIENT_SECRET.',
    );
    this.name = 'PaymentsUnavailableError';
  }
}

/**
 * The gateway a new checkout should use when the caller expresses no preference.
 *
 * Polar first, for the merchant-of-record reason above. A caller that needs a specific
 * provider — every one of the provider-scoped API routes — must use `gatewayFor()`, so
 * that a route named `/api/payments/paypal/...` can never end up talking to Polar because
 * of a configuration change nobody noticed.
 */
export function gateway(): PaymentGateway {
  if (isPolarConfigured()) return polarGateway;
  if (isPayPalConfigured()) return paypalGateway;
  throw new PaymentsUnavailableError();
}

/**
 * A specific gateway by name, for paths that cannot choose.
 *
 * A webhook arrives at a provider-specific URL, and a payment recorded last year must be
 * reconciled against the provider that took it — not against whichever gateway happens to
 * be configured today. Throws rather than falling back, because reconciling a PayPal order
 * through Polar would produce a confident wrong answer.
 */
export function gatewayFor(provider: PaymentProvider): PaymentGateway {
  if (provider === 'polar') {
    if (!isPolarConfigured()) throw new PaymentsUnavailableError();
    return polarGateway;
  }
  if (provider === 'paypal') {
    if (!isPayPalConfigured()) throw new PaymentsUnavailableError();
    return paypalGateway;
  }
  if (provider === 'paddle') {
    if (!isPaddleConfigured()) throw new PaymentsUnavailableError();
    return paddleGateway;
  }
  /*
   * `manual` is an admin grant with no gateway behind it. It reaches here and must throw
   * rather than resolve to whatever is live: asking Polar about a transaction it never took
   * returns "not found", which reads as "this customer did not pay". Historical rows still
   * display in the admin console — they just cannot be re-checked against a live API.
   */
  throw new PaymentsUnavailableError();
}

export function paymentsAvailable(): boolean {
  return isPolarConfigured() || isPayPalConfigured();
}

/**
 * Which gateways a checkout page may offer, in preference order.
 *
 * Order is the page's default when it renders a picker, so Polar leads: when both are
 * configured, the merchant-of-record one should be the option a customer lands on without
 * doing anything. Paddle is never in this list — see the note at the top of the file.
 */
export function availableGateways(): PaymentProvider[] {
  const gateways: PaymentProvider[] = [];
  if (isPolarConfigured()) gateways.push('polar');
  if (isPayPalConfigured()) gateways.push('paypal');
  return gateways;
}

export {
  planForProductId,
  polarCaptureMatchesPlan,
  productIdFor,
  readPolarWebhookEvent,
  readWebhookOrder,
  orderToCaptureResult,
  PolarError,
} from './polar';

export {
  paypalCaptureMatchesAmount,
  paypalCaptureMatchesPlan,
  readPayPalCustomId,
  PayPalError,
} from './paypal';

/*
 * Paddle's helpers stay exported for the reconciliation path and for the tests that still
 * cover it. Nothing on a checkout path imports them.
 */
export {
  paddleCaptureMatchesPlan,
  planForPriceId,
  priceIdFor,
  readWebhookTransaction,
  PaddleError,
} from './paddle';
