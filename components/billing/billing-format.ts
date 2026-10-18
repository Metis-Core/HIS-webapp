import type { IconType } from 'react-icons';
import { FaBan, FaCheckCircle, FaHourglassHalf } from 'react-icons/fa';
import { InvoiceStatusEnum, PaymentMethodEnum, PaymentStatusEnum, PillVariantEnum } from '@/enum';

export const formatUGX = (value: number) => `UGX ${value.toLocaleString('en-US')}`;

/** A price or charge line: 0 is a free service, not a missing price. */
export const formatFee = (value: number) => (value === 0 ? 'Free' : formatUGX(value));

export const formatDay = (iso: string) =>
  new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

export const formatDateTime = (iso: string) =>
  new Date(iso).toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });

export const INVOICE_STATUS_LABEL: Record<InvoiceStatusEnum, string> = {
  [InvoiceStatusEnum.UNPAID]: 'Unpaid',
  [InvoiceStatusEnum.PARTIALLY_PAID]: 'Part paid',
  [InvoiceStatusEnum.PAID]: 'Paid',
};

export const INVOICE_STATUS_VARIANT: Record<InvoiceStatusEnum, PillVariantEnum> = {
  [InvoiceStatusEnum.UNPAID]: PillVariantEnum.WARNING,
  [InvoiceStatusEnum.PARTIALLY_PAID]: PillVariantEnum.INFO,
  [InvoiceStatusEnum.PAID]: PillVariantEnum.SUCCESS,
};

export const INVOICE_STATUS_ICON: Record<InvoiceStatusEnum, IconType> = {
  [InvoiceStatusEnum.UNPAID]: FaHourglassHalf,
  [InvoiceStatusEnum.PARTIALLY_PAID]: FaHourglassHalf,
  [InvoiceStatusEnum.PAID]: FaCheckCircle,
};

export const METHOD_LABEL: Record<PaymentMethodEnum, string> = {
  [PaymentMethodEnum.CASH]: 'Cash',
  [PaymentMethodEnum.MOBILE_MONEY]: 'Mobile money',
  [PaymentMethodEnum.CARD]: 'Card',
  [PaymentMethodEnum.INSURANCE]: 'Insurance',
};

export const REFERENCE_REQUIRED: readonly PaymentMethodEnum[] = [
  PaymentMethodEnum.MOBILE_MONEY,
  PaymentMethodEnum.CARD,
  PaymentMethodEnum.INSURANCE,
];

export const PAYMENT_STATUS_VARIANT: Record<PaymentStatusEnum, PillVariantEnum> = {
  [PaymentStatusEnum.RECORDED]: PillVariantEnum.SUCCESS,
  [PaymentStatusEnum.VOIDED]: PillVariantEnum.DANGER,
};

export const PAYMENT_STATUS_ICON: Record<PaymentStatusEnum, IconType> = {
  [PaymentStatusEnum.RECORDED]: FaCheckCircle,
  [PaymentStatusEnum.VOIDED]: FaBan,
};

export const todayInput = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
};
