'use client';

import useSWR, { useSWRConfig } from 'swr';
import { DepartmentEnum, VisitEndpointEnum } from '@/enum';
import visitsService from '@/helpers/visits.service';
import type {
  ICreateVisitDto,
  IPagination,
  IQueueEntryRecord,
  IUpdateVisitDto,
  IVisitFilters,
  IVisitRecord,
} from '@/interfaces';

const isVisitKey = (key: unknown) => typeof key === 'string' && key.startsWith(VisitEndpointEnum.BASE);

export function useVisits(filters: IVisitFilters = {}) {
  const { mutate } = useSWRConfig();
  const url = visitsService.buildListUrl(filters);

  const { data, error, isLoading } = useSWR<IPagination<IVisitRecord>>(url);

  const invalidate = () => mutate(isVisitKey);

  const createVisit = async (dto: ICreateVisitDto) => {
    const visit = await visitsService.create(dto);
    await invalidate();
    return visit;
  };

  const updateVisit = async (id: string, dto: IUpdateVisitDto) => {
    const visit = await visitsService.replace(id, dto);
    await invalidate();
    return visit;
  };

  return {
    visits: data?.items ?? [],
    total: data?.total ?? 0,
    page: data?.page ?? 1,
    limit: data?.limit ?? 20,
    isLoading,
    error,
    createVisit,
    updateVisit,
  };
}

export function useVisit(id: string | null | undefined) {
  const key = id ? `${VisitEndpointEnum.BASE}/${id}` : null;
  const { data, error, isLoading, mutate } = useSWR<IVisitRecord>(key);
  return { visit: data, isLoading, error, mutate };
}

export function useVisitQueues(filters: IVisitFilters = {}) {
  const url = visitsService.buildQueuesUrl(filters);
  const { data, error, isLoading, mutate } = useSWR<IPagination<IVisitRecord>>(url);
  return {
    visits: data?.items ?? [],
    total: data?.total ?? 0,
    isLoading,
    error,
    mutate,
  };
}

export function useDepartmentQueue(department: DepartmentEnum | null | undefined) {
  const { mutate: globalMutate } = useSWRConfig();
  const key = department ? visitsService.buildDepartmentQueueUrl(department) : null;
  const fetcher = () => visitsService.listDepartmentQueue(department as DepartmentEnum);
  const { data, error, isLoading, mutate } = useSWR<IQueueEntryRecord[]>(key, key ? fetcher : null);

  const invalidate = () => globalMutate(isVisitKey);

  const call = async (id: string) => {
    const entry = await visitsService.callEntry(id);
    await mutate();
    await invalidate();
    return entry;
  };
  const start = async (id: string) => {
    const entry = await visitsService.startEntry(id);
    await mutate();
    await invalidate();
    return entry;
  };
  const complete = async (id: string, notes?: string) => {
    const result = await visitsService.completeEntry(id, notes);
    await mutate();
    await invalidate();
    return result;
  };
  const skip = async (id: string, notes?: string) => {
    const result = await visitsService.skipEntry(id, notes);
    await mutate();
    await invalidate();
    return result;
  };

  const remove = async (id: string) => {
    await visitsService.deleteEntry(id);
    await mutate();
    await invalidate();
  };

  return {
    entries: data ?? [],
    isLoading,
    error,
    mutate,
    call,
    start,
    complete,
    skip,
    remove,
  };
}
