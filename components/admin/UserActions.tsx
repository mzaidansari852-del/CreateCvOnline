'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { adminRequest } from './api';
import { Button } from '@/components/ui/button';
import { Field, Input, Select } from '@/components/ui/form';
import { ConfirmDialog, Modal } from '@/components/ui/modal';
import { DropdownMenu, type MenuItem } from '@/components/ui/overlays';
import { useToast } from '@/components/ui/toast';
import { PLAN_ORDER, PLANS } from '@/lib/plans';
import { cn } from '@/lib/utils/cn';
import type { PlanId, UserRole } from '@/types/user';

/** Only send `days` when the operator typed a usable whole number; blank means default. */
function customDays(raw: string): { days?: number } {
  const trimmed = raw.trim();
  if (!trimmed) return {};
  const parsed = Number(trimmed);
  if (!Number.isInteger(parsed) || parsed < 1) return {};
  return { days: parsed };
}

/**
 * Row actions for a user: open the detail page, grant or revoke administrator access,
 * change the plan, or delete the account outright.
 *
 * Everything destructive goes through a confirmation dialog, reports the outcome in a
 * toast and then calls `router.refresh()` so the server-rendered table reflects reality
 * rather than an optimistic guess.
 *
 * The two self-lockout cases — an operator revoking their own admin claim, or deleting
 * their own account — are refused by the API routes. The menu says so plainly instead of
 * offering a button that will fail.
 */
export function UserActions({
  uid,
  email,
  role,
  planId,
  isSelf,
  afterDelete = 'refresh',
}: {
  uid: string;
  email: string;
  role: UserRole;
  planId: PlanId;
  isSelf: boolean;
  /** The detail page has nowhere to return to once the account is gone. */
  afterDelete?: 'refresh' | 'list';
}) {
  const router = useRouter();
  const toast = useToast();

  const [pending, setPending] = useState(false);
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [planDialogOpen, setPlanDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [nextPlan, setNextPlan] = useState<PlanId>(planId);
  const [days, setDays] = useState('');

  const label = email || uid;
  const nextRole: UserRole = role === 'admin' ? 'user' : 'admin';

  const run = async (
    action: () => Promise<{ ok: true } | { ok: false; message: string }>,
    success: string,
    onDone?: () => void,
  ) => {
    setPending(true);
    const result = await action();
    setPending(false);

    if (!result.ok) {
      toast.error('That did not work', result.message);
      return;
    }

    toast.success(success);
    onDone?.();
    router.refresh();
  };

  const items: MenuItem[] = [
    { label: 'View account', onSelect: () => router.push(`/admin/users/${uid}`) },
    { label: 'Change plan…', onSelect: () => setPlanDialogOpen(true), separatorBefore: true },
  ];

  if (isSelf) {
    items.push({
      label: 'Own account — role and deletion locked',
      disabled: true,
      separatorBefore: true,
    });
  } else {
    items.push({
      label: role === 'admin' ? 'Revoke administrator' : 'Grant administrator',
      onSelect: () => setRoleDialogOpen(true),
    });
    items.push({
      label: 'Delete account…',
      tone: 'danger',
      separatorBefore: true,
      onSelect: () => setDeleteDialogOpen(true),
    });
  }

  return (
    <>
      <DropdownMenu
        ariaLabel={`Actions for ${label}`}
        items={items}
        className="flex justify-end"
        trigger={({ open }) => (
          // `DropdownMenu` supplies the real <button>; this is only its appearance.
          <span
            className={cn(
              'grid size-8 place-items-center rounded-lg border border-ink-200 text-ink-600 transition-colors',
              open ? 'border-ink-300 bg-ink-100 text-ink-900' : 'hover:bg-ink-50',
            )}
          >
            <svg viewBox="0 0 24 24" className="size-4" fill="currentColor" aria-hidden>
              <circle cx="5" cy="12" r="1.7" />
              <circle cx="12" cy="12" r="1.7" />
              <circle cx="19" cy="12" r="1.7" />
            </svg>
          </span>
        )}
      />

      <ConfirmDialog
        open={roleDialogOpen}
        loading={pending}
        onClose={() => setRoleDialogOpen(false)}
        onConfirm={() =>
          run(
            () =>
              adminRequest(`/api/admin/users/${uid}/role`, {
                method: 'POST',
                body: { role: nextRole },
              }),
            nextRole === 'admin'
              ? `${label} is now an administrator`
              : `Administrator access removed from ${label}`,
            () => setRoleDialogOpen(false),
          )
        }
        tone={nextRole === 'admin' ? 'primary' : 'danger'}
        title={nextRole === 'admin' ? 'Grant administrator access?' : 'Revoke administrator access?'}
        description={
          nextRole === 'admin'
            ? `${label} will be able to read every account, change plans and delete users. Their existing sessions are revoked, so the change takes effect on their next request.`
            : `${label} will lose access to this console. Their existing sessions are revoked, so the change takes effect immediately.`
        }
        confirmLabel={nextRole === 'admin' ? 'Grant access' : 'Revoke access'}
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        loading={pending}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={() =>
          run(
            () => adminRequest(`/api/admin/users/${uid}`, { method: 'DELETE' }),
            `${label} was deleted`,
            () => {
              setDeleteDialogOpen(false);
              if (afterDelete === 'list') router.push('/admin/users');
            },
          )
        }
        title="Delete this account permanently?"
        description={`Deletes the sign-in record for ${label}, their profile, every CV they have saved and their payment history. This cannot be undone, and it does not refund anything.`}
        confirmLabel="Delete account"
      />

      <Modal
        open={planDialogOpen}
        onClose={() => (pending ? undefined : setPlanDialogOpen(false))}
        title="Change plan"
        description={`Sets the entitlement on ${label} directly. No payment is taken and no invoice is created — use this for support fixes and comped accounts.`}
        size="sm"
        dismissOnBackdrop={!pending}
        footer={
          <>
            <Button variant="outline" onClick={() => setPlanDialogOpen(false)} disabled={pending}>
              Cancel
            </Button>
            <Button
              loading={pending}
              onClick={() =>
                void run(
                  () =>
                    adminRequest(`/api/admin/users/${uid}/plan`, {
                      method: 'POST',
                      body: { planId: nextPlan, ...customDays(days) },
                    }),
                  `${label} is now on ${PLANS[nextPlan].name}`,
                  () => setPlanDialogOpen(false),
                )
              }
            >
              Apply plan
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Field label="Plan">
            {({ id }) => (
              <Select
                id={id}
                value={nextPlan}
                onChange={(event) => setNextPlan(event.target.value as PlanId)}
              >
                {PLAN_ORDER.map((planOption) => (
                  <option key={planOption} value={planOption}>
                    {PLANS[planOption].name}
                  </option>
                ))}
              </Select>
            )}
          </Field>

          {nextPlan === 'free' ? (
            <p className="text-sm leading-relaxed text-ink-600">
              Moving an account to Free clears the access period and sets the entitlement
              status back to <span className="font-medium">none</span>. Their CVs are kept;
              only the limits change.
            </p>
          ) : (
            <Field
              label="Days of access"
              hint={
                PLANS[nextPlan].accessDays === null
                  ? 'Leave blank for no expiry, which is what a Lifetime purchase grants.'
                  : `Leave blank to use the plan default of ${PLANS[nextPlan].accessDays} days.`
              }
            >
              {({ id, describedBy }) => (
                <Input
                  id={id}
                  aria-describedby={describedBy}
                  type="number"
                  min={1}
                  max={3650}
                  inputMode="numeric"
                  placeholder={
                    PLANS[nextPlan].accessDays === null
                      ? 'No expiry'
                      : String(PLANS[nextPlan].accessDays)
                  }
                  value={days}
                  onChange={(event) => setDays(event.target.value)}
                />
              )}
            </Field>
          )}
        </div>
      </Modal>
    </>
  );
}
