'use client';

import { useEffect } from 'react';
import { RefreshCw } from 'lucide-react';

import { useCopy } from '@/components/i18n/LocaleProvider';
import { Button, ButtonLink } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/feedback';
import { site } from '@/lib/site';

/**
 * The dashboard's error boundary.
 *
 * Shows the digest rather than the message: the message may be an internal one, whereas
 * the digest is the string support needs to find the failure in the logs.
 */
export default function DashboardError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  // The dashboard layout resolved the language before this boundary was ever reachable,
  // so the provider is always above it and the fallback to English never applies here.
  const copy = useCopy();

  useEffect(() => {
    console.error('[dashboard]', error);
  }, [error]);

  return (
    <div className="grid min-h-dvh place-items-center p-6">
      <div className="w-full max-w-lg">
        <EmptyState
          title={copy.dashboard.errorTitle}
          description={
            error.digest ? copy.dashboard.errorBodyWithRef(error.digest) : copy.dashboard.errorBody
          }
          action={
            <Button onClick={retry} leadingIcon={<RefreshCw size={15} aria-hidden />}>
              {copy.common.retry}
            </Button>
          }
          secondaryAction={
            <ButtonLink href="/dashboard" variant="outline">
              {copy.dashboard.backToDashboard}
            </ButtonLink>
          }
        />
        <p className="mt-4 text-center text-xs text-ink-500">
          {copy.dashboard.errorSupport(site.supportEmail)}
        </p>
      </div>
    </div>
  );
}
