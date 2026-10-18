'use client';

import { Pill } from '@/components';
import type { InvoiceStatusEnum, PaymentStatusEnum } from '@/enum';
import {
  INVOICE_STATUS_ICON,
  INVOICE_STATUS_LABEL,
  INVOICE_STATUS_VARIANT,
  PAYMENT_STATUS_ICON,
  PAYMENT_STATUS_VARIANT,
} from './billing-format';

export function InvoiceStatusPill({ status }: { status: InvoiceStatusEnum }) {
  const Icon = INVOICE_STATUS_ICON[status];
  return (
    <Pill variant={INVOICE_STATUS_VARIANT[status]} icon={<Icon aria-hidden className="h-3 w-3" />}>
      {INVOICE_STATUS_LABEL[status]}
    </Pill>
  );
}

export function PaymentStatusPill({ status }: { status: PaymentStatusEnum }) {
  const Icon = PAYMENT_STATUS_ICON[status];
  return (
    <Pill variant={PAYMENT_STATUS_VARIANT[status]} icon={<Icon aria-hidden className="h-3 w-3" />}>
      {status}
    </Pill>
  );
}
