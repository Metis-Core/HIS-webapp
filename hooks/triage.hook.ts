'use client';

import useSWR, { useSWRConfig } from 'swr';
import { TriageEndpointEnum, TriageStatusEnum } from '@/enum';
import triageService from '@/helpers/triage.service';
import type {
  ICreateTriageDto,
  IPageQuery,
  IPagination,
  ITriage,
  ITriageFilters,
  IUpdateTriageDto,
} from '@/interfaces';
import { asList } from './utils';
import { pageInfo } from '@/helpers/pagination';

const isTriageOrQueueKey = (key: unknown) =>
  typeof key === 'string' && (key.startsWith(TriageEndpointEnum.BASE) || key.startsWith('/visits'));

export function useTriage(filters: ITriageFilters = {}) {
  const { mutate } = useSWRConfig();
  const url = triageService.buildListUrl(filters);

  const { data, error, isLoading } = useSWR<IPagination<ITriage>>(url, { keepPreviousData: true });

  const invalidate = () => mutate(isTriageOrQueueKey);

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
    pagination: pageInfo(data, filters.limit),
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
  const { data, error, isLoading, mutate } = useSWR<unknown>(key);
  return { queue: asList<ITriage>(data), isLoading, error, mutate };
}

/** One page of the patient's history, newest first. */
export function useTriageByPatient(patientId: string | null | undefined, query: IPageQuery = {}) {
  const key = patientId ? triageService.buildByPatientUrl(patientId, query) : null;
  const { data, error, isLoading, mutate } = useSWR<IPagination<ITriage>>(key, { keepPreviousData: true });
  return { triages: data?.items ?? [], pagination: pageInfo(data, query.limit), isLoading, error, mutate };
}
