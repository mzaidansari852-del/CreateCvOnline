'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';

import { useToast } from '@/components/ui/toast';
import { trackEvent } from '@/lib/analytics/events';

/**
 * The dashboard's single door to the REST API.
 *
 * Every write in the dashboard goes through here so that the three things that matter
 * are handled once rather than at twenty call sites: the `{ error: { code, message } }`
 * envelope is unwrapped, a `402` keeps hold of its `upgradeUrl`, and a network failure
 * becomes a sentence a person can act on instead of a raw `TypeError`.
 */

export class ApiRequestError extends Error {
  readonly status: number;
  readonly code: string;
  /** Where to send the user to lift the limit. Only set for `402` responses. */
  readonly upgradeUrl: string | null;

  constructor(status: number, code: string, message: string, upgradeUrl: string | null = null) {
    super(message);
    this.name = 'ApiRequestError';
    this.status = status;
    this.code = code;
    this.upgradeUrl = upgradeUrl;
  }

  /** True when the request was refused because of the user's plan. */
  get isEntitlement(): boolean {
    return this.status === 402;
  }
}

interface ErrorEnvelope {
  error?: { code?: unknown; message?: unknown; details?: unknown };
}

function upgradeUrlFrom(details: unknown): string | null {
  if (details && typeof details === 'object' && 'upgradeUrl' in details) {
    const value = (details as { upgradeUrl: unknown }).upgradeUrl;
    if (typeof value === 'string' && value.length > 0) return value;
  }
  return null;
}

/** Reads the standard error envelope off a failed response. Never throws. */
export async function readApiError(response: Response): Promise<ApiRequestError> {
  const body = (await response.json().catch(() => null)) as ErrorEnvelope | null;
  const code = typeof body?.error?.code === 'string' ? body.error.code : 'request-failed';
  const message =
    typeof body?.error?.message === 'string' && body.error.message.length > 0
      ? body.error.message
      : `The server refused that request (${response.status}).`;

  return new ApiRequestError(response.status, code, message, upgradeUrlFrom(body?.error?.details));
}

export async function apiRequest<T>(url: string, init: RequestInit = {}): Promise<T> {
  let response: Response;
  try {
    response = await fetch(url, {
      credentials: 'same-origin',
      ...init,
      headers: {
        ...(init.body ? { 'Content-Type': 'application/json' } : {}),
        ...init.headers,
      },
    });
  } catch {
    throw new ApiRequestError(
      0,
      'network',
      'Network problem — check your connection and try again.',
    );
  }

  if (!response.ok) throw await readApiError(response);
  return (await response.json()) as T;
}

/**
 * Downloads a CV as a PDF.
 *
 * The endpoint answers with either a file or a JSON error, so the content type decides
 * how the response is read. The blob is handed to a temporary anchor because that is the
 * only way to keep the server's `Content-Disposition` filename.
 */
export async function downloadCVPdf(cvId: string, fallbackName: string): Promise<void> {
  let response: Response;
  try {
    response = await fetch(`/api/cvs/${cvId}/pdf`, { credentials: 'same-origin' });
  } catch {
    throw new ApiRequestError(0, 'network', 'Network problem — check your connection and try again.');
  }

  if (!response.ok) throw await readApiError(response);

  const disposition = response.headers.get('Content-Disposition') ?? '';
  const match = /filename="([^"]+)"/.exec(disposition);
  const filename = match?.[1] ?? `${fallbackName || 'cv'}.pdf`;

  const blob = await response.blob();
  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = objectUrl;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  // Revoking immediately can cancel the download in Safari.
  setTimeout(() => URL.revokeObjectURL(objectUrl), 4000);
}

/**
 * Turns any thrown error into a toast.
 *
 * A `402` is never shown as a generic failure: the server's own sentence is displayed
 * verbatim next to an Upgrade action pointing at the URL the server supplied.
 */
export function useApiErrorToast(): (error: unknown, fallbackTitle: string) => void {
  const toast = useToast();
  const router = useRouter();

  return useCallback(
    (error: unknown, fallbackTitle: string) => {
      if (error instanceof ApiRequestError) {
        if (error.isEntitlement) {
          const target = error.upgradeUrl ?? '/pricing';
          trackEvent('upgrade_prompt_shown', { reason: error.code });
          toast.push({
            title: 'You have reached a plan limit',
            description: error.message,
            tone: 'warning',
            durationMs: 12000,
            action: { label: 'See Pro plans', onClick: () => router.push(target) },
          });
          return;
        }
        toast.error(fallbackTitle, error.message);
        return;
      }
      toast.error(
        fallbackTitle,
        error instanceof Error && error.message ? error.message : 'Please try again.',
      );
    },
    [toast, router],
  );
}

/** Copies text and reports whether it worked, so the caller can toast honestly. */
export async function copyToClipboard(value: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(value);
    return true;
  } catch {
    return false;
  }
}
