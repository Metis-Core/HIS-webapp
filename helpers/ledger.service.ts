import { api } from './axios';
import { buildQuery } from './crud.service';
import { unwrapData } from './envelope';
import { LedgerEndpointEnum, OrderEndpointEnum } from '@/enum';
import type {
  ICloseDayDto,
  ICreateProcedureOrderDto,
  IDayClosing,
  IInvoiceDetails,
  IInvoiceFilters,
  IPaymentFilters,
  IPayment,
  IProcedureOrder,
  IProcedureOrderFilters,
  IRecordPaymentDto,
  IUpdateOrderStatusDto,
} from '@/interfaces';

type Envelope<T> = { status: 'success'; data: T } | T;

const unwrap = <T>(body: Envelope<T>): T => unwrapData(body as { status: 'success'; data: T });

/** Opens a PDF the API streams behind authentication in a new tab. */
export async function openPdf(path: string): Promise<void> {
  const { data } = await api.get<Blob>(path, { responseType: 'blob' });
  const url = URL.createObjectURL(data);
  window.open(url, '_blank', 'noopener');
  window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

export const ledgerService = {
  invoicesUrl: (filters: IInvoiceFilters = {}) => `${LedgerEndpointEnum.INVOICES}${buildQuery(filters)}`,
  invoiceUrl: (id: string) => `${LedgerEndpointEnum.INVOICES}/${id}`,
  invoiceByVisitUrl: (visitId: string) => `${LedgerEndpointEnum.INVOICE_BY_VISIT}/${visitId}`,
  paymentsUrl: (filters: IPaymentFilters = {}) => `${LedgerEndpointEnum.PAYMENTS}${buildQuery(filters)}`,
  dayPreviewUrl: (date?: string) => `${LedgerEndpointEnum.DAY_CLOSINGS}/preview${buildQuery({ date })}`,
  dayClosingsUrl: (page = 1) => `${LedgerEndpointEnum.DAY_CLOSINGS}${buildQuery({ page })}`,

  invoicePdf: (id: string) => openPdf(`${LedgerEndpointEnum.INVOICES}/${id}/pdf`),
  receiptPdf: (paymentId: string) => openPdf(`${LedgerEndpointEnum.PAYMENTS}/${paymentId}/receipt`),

  record: async (dto: IRecordPaymentDto) => unwrap<IPayment>((await api.post(LedgerEndpointEnum.PAYMENTS, dto)).data),

  voidPayment: async (id: string, reason: string) =>
    unwrap<IPayment>((await api.post(`${LedgerEndpointEnum.PAYMENTS}/${id}/void`, { reason })).data),

  closeDay: async (dto: ICloseDayDto) =>
    unwrap<IDayClosing>((await api.post(LedgerEndpointEnum.DAY_CLOSINGS, dto)).data),

  reopenDay: async (date: string) => {
    await api.delete(`${LedgerEndpointEnum.DAY_CLOSINGS}/${date}`);
  },
};

export const ordersService = {
  listUrl: (filters: IProcedureOrderFilters = {}) => `${OrderEndpointEnum.BASE}${buildQuery(filters)}`,

  place: async (dto: ICreateProcedureOrderDto) =>
    unwrap<IProcedureOrder>((await api.post(OrderEndpointEnum.BASE, dto)).data),

  advance: async (id: string, dto: IUpdateOrderStatusDto) =>
    unwrap<IProcedureOrder>((await api.patch(`${OrderEndpointEnum.BASE}/${id}/status`, dto)).data),
};

export type { IInvoiceDetails };
