import { z } from 'zod';
import { planIdSchema } from './user';

/**
 * `manual` is an admin grant, not a gateway.
 *
 * `paypal` and `paddle` stay in the enum although nothing writes them any more. This
 * schema parses *stored* records, and removing a value from it would turn any historical
 * order into a parse error rather than a readable row — a support ticket about a payment
 * from last year would fail on the way out of the database. It costs one string each to
 * keep old data readable. `gatewayFor()` still throws for both, so such a record can be
 * displayed but never re-checked against an API that no longer knows us.
 *
 * `polar` is the live gateway. Paddle never took a real payment here — the seller account
 * was declined during review — so in practice the only `paddle` rows that exist are
 * sandbox ones. The value is kept anyway, because a schema that can only parse the happy
 * path is not a schema.
 */
export const paymentProviderSchema = z.enum(['paypal', 'paddle', 'polar', 'manual']);
export type PaymentProvider = z.infer<typeof paymentProviderSchema>;

export const paymentStatusSchema = z.enum([
  'created',
  'approved',
  'completed',
  'failed',
  'cancelled',
  'refunded',
]);
export type PaymentStatus = z.infer<typeof paymentStatusSchema>;

export const paymentRecordSchema = z.object({
  id: z.string(),
  userId: z.string(),
  provider: paymentProviderSchema,
  /** Provider-side identifier — a Polar checkout id, or a Paddle transaction / PayPal
   * order id on an older record. */
  providerOrderId: z.string(),
  /** Provider-side capture/transaction id, present once money moved. */
  providerCaptureId: z.string().nullable().default(null),
  planId: planIdSchema,
  /** Decimal string, e.g. "9.00" — never a float. */
  amount: z.string(),
  currency: z.string().length(3),
  status: paymentStatusSchema,
  payerEmail: z.string().nullable().default(null),
  createdAt: z.string(),
  updatedAt: z.string(),
  /** Raw provider payload, redacted, kept for support and dispute handling. */
  raw: z.record(z.string(), z.unknown()).nullable().default(null),
});
export type PaymentRecord = z.infer<typeof paymentRecordSchema>;

/**
 * Provider-agnostic checkout contract.
 *
 * This seam has now survived two gateway changes without a call site moving: PayPal out,
 * Paddle in, then Paddle out and Polar in. That is the whole argument for it.
 */
export interface CheckoutOrder {
  orderId: string;
  status: PaymentStatus;
  /**
   * Where to send the customer to pay, when the provider hosts the payment form.
   *
   * Unused under Paddle, whose overlay opened in place against a transaction id. Polar
   * hosts its checkout, so this carries the URL the browser is redirected to — which is
   * what the field was originally designed for under PayPal's approve flow.
   */
  approveUrl?: string;
}

export interface CaptureResult {
  orderId: string;
  captureId: string | null;
  status: PaymentStatus;
  amount: string;
  currency: string;
  payerEmail: string | null;
  raw: Record<string, unknown>;
}

export interface PaymentGateway {
  readonly id: PaymentProvider;
  /**
   * Creates an order on the provider.
   *
   * `amount` is the figure the customer was quoted, resolved server-side from the plan and
   * whatever offer was running at that moment. It is passed rather than looked up because
   * the offer is editable at runtime: a price read again inside the gateway could differ
   * from the one on the page the customer just agreed to.
   *
   * A gateway that holds its own prices — Polar bills against a product id — ignores it for
   * the charge itself. It is still recorded in our ledger, which is what the capture is
   * later verified against.
   */
  createOrder(input: {
    planId: string;
    userId: string;
    amount: string;
    returnUrl: string;
    cancelUrl: string;
  }): Promise<CheckoutOrder>;
  /** Captures and *verifies* an order. Never trust the browser's word that it succeeded. */
  captureOrder(orderId: string): Promise<CaptureResult>;
  /** Reads an order without mutating it — used for reconciliation. */
  getOrder(orderId: string): Promise<CaptureResult>;
  /** Verifies an inbound webhook signature. Returns false when unverifiable. */
  verifyWebhook(headers: Record<string, string>, rawBody: string): Promise<boolean>;
}
