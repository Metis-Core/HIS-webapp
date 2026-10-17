'use client';

import useSWR, { useSWRConfig } from 'swr';
import { PatientEndpointEnum } from '@/enum';
import patientsService from '@/helpers/patients.service';
import type { ICreatePatientDto, IPagination, IPatient, IPatientFilters, IUpdatePatientDto } from '@/interfaces';

const DEFAULT_PAGE_SIZE = 20;

/**
 * Server-side patient search and paging. Pass `enabled: false` to skip the request
 * (e.g. until the user has typed something).
 */
export function usePatients(filters: IPatientFilters = {}, { enabled = true }: { enabled?: boolean } = {}) {
  const { mutate } = useSWRConfig();
  const url = enabled ? patientsService.buildListUrl(filters) : null;

  // keepPreviousData stops the table flashing empty while the next page or search loads.
  const { data, error, isLoading, isValidating } = useSWR<IPagination<IPatient>>(url, { keepPreviousData: true });

  const invalidate = () => mutate((key) => typeof key === 'string' && key.startsWith(PatientEndpointEnum.BASE));

  const createPatient = async (dto: ICreatePatientDto) => {
    const patient = await patientsService.create(dto);
    await invalidate();
    return patient;
  };

  const updatePatient = async (id: string, dto: IUpdatePatientDto) => {
    const patient = await patientsService.update(id, dto);
    await invalidate();
    return patient;
  };

  const replacePatient = async (id: string, dto: IUpdatePatientDto) => {
    const patient = await patientsService.replace(id, dto);
    await invalidate();
    return patient;
  };

  const removePatient = async (id: string) => {
    await patientsService.remove(id);
    await invalidate();
  };

  return {
    patients: data?.items ?? [],
    total: data?.meta?.total ?? data?.total ?? 0,
    page: data?.meta?.page ?? data?.page ?? 1,
    limit: data?.meta?.limit ?? data?.limit ?? DEFAULT_PAGE_SIZE,
    hasNextPage: data?.meta?.hasNextPage ?? false,
    isLoading,
    isValidating,
    error,
    createPatient,
    updatePatient,
    replacePatient,
    removePatient,
  };
}

export function usePatient(id: string | null | undefined) {
  const key = id ? `${PatientEndpointEnum.BASE}/${id}` : null;
  const { data, error, isLoading, mutate } = useSWR<IPatient>(key);
  return { patient: data, isLoading, error, mutate };
}
