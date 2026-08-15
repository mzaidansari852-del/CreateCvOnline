'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';

import { useCopy, useLocale } from '@/components/i18n/LocaleProvider';
import { LOCALE_META, LOCALES, type Locale } from '@/lib/i18n/locales';
import { cn } from '@/lib/utils/cn';

/**
 * Changing the language of the signed-in app.
 *
 * This exists because a user asked where it was and there was no answer: the marketing
 * header has had a language control since the French release, and the dashboard renders no
 * marketing header, so once you signed in there was no way to change language at all.
 *
 * It appears in two places, which is deliberate rather than redundant. The header copy is
 * how anyone finds it — a setting nobody can locate is not a setting — and the Settings
 * copy is how it reads as a saved account preference rather than a per-visit toggle. Both
 * write to the same endpoint.
 *
 * The change is persisted before the refresh, not alongside it: `router.refresh()` re-runs
 * the server layout that resolves the language, so if the write has not landed the page
 * comes back in the old language and the control looks broken.
 */
export function LanguageSwitcher({
  variant = 'menu',
  className,
}: {
  /** `menu` is the compact header control; `field` is the labelled row in Settings. */
  variant?: 'menu' | 'field';
  className?: string;
}) {
  const current = useLocale();
  const copy = useCopy();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [failed, setFailed] = useState(false);

  const choose = async (locale: Locale) => {
    if (locale === current || pending) return;
    setFailed(false);

    try {
      const response = await fetch('/api/account/locale', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ locale }),
      });
      if (!response.ok) throw new Error(String(response.status));
    } catch {
      setFailed(true);
      return;
    }

    startTransition(() => router.refresh());
  };

  if (variant === 'field') {
    return (
      <div className={className}>
        <div role="radiogroup" aria-label={copy.common.language} className="flex flex-wrap gap-2">
          {LOCALES.map((locale) => (
            <button
              key={locale}
              type="button"
              role="radio"
              aria-checked={locale === current}
              disabled={pending}
              onClick={() => void choose(locale)}
              className={cn(
                'cursor-pointer rounded-lg border px-3.5 py-2 text-sm font-medium transition-colors disabled:opacity-60',
                locale === current
                  ? 'border-brand-600 bg-brand-600 text-white'
                  : 'border-ink-200 bg-white text-ink-700 hover:border-brand-300 hover:text-brand-700',
              )}
            >
              {LOCALE_META[locale].label}
            </button>
          ))}
        </div>
        {failed ? (
          <p role="alert" className="mt-2 text-sm text-danger-700">
            {copy.common.somethingWentWrong}
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <div className={cn('flex items-center gap-1', className)}>
      <span className="sr-only">{copy.common.language}</span>
      {LOCALES.map((locale) => (
        <button
          key={locale}
          type="button"
          lang={locale}
          aria-current={locale === current ? 'true' : undefined}
          // The visible label is the two-letter tag, which is not enough on its own —
          // "DE" read aloud is a letter pair, not a language.
          aria-label={LOCALE_META[locale].label}
          disabled={pending}
          onClick={() => void choose(locale)}
          className={cn(
            'cursor-pointer rounded-md px-2 py-1 text-xs font-semibold uppercase transition-colors disabled:opacity-60',
            locale === current
              ? 'bg-ink-900 text-white'
              : 'text-ink-500 hover:bg-ink-100 hover:text-ink-900',
          )}
        >
          {locale}
        </button>
      ))}
    </div>
  );
}
