'use client';

import useSWR, { useSWRConfig } from 'swr';
import { QueueEndpointEnum } from '@/enum';
import type { DepartmentEnum } from '@/enum';
import queueService from '@/helpers/queue.service';
import type { ICheckInVisitDto, ICompleteQueueStageDto, IQueueFilters, ITransferQueueEntryDto } from '@/interfaces';

export function useQueue(filters: IQueueFilters = {}) {
  const { mutate } = useSWRConfig();
  const { data, error, isLoading } = useSWR([QueueEndpointEnum.BASE, filters], () => queueService.list(filters), {
    refreshInterval: 15000,
  });

  const invalidate = () => mutate((key) => Array.isArray(key) && key[0] === QueueEndpointEnum.BASE);

  return {
    entries: data?.data ?? [],
    total: data?.total ?? 0,
    isLoading,
    error,
    refresh: invalidate,
    checkIn: async (dto: ICheckInVisitDto) => {
      const visit = await queueService.checkIn(dto);
      await invalidate();
      return visit;
    },
    callNext: async (department: DepartmentEnum) => {
      const entry = await queueService.callNext(department);
      await invalidate();
      return entry;
    },
    startService: async (entryId: string) => {
      const entry = await queueService.startService(entryId);
      await invalidate();
      return entry;
    },
    completeStage: async (entryId: string, dto?: ICompleteQueueStageDto) => {
      const entry = await queueService.completeStage(entryId, dto);
      await invalidate();
      return entry;
    },
    skip: async (entryId: string, notes?: string) => {
      const entry = await queueService.skip(entryId, notes);
      await invalidate();
      return entry;
    },
    transfer: async (entryId: string, dto: ITransferQueueEntryDto) => {
      const entry = await queueService.transfer(entryId, dto);
      await invalidate();
      return entry;
    },
    updatePriority: async (visitId: string, priority: number) => {
      const visit = await queueService.updatePriority(visitId, priority);
      await invalidate();
      return visit;
    },
    cancelVisit: async (visitId: string) => {
      await queueService.cancelVisit(visitId);
      await invalidate();
    },
  };
}

export function useVisit(id?: string) {
  const { data, error, isLoading, mutate } = useSWR(id ? [QueueEndpointEnum.VISITS, id] : null, () =>
    queueService.getVisit(id as string),
  );
  return { visit: data, error, isLoading, refresh: mutate };
}

export function useQueueEntry(id?: string) {
  const { data, error, isLoading, mutate } = useSWR(id ? [QueueEndpointEnum.ENTRIES, id] : null, () =>
    queueService.getEntry(id as string),
  );

  return {
    entry: data,
    error,
    isLoading,
    refresh: mutate,
    startService: async () => {
      await queueService.startService(id as string);
      return mutate();
    },
    completeStage: async (dto?: ICompleteQueueStageDto) => {
      await queueService.completeStage(id as string, dto);
      return mutate();
    },
    skip: async (notes?: string) => {
      await queueService.skip(id as string, notes);
      return mutate();
    },
    transfer: async (dto: ITransferQueueEntryDto) => {
      await queueService.transfer(id as string, dto);
      return mutate();
    },
  };
}
