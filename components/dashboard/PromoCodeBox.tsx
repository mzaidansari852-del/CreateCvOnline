'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/feedback';
import { Field, Input } from '@/components/ui/form';
import { useCopy } from '@/components/i18n/LocaleProvider';
import { useToast } from '@/components/ui/toast';

/**
 * Where a user redeems a promo code.
 *
 * `router.refresh()` on success rather than local state, because a redemption changes the
 * plan badge, the limits and the billing section on the same screen. Re-rendering the server
 * component is the only way those agree with each other; updating one field here would leave
 * the rest of the page describing the plan the user had a second ago.
 *
 * The error is shown inline as well as in a toast. A toast is missed by anyone who looked
 * away, and a code being refused is exactly the moment someone is staring at the field
 * wondering what they typed wrong.
 */
export function PromoCodeBox() {
  const copy = useCopy();
  const toast = useToast();
  const router = useRouter();

  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!code.trim()) {
      setError(copy.settings.promoEmpty);
      return;
    }

    setBusy(true);
    try {
      const response = await fetch('/api/promo/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.trim() }),
      });

      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        const message = payload?.error?.message ?? copy.common.somethingWentWrong;
        setError(message);
        toast.error(copy.settings.promoFailedTitle, message);
        return;
      }

      setCode('');
      toast.success(
        copy.settings.promoSuccessTitle,
        copy.settings.promoSuccessBody(payload?.plan?.name ?? ''),
      );
      router.refresh();
    } catch {
      setError(copy.common.somethingWentWrong);
      toast.error(copy.settings.promoFailedTitle, copy.common.somethingWentWrong);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <p className="text-sm leading-relaxed text-ink-600">{copy.settings.promoHint}</p>

      {error ? (
        <Alert tone="danger" title={copy.settings.promoFailedTitle}>
          {error}
        </Alert>
      ) : null}

      <div className="flex flex-wrap items-end gap-3">
        <div className="min-w-[220px] flex-1">
          <Field label={copy.settings.promoLabel}>
            {({ id, describedBy }) => (
              <Input
                id={id}
                value={code}
                maxLength={64}
                autoCapitalize="characters"
                autoComplete="off"
                spellCheck={false}
                placeholder={copy.settings.promoPlaceholder}
                aria-describedby={describedBy}
                onChange={(event) => {
                  setCode(event.target.value);
                  if (error) setError(null);
                }}
              />
            )}
          </Field>
        </div>
        <Button type="submit" loading={busy} className="mb-0.5">
          {busy ? copy.settings.promoSubmitting : copy.settings.promoSubmit}
        </Button>
      </div>
    </form>
  );
}
