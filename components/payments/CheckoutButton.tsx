'use client';

import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';

import { useCopy } from '@/components/i18n/LocaleProvider';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/feedback';
import { trackEvent } from '@/lib/analytics/events';
import { site } from '@/lib/site';
import type { PlanId } from '@/types/user';

/**
 * Starts a PayPal order and hands the payer over to PayPal.
 *
 * This is deliberately the *only* thing the component knows how to do. It sends a plan
 * id — never an amount — to `/api/payments/paypal/create-order`, which looks the price up
 * in `lib/plans.ts` server-side. A tampered client can at worst ask for a different plan;
 * it cannot change what that plan costs.
 *
 * The redirect uses `window.location.assign` rather than the Next router on purpose:
 * PayPal is a different origin, and a client-side navigation would be a no-op.
 */

interface CreateOrderResponse {
  orderId?: string;
  approveUrl?: string | null;
  error?: {
    code?: string;
    message?: string;
    details?: { issue?: string | null; reference?: string | null };
  };
}

/** Only ever send the payer to PayPal itself. */
function isPayPalApproveUrl(value: string): boolean {
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:') return false;
    const host = url.hostname.toLowerCase();
    return host === 'paypal.com' || host === 'www.paypal.com' || host.endsWith('.paypal.com');
  } catch {
    return false;
  }
}

export function CheckoutButton({
  planId,
  planName,
  priceLabel,
}: {
  planId: PlanId;
  planName: string;
  /** e.g. `$9 per month` — used for the button label and the analytics event. */
  priceLabel: string;
}) {
  const router = useRouter();
  const copy = useCopy();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  /** PayPal's machine-readable cause plus its support reference, when it gave one. */
  const [diagnostic, setDiagnostic] = useState<string | null>(null);

  const start = useCallback(async () => {
    setPending(true);
    setError(null);
    setDiagnostic(null);
    // Tagged with the gateway now that two of them are live: an untagged `checkout_started`
    // cannot be compared against the completions of either one.
    trackEvent('checkout_started', { plan: planId, gateway: 'paypal' });

    try {
      const response = await fetch('/api/payments/paypal/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId }),
      });

      const payload = (await response.json().catch(() => null)) as CreateOrderResponse | null;

      if (!response.ok) {
        if (payload?.error?.code === 'unauthenticated') {
          // The session expired between loading the page and pressing the button.
          router.push(`/login?next=${encodeURIComponent(`/payment/checkout?plan=${planId}`)}`);
          return;
        }
        /*
         * The error *code*, mapped to translated copy — never `payload.error.message`. Our
         * API writes that message in English for whoever reads the logs, and rendering it
         * here put an English sentence under a French heading on the one screen where a
         * customer is deciding whether their money is safe.
         */
        setError(
          copy.checkout.serverError(payload?.error?.code) ?? copy.checkout.paypalStartFailed,
        );
        const issue = payload?.error?.details?.issue;
        const reference = payload?.error?.details?.reference;
        setDiagnostic(
          [
            issue ? copy.checkout.diagnosticCause(issue) : null,
            reference ? copy.checkout.diagnosticReference(reference) : null,
          ]
            .filter(Boolean)
            .join(' · ') || null,
        );
        setPending(false);
        return;
      }

      const approveUrl = payload?.approveUrl;
      if (!approveUrl || !isPayPalApproveUrl(approveUrl)) {
        // The order exists but PayPal did not return a usable approval link. Saying so is
        // better than sending the payer somewhere unexpected.
        setError(copy.checkout.paypalNoApproveUrl(site.supportEmail));
        setPending(false);
        return;
      }

      // Stay in the pending state: the page is about to be replaced by PayPal's.
      window.location.assign(approveUrl);
    } catch {
      setError(copy.checkout.offline);
      setPending(false);
    }
  }, [copy, planId, router]);

  return (
    <div className="flex flex-col gap-3">
      <Button onClick={start} loading={pending} size="lg" fullWidth data-testid="checkout-submit">
        {pending ? copy.checkout.redirectingToPaypal : copy.checkout.continueToPaypal(priceLabel)}
      </Button>

      {error ? (
        <Alert tone="danger" title={copy.checkout.startFailedTitle}>
          {error}
          {diagnostic ? (
            <span className="mt-2 block font-mono text-2xs break-all opacity-80">{diagnostic}</span>
          ) : null}
        </Alert>
      ) : null}

      <p className="text-center text-xs leading-relaxed text-ink-500">
        {copy.checkout.paypalNote(planName)}
      </p>
    </div>
  );
}
