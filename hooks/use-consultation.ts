'use client';

import useSWR, { useSWRConfig } from 'swr';
import { ConsultationEndpointEnum } from '@/enum';
import consultationService from '@/helpers/consultation.service';
import type {
  ICompleteConsultationDto,
  IConsultationFilters,
  ICreateConsultationDto,
  IUpdateConsultationDto,
} from '@/interfaces';

export function useConsultations(filters: IConsultationFilters = {}) {
  const { mutate } = useSWRConfig();
  const { data, error, isLoading } = useSWR([ConsultationEndpointEnum.BASE, filters], () =>
    consultationService.list(filters),
  );

  const invalidate = () => mutate((key) => Array.isArray(key) && key[0] === ConsultationEndpointEnum.BASE);

  return {
    consultations: data?.data ?? [],
    total: data?.total ?? 0,
    isLoading,
    error,
    refresh: invalidate,
    createConsultation: async (dto: ICreateConsultationDto) => {
      const created = await consultationService.create(dto);
      await invalidate();
      return created;
    },
    updateConsultation: async (id: string, dto: IUpdateConsultationDto) => {
      const updated = await consultationService.update(id, dto);
      await invalidate();
      return updated;
    },
    completeConsultation: async (id: string, dto?: ICompleteConsultationDto) => {
      const result = await consultationService.complete(id, dto);
      await invalidate();
      return result;
    },
    cancelConsultation: async (id: string, reason?: string) => {
      const cancelled = await consultationService.cancel(id, reason);
      await invalidate();
      return cancelled;
    },
  };
}
