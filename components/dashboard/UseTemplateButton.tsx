'use client';

import { Lock, Plus } from 'lucide-react';

import { Button, ButtonLink } from '@/components/ui/button';
import { useCreateCV } from './create-cv';
import { trackEvent } from '@/lib/analytics/events';

/**
 * "Use this template" on the in-app template browser.
 *
 * For a Pro template on a free plan the button is replaced rather than disabled: a
 * disabled control tells you nothing, while an Upgrade link tells you exactly what to do
 * about it. The server refuses the same combination independently.
 */
export function UseTemplateButton({
  templateId,
  templateName,
  premium,
  canUsePremium,
  fullWidth = true,
}: {
  templateId: string;
  templateName: string;
  premium: boolean;
  canUsePremium: boolean;
  fullWidth?: boolean;
}) {
  const { create, creating } = useCreateCV();

  if (premium && !canUsePremium) {
    return (
      <ButtonLink
        href="/pricing"
        size="sm"
        variant="outline"
        fullWidth={fullWidth}
        leadingIcon={<Lock size={14} aria-hidden />}
        aria-label={`${templateName} is a Pro template — see plans`}
      >
        Unlock with Pro
      </ButtonLink>
    );
  }

  return (
    <Button
      size="sm"
      variant="outline"
      fullWidth={fullWidth}
      loading={creating}
      leadingIcon={<Plus size={14} aria-hidden />}
      onClick={() => {
        trackEvent('template_selected', { template_id: templateId, source: 'dashboard-templates' });
        void create({ starter: 'blank', templateId });
      }}
    >
      Use template
    </Button>
  );
}
