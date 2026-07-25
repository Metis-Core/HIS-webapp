export enum InvoiceStatusEnum {
  PENDING = 'pending',
  PAID = 'paid',
  PARTIALLY_PAID = 'partially-paid',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
}

export enum InvoiceTypeEnum {
  INVOICE = 'invoice',
  CREDIT_NOTE = 'credit-note',
  DEBIT_NOTE = 'debit-note',
}
