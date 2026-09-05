'use client';

import useSWR, { useSWRConfig } from 'swr';
import { TriageEndpointEnum, TriageStatusEnum } from '@/enum';
import triageService from '@/helpers/triage.service';
import type { ICreateTriageDto, IPagination, ITriage, ITriageFilters, IUpdateTriageDto } from '@/interfaces';

const isTriageKey = (key: unknown) => typeof key === 'string' && key.startsWith(TriageEndpointEnum.BASE);

export function useTriage(filters: ITriageFilters = {}) {
  const { mutate } = useSWRConfig();
  const url = triageService.buildListUrl(filters);

  const { data, error, isLoading } = useSWR<IPagination<ITriage>>(url);

  const invalidate = () => mutate(isTriageKey);

  const createTriage = async (dto: ICreateTriageDto) => {
    const triage = await triageService.create(dto);
    await invalidate();
    return triage;
  };

  const updateTriage = async (id: string, dto: IUpdateTriageDto) => {
    const triage = await triageService.update(id, dto);
    await invalidate();
    return triage;
  };

  const removeTriage = async (id: string) => {
    await triageService.remove(id);
    await invalidate();
  };

  return {
    triages: data?.items ?? [],
    total: data?.total ?? 0,
    page: data?.page ?? 1,
    limit: data?.limit ?? 20,
    isLoading,
    error,
    createTriage,
    updateTriage,
    removeTriage,
  };
}

export function useTriageItem(id: string | null | undefined) {
  const key = id ? `${TriageEndpointEnum.BASE}/${id}` : null;
  const { data, error, isLoading, mutate } = useSWR<ITriage>(key);
  return { triage: data, isLoading, error, mutate };
}

export function useTriageQueue(status?: TriageStatusEnum) {
  const key = triageService.buildQueueUrl(status);
  const { data, error, isLoading, mutate } = useSWR<ITriage[]>(key);
  return { queue: data ?? [], isLoading, error, mutate };
}

export function useTriageByPatient(patientId: string | null | undefined) {
  const key = patientId ? triageService.buildByPatientUrl(patientId) : null;
  const { data, error, isLoading, mutate } = useSWR<ITriage[]>(key);
  return { triages: data ?? [], isLoading, error, mutate };
}
