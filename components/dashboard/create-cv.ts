'use client';

import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';

import { useToast } from '@/components/ui/toast';
import { apiRequest, useApiErrorToast } from './api';
import { readPreferences } from './preferences';
import { trackEvent } from '@/lib/analytics/events';
import type { DashboardCopy } from '@/lib/i18n/copy/dashboard';
import type { CVDocument } from '@/types/cv';

/**
 * Creating a CV, from anywhere in the dashboard.
 *
 * `POST /api/cvs` decides the template and the starter content; the saved paper-size
 * preference is then applied with a follow-up `PATCH`, because the create endpoint takes
 * no customization. The second call is best-effort: a CV that exists on A4 when the user
 * wanted Letter is a nuisance, but losing the CV over it would be worse.
 *
 * Its toasts are supplied by the caller rather than read from a hook here, so that the
 * strings this raises are visible at the three components that raise them.
 */

export interface CreateCVInput {
  title?: string;
  templateId?: string;
  starter: 'blank' | 'sample';
}

export interface CreateCVResult {
  create: (input: CreateCVInput) => Promise<void>;
  creating: boolean;
}

/** Pass `copy.cvs` from a component that has `useCopy()`. */
export function useCreateCV(copy: DashboardCopy['cvs']): CreateCVResult {
  const router = useRouter();
  const toast = useToast();
  const showError = useApiErrorToast();
  const [creating, setCreating] = useState(false);

  const create = useCallback(
    async (input: CreateCVInput) => {
      setCreating(true);
      try {
        const preferences = readPreferences();
        const { cv } = await apiRequest<{ cv: CVDocument }>('/api/cvs', {
          method: 'POST',
          body: JSON.stringify({
            title: input.title?.trim() || undefined,
            templateId: input.templateId,
            starter: input.starter,
          }),
        });

        if (cv.customization.paperSize !== preferences.paperSize) {
          await apiRequest(`/api/cvs/${cv.id}`, {
            method: 'PATCH',
            body: JSON.stringify({
              customization: { ...cv.customization, paperSize: preferences.paperSize },
            }),
          }).catch(() => undefined);
        }

        trackEvent('cv_created', {
          template_id: cv.customization.templateId,
          starter: input.starter,
        });
        toast.success(
          copy.createdTitle,
          input.starter === 'sample' ? copy.createdExampleBody : copy.createdBlankBody,
        );
        router.push(`/dashboard/cvs/${cv.id}/edit`);
        router.refresh();
      } catch (error) {
        showError(error, copy.createFailed);
      } finally {
        setCreating(false);
      }
    },
    [router, toast, showError, copy],
  );

  return { create, creating };
}
