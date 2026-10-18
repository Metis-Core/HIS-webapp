import type {
  InvoiceStatusEnum,
  OrderKindEnum,
  OrderPriorityEnum,
  OrderStatusEnum,
  PaymentMethodEnum,
  PaymentStatusEnum,
} from '@/enum';
import type { ChargeSourceEnum } from '@/enum/billing.enum';
import type { IBaseEntity, IPageQuery } from './base.interface';
import type { IPatient } from './patient.interface';
import type { IUser } from './user.interface';
import type { IService } from './service.interface';
import type { IVisitCharge } from './billing.interface';

export interface IInvoice extends IBaseEntity {
  number: string;
  visitId: string;
  patientId: string;
  patient?: IPatient;
  status: InvoiceStatusEnum;
  total: number;
  paid: number;
  settledAt: string | null;
}

export interface IPayment extends IBaseEntity {
  receiptNumber: string;
  invoiceId: string;
  invoice?: IInvoice;
  amount: number;
  method: PaymentMethodEnum;
  reference: string | null;
  status: PaymentStatusEnum;
  receivedAt: string;
  businessDate: string;
  receivedBy?: Pick<IUser, 'id' | 'username'>;
  voidedBy?: Pick<IUser, 'id' | 'username'> | null;
  voidedAt: string | null;
  voidReason: string | null;
  closingId: string | null;
}

export interface IChargeGroup {
  source: ChargeSourceEnum;
  label: string;
  subtotal: number;
  items: IVisitCharge[];
}

export interface IInvoiceDetails {
  invoice: IInvoice;
  groups: IChargeGroup[];
  payments: IPayment[];
  total: number;
  paid: number;
  balance: number;
}

export interface IRecordPaymentDto {
  invoiceId: string;
  amount: number;
  method: PaymentMethodEnum;
  reference?: string;
}

export interface IInvoiceFilters extends IPageQuery {
  status?: InvoiceStatusEnum[];
  search?: string;
  from?: string;
  to?: string;
}

export interface IPaymentFilters extends IPageQuery {
  method?: PaymentMethodEnum;
  status?: PaymentStatusEnum;
  from?: string;
  to?: string;
}

export interface ICashierTotal {
  userId: string;
  username: string;
  count: number;
  total: number;
}

export interface IDaySummary {
  businessDate: string;
  closed: boolean;
  totals: Record<PaymentMethodEnum, number>;
  expectedCash: number;
  paymentCount: number;
  voidedCount: number;
  byCashier: ICashierTotal[];
}

export interface IDayClosing extends IBaseEntity {
  businessDate: string;
  closedAt: string;
  closedBy?: Pick<IUser, 'id' | 'username'>;
  totals: Record<PaymentMethodEnum, number>;
  expectedCash: number;
  countedCash: number | null;
  variance: number | null;
  paymentCount: number;
  voidedCount: number;
  notes: string | null;
}

export interface ICloseDayDto {
  date: string;
  countedCash?: number;
  notes?: string;
}

export interface IProcedureOrder extends IBaseEntity {
  patientId: string;
  patient?: IPatient;
  visitId: string | null;
  consultationId: string | null;
  orderedBy?: Pick<IUser, 'id' | 'username'>;
  performedBy?: Pick<IUser, 'id' | 'username'> | null;
  kind: OrderKindEnum;
  name: string;
  service?: IService | null;
  priority: OrderPriorityEnum;
  status: OrderStatusEnum;
  indication: string | null;
  scheduledFor: string | null;
  report: string | null;
  completedAt: string | null;
  cancellationReason: string | null;
}

export interface ICreateProcedureOrderDto {
  patientId: string;
  kind: OrderKindEnum;
  name: string;
  visitId?: string;
  consultationId?: string;
  serviceId?: string;
  priority?: OrderPriorityEnum;
  indication?: string;
}

export interface IUpdateOrderStatusDto {
  status: OrderStatusEnum;
  scheduledFor?: string;
  report?: string;
  reason?: string;
}

export interface IProcedureOrderFilters extends IPageQuery {
  kind?: OrderKindEnum;
  status?: OrderStatusEnum[];
  patientId?: string;
  visitId?: string;
  search?: string;
}
