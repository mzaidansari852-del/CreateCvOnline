'use client';

import { useState } from 'react';

import { useCopy } from '@/components/i18n/LocaleProvider';
import { cn } from '@/lib/utils/cn';
import { CheckoutButton } from './CheckoutButton';
import { PaddleCheckoutButton } from './PaddleCheckoutButton';
import { CardBrandMarks, PayPalMark } from './PaymentMarks';
import type { PlanId } from '@/types/user';

/**
 * Lets the payer pick between the two gateways.
 *
 * Rendered only when both are actually configured — the checkout page mounts the single
 * button directly otherwise, because a picker with one option is a control that teaches the
 * customer nothing and still asks them to read it.
 *
 * ## Why tiles rather than a segmented control
 *
 * The control this replaced read "Card or wallet | PayPal", which asked the customer to
 * work out what "wallet" meant and gave them no reason to believe an ordinary card would
 * be accepted at all. Nobody reads a payment page; they scan it for a mark they recognise
 * and stop. So the choice is carried by the brand marks, the label names the outcome
 * ("Credit or debit card") rather than the mechanism, and the hint is one short line
 * instead of a paragraph about merchant-of-record tax treatment — true, but not what
 * anyone is deciding here.
 *
 * The gateway names are deliberately absent from the tiles. "Paddle" is a company the
 * customer has no relationship with, and naming it at the moment of choosing adds a
 * stranger to the transaction. It appears under the button instead, where the same fact
 * reassures rather than confuses.
 *
 * The default comes from `availableGateways()`'s preference order rather than being fixed
 * here, so the deployment decides. Today that means Paddle: it is the merchant of record,
 * which is the difference between charging the right tax and owing it.
 */

export type CheckoutMethod = 'paddle' | 'paypal';

function MethodTile({
  selected,
  onSelect,
  name,
  hint,
  art,
}: {
  selected: boolean;
  onSelect: () => void;
  name: string;
  hint: string;
  art: React.ReactNode;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      className={cn(
        'relative flex w-full items-center gap-3 rounded-xl border-[1.5px] p-3.5 text-left transition-colors',
        'focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:outline-none',
        selected
          ? 'border-brand-600 bg-brand-50'
          : 'border-ink-200 bg-white hover:border-ink-300 hover:bg-ink-50',
      )}
    >
      {/* Decorative: `aria-checked` above is what a screen reader announces. */}
      <span
        aria-hidden
        className={cn(
          'absolute top-2.5 right-2.5 grid size-[18px] place-items-center rounded-full border-[1.5px] transition-colors',
          selected ? 'border-brand-600 bg-brand-600' : 'border-ink-300 bg-white',
        )}
      >
        <svg
          width="10"
          height="10"
          viewBox="0 0 24 24"
          fill="none"
          className={selected ? 'opacity-100' : 'opacity-0'}
        >
          <path
            d="m5 12.5 4.5 4.5L19 7.5"
            stroke="#fff"
            strokeWidth="3.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>

      <span
        className={cn(
          'grid h-9 w-[52px] shrink-0 place-items-center overflow-hidden rounded-md border bg-white',
          selected ? 'border-brand-200' : 'border-ink-200',
        )}
      >
        {art}
      </span>

      <span className="min-w-0">
        <span className="block text-sm leading-tight font-bold text-ink-950">{name}</span>
        <span className="mt-0.5 block text-[11.5px] leading-snug text-ink-500">{hint}</span>
      </span>
    </button>
  );
}

export function CheckoutMethodChoice({
  planId,
  planName,
  priceLabel,
  defaultMethod,
  summary,
}: {
  planId: PlanId;
  planName: string;
  priceLabel: string;
  defaultMethod: CheckoutMethod;
  /**
   * The order summary, rendered between the tiles and the button.
   *
   * Passed in from the server page rather than built here, so the figures never leave the
   * server. It sits *below* the choice because the total is the last thing read before
   * committing — putting it above means the customer reads the price, gets asked a
   * question, and has to look back up.
   */
  summary: React.ReactNode;
}) {
  const copy = useCopy();
  const [method, setMethod] = useState<CheckoutMethod>(defaultMethod);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2.5">
        <p className="text-[13px] font-bold text-ink-900">{copy.checkout.methodHeading}</p>
        <div
          role="radiogroup"
          aria-label={copy.checkout.methodHeading}
          className="grid gap-2.5 sm:grid-cols-2"
        >
          <MethodTile
            selected={method === 'paddle'}
            onSelect={() => setMethod('paddle')}
            name={copy.checkout.methodPaddle}
            hint={copy.checkout.methodPaddleHint}
            art={<CardBrandMarks />}
          />
          <MethodTile
            selected={method === 'paypal'}
            onSelect={() => setMethod('paypal')}
            name={copy.checkout.methodPaypal}
            hint={copy.checkout.methodPaypalHint}
            art={<PayPalMark />}
          />
        </div>
      </div>

      {summary}

      {/*
        Both buttons stay mounted rather than being swapped, because the Paddle one can be
        holding a paid-but-unconfirmed transaction and the retry that goes with it. Throwing
        that away on an idle click of the other tile would leave paying a second time as the
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
