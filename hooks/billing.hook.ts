'use client';

import useSWR from 'swr';
import billingService from '@/helpers/billing.service';
import type { ChargeStatusEnum } from '@/enum/billing.enum';
import type { ICreateVisitChargeDto, IVisitBill } from '@/interfaces';

export function useVisitBill(visitId: string | null | undefined) {
  const key = visitId ? billingService.visitBillUrl(visitId) : null;
  const { data, error, isLoading, mutate } = useSWR<IVisitBill>(key);

  const addCharge = async (dto: Omit<ICreateVisitChargeDto, 'visitId'>) => {
    if (!visitId) return;
    await billingService.addCharge({ ...dto, visitId });
    await mutate();
  };

  const setStatus = async (id: string, status: ChargeStatusEnum) => {
    await billingService.setStatus(id, status);
    await mutate();
  };

  const removeCharge = async (id: string) => {
    await billingService.remove(id);
    await mutate();
  };

  return {
    charges: data?.items ?? [],
    total: data?.total ?? 0,
    outstanding: data?.outstanding ?? 0,
    isLoading,
    error,
    mutate,
    addCharge,
    setStatus,
    removeCharge,
  };
}
