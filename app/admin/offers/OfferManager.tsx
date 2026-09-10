'use client';

import { useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Alert, Badge } from '@/components/ui/feedback';
import { Field, Input, Select, Textarea } from '@/components/ui/form';
import { useToast } from '@/components/ui/toast';
import { Panel } from '@/components/ui/card';
import { PLANS, PLAN_ORDER } from '@/lib/plans';
import type { LaunchOffer } from '@/types/offer';
import type { PlanId } from '@/types/user';

/**
 * The offer form.
 *
 * One offer at a time, on one plan. That is a deliberate limit rather than an unfinished
 * feature: two simultaneous offers means deciding which wins on a plan they both name, and
 * the pricing page has one place to put a ribbon. If two are ever genuinely needed, this
 * becomes a list and the resolver gains a precedence rule — until then, the simpler thing
 * is also the one that cannot be ambiguous about what a customer pays.
 */

interface Draft {
  active: boolean;
  planId: PlanId;
  price: string;
  seats: string;
  label: string;
  note: string;
}

function toDraft(offer: LaunchOffer | null): Draft {
  return {
    active: offer?.active ?? false,
    planId: offer?.planId ?? 'lifetime',
    price: offer?.price ?? '',
    seats: offer?.seats != null ? String(offer.seats) : '',
    label: offer?.label ?? 'Launch offer',
    note: offer?.note ?? '',
  };
}

const currency = (value: number) => `$${value.toFixed(2)}`;

export function OfferManager({
  initialOffer,
  storeCurrency,
}: {
  initialOffer: LaunchOffer | null;
  storeCurrency: string;
}) {
  const toast = useToast();
  const [saved, setSaved] = useState(initialOffer);
  const [draft, setDraft] = useState<Draft>(() => toDraft(initialOffer));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const purchasable = PLAN_ORDER.filter((id) => PLANS[id].purchasable);
  const listPrice = Number.parseFloat(PLANS[draft.planId].price);
  const offered = Number.parseFloat(draft.price);

  /*
   * The saving is computed as you type rather than on save, because the number that matters
   * to whoever is setting a price is the discount, not the price. Typing "6" against a $69
   * plan should say 91% immediately — that is the moment to notice a missing digit.
   */
  const preview = useMemo(() => {
    if (!Number.isFinite(offered) || !Number.isFinite(listPrice) || listPrice <= 0) return null;
    if (offered <= 0) return null;
    if (offered >= listPrice) return { invalid: true as const };
    return {
      invalid: false as const,
      saved: listPrice - offered,
      percent: Math.round(((listPrice - offered) / listPrice) * 100),
    };
  }, [offered, listPrice]);

  async function save(nextActive?: boolean) {
    setBusy(true);
    setError(null);

    const seats = draft.seats.trim() === '' ? null : Number.parseInt(draft.seats, 10);
    const body = {
      active: nextActive ?? draft.active,
      planId: draft.planId,
      price: draft.price.trim(),
      seats: Number.isFinite(seats as number) ? seats : null,
      label: draft.label.trim(),
      note: draft.note.trim(),
    };

    try {
      const response = await fetch('/api/admin/offers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const payload = (await response.json().catch(() => null)) as
        | { offer?: LaunchOffer; error?: { message?: string } }
        | null;

      if (!response.ok || !payload?.offer) {
        setError(payload?.error?.message ?? 'The offer could not be saved.');
        setBusy(false);
        return;
      }

      setSaved(payload.offer);
      setDraft(toDraft(payload.offer));
      toast.success(
        payload.offer.active ? 'Offer is live' : 'Offer switched off',
        payload.offer.active
          ? `${PLANS[payload.offer.planId].name} now sells at ${storeCurrency} ${payload.offer.price}.`
          : 'Every plan is back at its list price.',
      );
    } catch {
      setError('We could not reach the server. Nothing was saved.');
    }
    setBusy(false);
  }

  const live = saved?.active ?? false;

  return (
    <div className="space-y-6">
      <Panel
        title="Current state"
        action={
          saved ? (
            <Button
              variant={live ? 'outline' : 'primary'}
              onClick={() => void save(!live)}
              loading={busy}
            >
              {live ? 'Switch off' : 'Switch on'}
            </Button>
          ) : null
        }
      >
        <Badge tone={live ? 'success' : 'neutral'}>{live ? 'Live' : 'Off'}</Badge>

        <p className="mt-3 text-sm leading-relaxed text-ink-700">
          {live && saved ? (
            <>
              <strong className="font-semibold">{PLANS[saved.planId].name}</strong> is selling at{' '}
              <strong className="font-semibold">
                {storeCurrency} {saved.price}
              </strong>{' '}
              instead of {PLANS[saved.planId].price}
              {saved.seats != null ? `, advertised to the first ${saved.seats.toLocaleString('en')} members` : ''}.
              This is the price on the pricing page, on the checkout, and the amount PayPal is
              asked for.
            </>
          ) : (
            'No offer is running. Every plan is at its list price.'
          )}
        </p>

        {saved ? (
          <p className="mt-2 text-xs text-ink-500">
            Last changed {new Date(saved.updatedAt).toLocaleString()}
            {saved.updatedBy ? ` by ${saved.updatedBy}` : ''}.
          </p>
        ) : null}
      </Panel>

      <Panel title="Edit the offer">
        {error ? (
          <Alert tone="danger" className="mt-4">
            {error}
          </Alert>
        ) : null}

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <Field label="Plan" hint="Only plans that are actually sold can be discounted.">
            {({ id, describedBy }) => (
              <Select
                id={id}
                aria-describedby={describedBy}
                value={draft.planId}
                onChange={(event) =>
                  setDraft((d) => ({ ...d, planId: event.target.value as PlanId }))
                }
              >
                {purchasable.map((planId) => (
                  <option key={planId} value={planId}>
                    {PLANS[planId].name} — lists at {storeCurrency} {PLANS[planId].price}
                  </option>
                ))}
              </Select>
            )}
          </Field>

          <Field
            label={`Offer price (${storeCurrency})`}
            hint={`Must be below the list price of ${PLANS[draft.planId].price}.`}
          >
            {({ id, describedBy }) => (
              <Input
                id={id}
                aria-describedby={describedBy}
                value={draft.price}
                inputMode="decimal"
                placeholder="6.00"
                onChange={(event) => setDraft((d) => ({ ...d, price: event.target.value }))}
              />
            )}
          </Field>

          <Field
            label="Seats"
            hint="How many members the offer is advertised to. Leave blank for no stated limit — the page then makes no scarcity claim."
          >
            {({ id, describedBy }) => (
              <Input
                id={id}
                aria-describedby={describedBy}
                value={draft.seats}
                inputMode="numeric"
                placeholder="1000"
                onChange={(event) => setDraft((d) => ({ ...d, seats: event.target.value }))}
              />
            )}
          </Field>

          <Field label="Badge" hint="The ribbon on the plan card. Keep it short.">
            {({ id, describedBy }) => (
              <Input
                id={id}
                aria-describedby={describedBy}
                value={draft.label}
                maxLength={32}
                placeholder="Launch offer"
                onChange={(event) => setDraft((d) => ({ ...d, label: event.target.value }))}
              />
            )}
          </Field>
        </div>

        <Field
          className="mt-4"
          label="Note"
          hint="Not shown to customers. For whoever finds this in six months."
        >
          {({ id, describedBy }) => (
            <Textarea
              id={id}
              aria-describedby={describedBy}
              value={draft.note}
              maxLength={280}
              rows={2}
              onChange={(event) => setDraft((d) => ({ ...d, note: event.target.value }))}
            />
          )}
        </Field>

        {preview ? (
          preview.invalid ? (
            <Alert tone="warning" className="mt-4">
              That is not below {PLANS[draft.planId].name}&apos;s list price of{' '}
              {PLANS[draft.planId].price}. The card shows the list price struck through beside
              the offer, so it has to be a real discount.
            </Alert>
          ) : (
            <p className="mt-4 text-sm text-ink-700">
              Customers would see{' '}
              <s className="text-ink-400">
                {storeCurrency} {listPrice.toFixed(2)}
              </s>{' '}
              <strong className="font-semibold">
                {storeCurrency} {offered.toFixed(2)}
              </strong>{' '}
              — a saving of {currency(preview.saved)},{' '}
              <strong className="font-semibold">{preview.percent}% off</strong>.
            </p>
          )
        ) : null}

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Button onClick={() => void save()} loading={busy}>
            Save
          </Button>
          <Button variant="ghost" onClick={() => setDraft(toDraft(saved))} disabled={busy}>
            Reset
          </Button>
        </div>

        {/*
          Worth saying on the page rather than only in a commit message. Someone changing a
          price will reasonably wonder what happens to a customer who is mid-checkout, and
          the answer is reassuring — but only if they know it.
        */}
        <p className="mt-5 border-t border-ink-100 pt-4 text-xs leading-relaxed text-ink-500">
          Saving takes effect within about 30 seconds on every page. Orders already created
          are unaffected: each one records the amount it was created for and is verified
          against that, so a customer part-way through paying finishes at the price they were
          shown.
        </p>
      </Panel>
    </div>
  );
}
