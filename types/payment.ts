import { z } from 'zod';
import { planIdSchema } from './user';

/**
 * `manual` is an admin grant, not a gateway.
 *
 * `paypal` stays in the enum although nothing writes it any more. This schema parses
 * *stored* records, and removing a value from it would turn any historical order into a
 * parse error rather than a readable row — a support ticket about a payment from last year
 * would fail on the way out of the database. It costs one string to keep old data readable.
 * `gatewayFor('paypal')` still throws, so a record can be displayed but never re-checked
 * against an API that no longer knows us.
 */
export const paymentProviderSchema = z.enum(['paypal', 'paddle', 'manual']);
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
  /** Provider-side identifier — a Paddle transaction id, or a PayPal order id on an
   * older record. */
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
 * Swapping Paddle for Stripe later means implementing this interface and
 * changing one line in `lib/payments/index.ts` — no call-site touches routes or UI.
 */
export interface CheckoutOrder {
  orderId: string;
  status: PaymentStatus;
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
  /** Creates an order on the provider. Amount is derived server-side from the plan. */
  createOrder(input: {
    planId: string;
    userId: string;
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
