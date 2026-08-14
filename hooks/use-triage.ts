'use client';

import useSWR, { useSWRConfig } from 'swr';
import { TriageEndpointEnum } from '@/enum';
import type { TriageStatusEnum } from '@/enum';
import triageService from '@/helpers/triage.service';
import type { ICreateTriageDto, ITriageFilters, IUpdateTriageDto } from '@/interfaces';

const invalidateKey = TriageEndpointEnum.BASE;

export function useTriage(filters: ITriageFilters = {}) {
  const { mutate } = useSWRConfig();
  const { data, error, isLoading } = useSWR([invalidateKey, filters], () => triageService.list(filters));

  const invalidate = () => mutate((key) => Array.isArray(key) && key[0] === invalidateKey);

  return {
    triages: data?.data ?? [],
    total: data?.total ?? 0,
    isLoading,
    error,
    refresh: invalidate,
    createTriage: async (dto: ICreateTriageDto) => {
      const created = await triageService.create(dto);
      await invalidate();
      return created;
    },
    updateTriage: async (id: string, dto: IUpdateTriageDto) => {
      const updated = await triageService.update(id, dto);
      await invalidate();
      return updated;
    },
    removeTriage: async (id: string) => {
      await triageService.remove(id);
      await invalidate();
    },
  };
}

export function useTriageQueue(status?: TriageStatusEnum) {
  const { data, error, isLoading, mutate } = useSWR([TriageEndpointEnum.QUEUE, status], () =>
    triageService.queue(status),
  );
  return { triages: data ?? [], error, isLoading, refresh: mutate };
}
