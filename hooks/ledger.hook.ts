'use client';

import useSWR, { useSWRConfig } from 'swr';
import { LedgerEndpointEnum, OrderEndpointEnum } from '@/enum';
import { ledgerService, ordersService } from '@/helpers/ledger.service';
import { pageInfo } from '@/helpers/pagination';
import type {
  ICreateProcedureOrderDto,
  IDayClosing,
  IDaySummary,
  IInvoice,
  IInvoiceDetails,
  IInvoiceFilters,
  IPagination,
  IPayment,
  IPaymentFilters,
  IProcedureOrder,
  IProcedureOrderFilters,
  IUpdateOrderStatusDto,
} from '@/interfaces';

const isLedgerKey = (key: unknown) =>
  typeof key === 'string' &&
  [LedgerEndpointEnum.INVOICES, LedgerEndpointEnum.PAYMENTS, LedgerEndpointEnum.DAY_CLOSINGS, '/charges'].some(
    (prefix) => key.startsWith(prefix),
  );

export function useLedgerRefresh() {
  const { mutate } = useSWRConfig();
  return () => mutate(isLedgerKey);
}

export function useInvoices(filters: IInvoiceFilters = {}) {
  const { data, error, isLoading } = useSWR<IPagination<IInvoice>>(ledgerService.invoicesUrl(filters), {
    keepPreviousData: true,
  });
  return { invoices: data?.items ?? [], pagination: pageInfo(data, filters.limit), isLoading, error };
}

export function useInvoice(id: string | null | undefined) {
  const { data, error, isLoading } = useSWR<IInvoiceDetails>(id ? ledgerService.invoiceUrl(id) : null);
  return { details: data, isLoading, error };
}

export function usePayments(filters: IPaymentFilters = {}) {
  const { data, error, isLoading } = useSWR<IPagination<IPayment>>(ledgerService.paymentsUrl(filters), {
    keepPreviousData: true,
  });
  return { payments: data?.items ?? [], pagination: pageInfo(data, filters.limit), isLoading, error };
}

export function useDaySummary(date?: string) {
  const { data, error, isLoading } = useSWR<IDaySummary>(ledgerService.dayPreviewUrl(date));
  return { summary: data, isLoading, error };
}

export function useDayClosings(page = 1) {
  const { data, isLoading } = useSWR<IPagination<IDayClosing>>(ledgerService.dayClosingsUrl(page), {
    keepPreviousData: true,
  });
  return { closings: data?.items ?? [], pagination: pageInfo(data), isLoading };
}

export function useProcedureOrders(filters: IProcedureOrderFilters = {}, enabled = true) {
  const { mutate } = useSWRConfig();
  const key = enabled ? ordersService.listUrl(filters) : null;
  const { data, error, isLoading } = useSWR<IPagination<IProcedureOrder>>(key, {
    keepPreviousData: true,
    refreshInterval: 30_000,
  });
  const refresh = () =>
    mutate(
      (k) =>
        typeof k === 'string' &&
        (k.startsWith(OrderEndpointEnum.BASE) || k.startsWith('/visits') || k.startsWith('/charges')),
    );

  const place = async (dto: ICreateProcedureOrderDto) => {
    const order = await ordersService.place(dto);
    await refresh();
    return order;
  };

  const advance = async (id: string, dto: IUpdateOrderStatusDto) => {
    const order = await ordersService.advance(id, dto);
    await refresh();
    return order;
  };

  return {
    orders: data?.items ?? [],
    pagination: pageInfo(data, filters.limit),
    isLoading,
    error,
    place,
    advance,
  };
}
