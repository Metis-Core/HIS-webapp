export enum LedgerEndpointEnum {
  INVOICES = '/invoices',
  INVOICE_BY_VISIT = '/invoices/visit',
  PAYMENTS = '/payments',
  DAY_CLOSINGS = '/day-closings',
}

export enum PaymentMethodEnum {
  CASH = 'cash',
  MOBILE_MONEY = 'mobile_money',
  CARD = 'card',
  INSURANCE = 'insurance',
}

export enum PaymentStatusEnum {
  RECORDED = 'recorded',
  VOIDED = 'voided',
}

export enum InvoiceStatusEnum {
  UNPAID = 'unpaid',
  PARTIALLY_PAID = 'partially_paid',
  PAID = 'paid',
}

export enum OrderEndpointEnum {
  BASE = '/orders',
}

export enum OrderKindEnum {
  RADIOLOGY = 'radiology',
  SURGERY = 'surgery',
}

export enum OrderStatusEnum {
  REQUESTED = 'requested',
  SCHEDULED = 'scheduled',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum OrderPriorityEnum {
  ROUTINE = 'routine',
  URGENT = 'urgent',
  EMERGENCY = 'emergency',
}
