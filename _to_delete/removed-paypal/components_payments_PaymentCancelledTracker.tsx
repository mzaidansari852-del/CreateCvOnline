'use client';

import { useEffect, useRef } from 'react';

import { trackEvent } from '@/lib/analytics/events';

/**
 * Records that a checkout was abandoned.
 *
 * Renders nothing. It exists only so the cancel page itself can stay a server component,
 * and so an abandoned checkout is measurable — that number is the honest signal about
 * whether the pricing page is doing its job.
 */
export function PaymentCancelledTracker({ planId }: { planId: string | null }) {
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    trackEvent('payment_cancelled', { plan: planId ?? 'unknown' });
  }, [planId]);

  return null;
}
