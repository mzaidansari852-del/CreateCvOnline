'use client';

import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Alert, Badge } from '@/components/ui/feedback';
import { Field, Input, Select, Textarea } from '@/components/ui/form';
import { useToast } from '@/components/ui/toast';
import { AdminTable, TableEmptyRow, Td, Th } from '@/components/admin/primitives';
import { Panel } from '@/components/ui/card';
import type { PromoCode } from '@/types/promo';

/**
 * Create and manage promo codes.
 *
 * The list is server-rendered and passed in; this component owns the form and mutates the
 * list in place after a successful call, so creating a code shows it immediately without a
 * round trip through the router.
 */

function formatWindow(code: PromoCode): string {
  const day = (iso: string) => new Date(iso).toISOString().slice(0, 10);
  if (code.startsAt && code.expiresAt) return `${day(code.startsAt)} → ${day(code.expiresAt)}`;
  if (code.expiresAt) return `until ${day(code.expiresAt)}`;
  if (code.startsAt) return `from ${day(code.startsAt)}`;
  return 'Always open';
}

/**
 * What the code is doing *right now*, which is not the same as whether it is active.
 *
 * A code can be active, unexpired and still refuse everyone because it has not opened yet
 * or has run out. Four separate fields say that; one badge is what an admin actually reads.
 */
function status(code: PromoCode): { label: string; tone: 'success' | 'warning' | 'neutral' } {
  const now = Date.now();
  if (!code.active) return { label: 'Off', tone: 'neutral' };
  if (code.startsAt && now < new Date(code.startsAt).getTime()) {
    return { label: 'Scheduled', tone: 'warning' };
  }
  if (code.expiresAt && now >= new Date(code.expiresAt).getTime()) {
    return { label: 'Expired', tone: 'neutral' };
  }
  if (code.maxRedemptions !== null && code.redemptionCount >= code.maxRedemptions) {
    return { label: 'Used up', tone: 'neutral' };
  }
  return { label: 'Live', tone: 'success' };
}

export function PromoManager({ initialCodes }: { initialCodes: PromoCode[] }) {
  const toast = useToast();
  const [codes, setCodes] = useState(initialCodes);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [code, setCode] = useState('');
  const [plan, setPlan] = useState<'pro' | 'lifetime'>('pro');
  const [days, setDays] = useState('');
  const [maxRedemptions, setMaxRedemptions] = useState('');
  const [startsAt, setStartsAt] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [note, setNote] = useState('');

  async function create(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!code.trim()) {
      setError('Give the code a name.');
      return;
    }

    setBusy(true);
    try {
      const response = await fetch('/api/admin/promo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: code.trim(),
          plan,
          days: days.trim() ? Number(days) : null,
          maxRedemptions: maxRedemptions.trim() ? Number(maxRedemptions) : null,
          startsAt: startsAt || null,
          expiresAt: expiresAt || null,
          note: note.trim(),
        }),
      });

      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        const message = payload?.error?.message ?? 'Could not create that code.';
        setError(message);
        toast.error('Not created', message);
        return;
      }

      setCodes((current) => [payload.code as PromoCode, ...current]);
      toast.success('Code created', `${payload.code.code} is ready to share.`);
      setCode('');
      setDays('');
      setMaxRedemptions('');
      setStartsAt('');
      setExpiresAt('');
      setNote('');
    } finally {
      setBusy(false);
    }
  }

  async function toggle(target: PromoCode) {
    const next = !target.active;
    const response = await fetch('/api/admin/promo', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: target.code, active: next }),
    });

    if (!response.ok) {
      toast.error('Could not change that code', 'Please try again.');
      return;
    }

    setCodes((current) =>
      current.map((entry) => (entry.code === target.code ? { ...entry, active: next } : entry)),
    );
    toast.success(next ? 'Code switched on' : 'Code switched off', target.code);
  }

  return (
    <div className="space-y-8">
      <Panel
        title="Create a code"
        description="A code grants a plan outright — the person redeeming it never sees a checkout and never enters a card. Leave a field blank to leave it unlimited."
      >
        <form onSubmit={create} className="flex flex-col gap-5">
          {error ? (
            <Alert tone="danger" title="Not created">
              {error}
            </Alert>
          ) : null}

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Code" required hint="Letters, numbers and hyphens. Not case-sensitive.">
              {({ id, describedBy }) => (
                <Input
                  id={id}
                  value={code}
                  placeholder="LINKEDIN-2026"
                  maxLength={32}
                  aria-describedby={describedBy}
                  onChange={(event) => setCode(event.target.value)}
                />
              )}
            </Field>

            <Field label="Grants" required>
              {({ id }) => (
                <Select
                  id={id}
                  value={plan}
                  onChange={(event) => setPlan(event.target.value as 'pro' | 'lifetime')}
                >
                  <option value="pro">Pro</option>
                  <option value="lifetime">Lifetime</option>
                </Select>
              )}
            </Field>

            <Field
              label="Access days"
              hint="Blank uses the plan's own window. Ignored for Lifetime."
            >
              {({ id, describedBy }) => (
                <Input
                  id={id}
                  type="number"
                  min={1}
                  max={3650}
                  value={days}
                  placeholder="e.g. 90"
                  aria-describedby={describedBy}
                  onChange={(event) => setDays(event.target.value)}
                />
              )}
            </Field>

            <Field label="Max redemptions" hint="Blank is unlimited.">
              {({ id, describedBy }) => (
                <Input
                  id={id}
                  type="number"
                  min={1}
                  value={maxRedemptions}
                  placeholder="e.g. 50"
                  aria-describedby={describedBy}
                  onChange={(event) => setMaxRedemptions(event.target.value)}
                />
              )}
            </Field>

            <Field label="Opens" hint="Blank means it works immediately.">
              {({ id, describedBy }) => (
                <Input
                  id={id}
                  type="date"
                  value={startsAt}
                  aria-describedby={describedBy}
                  onChange={(event) => setStartsAt(event.target.value)}
                />
              )}
            </Field>

            <Field label="Closes" hint="Works to the end of this day. Blank never expires.">
              {({ id, describedBy }) => (
                <Input
                  id={id}
                  type="date"
                  value={expiresAt}
                  aria-describedby={describedBy}
                  onChange={(event) => setExpiresAt(event.target.value)}
                />
              )}
            </Field>
          </div>

          <Field
            label="Note"
            hint="Admin only. What this code is for, so a stale one can be judged later."
          >
            {({ id, describedBy }) => (
              <Textarea
                id={id}
                rows={2}
                maxLength={280}
                value={note}
                placeholder="LinkedIn launch post, 90 days Pro"
                aria-describedby={describedBy}
                onChange={(event) => setNote(event.target.value)}
              />
            )}
          </Field>

          <div>
            <Button type="submit" loading={busy}>
              Create code
            </Button>
          </div>
        </form>
      </Panel>

      <Panel
        title="Codes"
        description="Switching a code off stops it immediately. Codes are never deleted — the redemption record is the only audit trail a comped account has."
        bodyClassName="p-0"
      >
        <AdminTable minWidth={760}>
          <thead>
            <tr>
              <Th sticky>Code</Th>
              <Th>Status</Th>
              <Th>Grants</Th>
              <Th>Window</Th>
              <Th align="right">Used</Th>
              <Th align="right">Action</Th>
            </tr>
          </thead>
          <tbody>
            {codes.length === 0 ? (
              <TableEmptyRow colSpan={6}>No codes yet.</TableEmptyRow>
            ) : (
              codes.map((entry) => {
                const state = status(entry);
                return (
                  <tr key={entry.code}>
                    <Td sticky>
                      <span className="font-mono text-[13px] font-semibold text-ink-950">
                        {entry.code}
                      </span>
                      {entry.note ? (
                        <span className="mt-0.5 block max-w-[26ch] truncate text-xs text-ink-500">
                          {entry.note}
                        </span>
                      ) : null}
                    </Td>
                    <Td>
                      <Badge tone={state.tone}>{state.label}</Badge>
                    </Td>
                    <Td className="whitespace-nowrap text-ink-700">
                      {entry.plan === 'lifetime' ? 'Lifetime' : 'Pro'}
                      {entry.days ? ` · ${entry.days}d` : ''}
                    </Td>
                    <Td className="whitespace-nowrap text-ink-600">{formatWindow(entry)}</Td>
                    <Td align="right" className="tabular-nums text-ink-700">
                      {entry.redemptionCount}
                      {entry.maxRedemptions === null ? '' : ` / ${entry.maxRedemptions}`}
                    </Td>
                    <Td align="right">
                      <Button size="sm" variant="outline" onClick={() => void toggle(entry)}>
                        {entry.active ? 'Switch off' : 'Switch on'}
                      </Button>
                    </Td>
                  </tr>
                );
              })
            )}
          </tbody>
        </AdminTable>
      </Panel>
    </div>
  );
}
