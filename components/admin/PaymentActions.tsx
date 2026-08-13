'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { adminRequest } from './api';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/modal';
import { useToast } from '@/components/ui/toast';
import type { PaymentStatus } from '@/types/payment';

/**
 * "Mark as refunded" for a single order.
 *
 * This only rewrites the status on our own ledger document — it does not call PayPal and
 * no money moves. The dialog says so, because an operator who assumes otherwise will
 * leave a customer unrefunded.
 */
export function PaymentActions({
  orderId,
  userId,
  status,
  amount,
  currency,
}: {
  orderId: string;
  userId: string;
  status: PaymentStatus;
  amount: string;
  currency: string;
}) {
  const router = useRouter();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);

  if (status === 'refunded') {
    return <span className="text-xs text-ink-500">Already refunded</span>;
  }

  if (status !== 'completed') {
    // Nothing was captured, so there is nothing to refund. Say that instead of
    // shipping a greyed-out button with no explanation.
    return <span className="text-xs text-ink-500">Not captured</span>;
  }

  const confirm = async () => {
    setPending(true);
    const result = await adminRequest(`/api/admin/payments/${encodeURIComponent(orderId)}`, {
      method: 'POST',
      body: { userId, status: 'refunded' },
    });
    setPending(false);

    if (!result.ok) {
      toast.error('Could not update the order', result.message);
      return;
    }

    setOpen(false);
    toast.success('Order marked as refunded', 'Issue the actual refund in PayPal.');
    router.refresh();
  };

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        Mark refunded
      </Button>

      <ConfirmDialog
        open={open}
        loading={pending}
        onClose={() => setOpen(false)}
        onConfirm={confirm}
        title="Mark this order as refunded?"
        description={`This records ${amount} ${currency} as refunded on order ${orderId} in our ledger only. It does not contact PayPal and it does not move any money — issue the refund in the PayPal dashboard as well, or the customer will not get it. The account's plan is left untouched; change it separately if access should end.`}
        confirmLabel="Mark as refunded"
      />
    </>
  );
}
