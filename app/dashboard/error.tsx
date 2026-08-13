'use client';

import { useEffect } from 'react';
import { RefreshCw } from 'lucide-react';

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
  useEffect(() => {
    console.error('[dashboard]', error);
  }, [error]);

  return (
    <div className="grid min-h-dvh place-items-center p-6">
      <div className="w-full max-w-lg">
        <EmptyState
          title="That page did not load"
          description={
            error.digest
              ? `Something went wrong on our side. Quote reference ${error.digest} if you contact support.`
              : 'Something went wrong on our side. Your CVs are safe — nothing was changed.'
          }
          action={
            <Button onClick={retry} leadingIcon={<RefreshCw size={15} aria-hidden />}>
              Try again
            </Button>
          }
          secondaryAction={
            <ButtonLink href="/dashboard" variant="outline">
              Back to the dashboard
            </ButtonLink>
          }
        />
        <p className="mt-4 text-center text-xs text-ink-500">
          If it keeps happening, e-mail {site.supportEmail}.
        </p>
      </div>
    </div>
  );
}
