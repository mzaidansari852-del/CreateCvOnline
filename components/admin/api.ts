/**
 * Tiny fetch wrapper for the admin console's mutations.
 *
 * Every admin API route answers with the shared `{ error: { code, message } }` envelope
 * from `lib/api/handler.ts`, so one helper can surface a useful message in a toast
 * instead of every component re-implementing error handling.
 */

export type AdminApiResult = { ok: true } | { ok: false; message: string };

interface ErrorEnvelope {
  error?: { code?: unknown; message?: unknown };
}

function messageFrom(payload: unknown, status: number): string {
  const envelope = payload as ErrorEnvelope | null;
  const message = envelope?.error?.message;
  if (typeof message === 'string' && message.trim()) return message;
  return `The server rejected the request (HTTP ${status}).`;
}

export async function adminRequest(
  url: string,
  init: { method: 'POST' | 'DELETE'; body?: unknown },
): Promise<AdminApiResult> {
  try {
    const response = await fetch(url, {
      method: init.method,
      headers: init.body === undefined ? undefined : { 'Content-Type': 'application/json' },
      body: init.body === undefined ? undefined : JSON.stringify(init.body),
    });

    const payload: unknown = await response.json().catch(() => null);
    if (!response.ok) return { ok: false, message: messageFrom(payload, response.status) };
    return { ok: true };
  } catch {
    return { ok: false, message: 'Could not reach the server. Check your connection and retry.' };
  }
}
