'use client';

import useSWR, { useSWRConfig } from 'swr';
import { ConsultationEndpointEnum } from '@/enum';
import consultationsService from '@/helpers/consultations.service';
import type {
  ICancelConsultationDto,
  ICompleteConsultationDto,
  IConsultation,
  IConsultationFilters,
  ICreateConsultationDto,
  IPagination,
  IUpdateConsultationDto,
} from '@/interfaces';

const isConsultationKey = (key: unknown) => typeof key === 'string' && key.startsWith(ConsultationEndpointEnum.BASE);

export function useConsultations(filters: IConsultationFilters = {}) {
  const { mutate } = useSWRConfig();
  const url = consultationsService.buildListUrl(filters);

  const { data, error, isLoading } = useSWR<IPagination<IConsultation>>(url);

  const invalidate = () => mutate(isConsultationKey);

  const createConsultation = async (dto: ICreateConsultationDto) => {
    const consultation = await consultationsService.create(dto);
    await invalidate();
    return consultation;
  };

  const updateConsultation = async (id: string, dto: IUpdateConsultationDto) => {
    const consultation = await consultationsService.update(id, dto);
    await invalidate();
    return consultation;
  };

  const completeConsultation = async (id: string, dto: ICompleteConsultationDto = {}) => {
    const consultation = await consultationsService.complete(id, dto);
    await invalidate();
    return consultation;
  };

  const cancelConsultation = async (id: string, dto: ICancelConsultationDto = {}) => {
    const consultation = await consultationsService.cancel(id, dto);
    await invalidate();
    return consultation;
  };

  const removeConsultation = async (id: string) => {
    await consultationsService.remove(id);
    await invalidate();
  };

  return {
    consultations: data?.items ?? [],
    total: data?.total ?? 0,
    page: data?.page ?? 1,
    limit: data?.limit ?? 20,
    isLoading,
    error,
    createConsultation,
    updateConsultation,
    completeConsultation,
    cancelConsultation,
    removeConsultation,
  };
}

export function useConsultation(id: string | null | undefined) {
  const key = id ? `${ConsultationEndpointEnum.BASE}/${id}` : null;
  const { data, error, isLoading, mutate } = useSWR<IConsultation>(key);
  return { consultation: data, isLoading, error, mutate };
}

export function useConsultationsByPatient(patientId: string | null | undefined) {
  const key = patientId ? consultationsService.buildByPatientUrl(patientId) : null;
  const { data, error, isLoading, mutate } = useSWR<IConsultation[]>(key);
  return { consultations: data ?? [], isLoading, error, mutate };
}

export function useConsultationsByVisit(visitId: string | null | undefined) {
  const key = visitId ? consultationsService.buildByVisitUrl(visitId) : null;
  const { data, error, isLoading, mutate } = useSWR<IConsultation[]>(key);
  return { consultations: data ?? [], isLoading, error, mutate };
}
