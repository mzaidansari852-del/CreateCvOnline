'use client';

import { useState } from 'react';

import { useCopy } from '@/components/i18n/LocaleProvider';
import { SegmentedControl } from '@/components/ui/form';
import { CheckoutButton } from './CheckoutButton';
import { PaddleCheckoutButton } from './PaddleCheckoutButton';
import type { PlanId } from '@/types/user';

/**
 * Lets the payer pick between the two gateways.
 *
 * Rendered only when both are actually configured — the checkout page mounts the single
 * button directly otherwise, because a picker with one option is a control that teaches the
 * customer nothing and still asks them to read it.
 *
 * The default comes from `availableGateways()`'s preference order rather than being fixed
 * here, so the deployment decides. Today that means Paddle: it is the merchant of record,
 * which is the difference between charging the right tax and owing it.
 */

export type CheckoutMethod = 'paddle' | 'paypal';

export function CheckoutMethodChoice({
  planId,
  planName,
  priceLabel,
  defaultMethod,
}: {
  planId: PlanId;
  planName: string;
  priceLabel: string;
  defaultMethod: CheckoutMethod;
}) {
  const copy = useCopy();
  const [method, setMethod] = useState<CheckoutMethod>(defaultMethod);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <p className="text-sm font-semibold text-ink-900">{copy.checkout.methodHeading}</p>
        <SegmentedControl
          value={method}
          onChange={setMethod}
          label={copy.checkout.methodHeading}
          className="w-full"
          options={[
            { value: 'paddle' as CheckoutMethod, label: copy.checkout.methodPaddle },
            { value: 'paypal' as CheckoutMethod, label: copy.checkout.methodPaypal },
          ]}
        />
        <p className="text-xs leading-relaxed text-ink-500">
          {method === 'paddle' ? copy.checkout.methodPaddleHint : copy.checkout.methodPaypalHint}
        </p>
      </div>

      {/*
        Both buttons stay mounted rather than being swapped, because the Paddle one can be
        holding a paid-but-unconfirmed transaction and the retry that goes with it. Throwing
        that away on an idle click of the other tab would leave paying a second time as the
        customer's only visible way forward.
      */}
      <div hidden={method !== 'paddle'}>
        <PaddleCheckoutButton planId={planId} planName={planName} priceLabel={priceLabel} />
      </div>
      <div hidden={method !== 'paypal'}>
        <CheckoutButton planId={planId} planName={planName} priceLabel={priceLabel} />
      </div>
    </div>
  );
}
