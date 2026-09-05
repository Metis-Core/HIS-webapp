'use client';

import useSWR, { useSWRConfig } from 'swr';
import { PatientEndpointEnum } from '@/enum';
import patientsService from '@/helpers/patients.service';
import type { ICreatePatientDto, IPagination, IPatient, IPatientFilters, IUpdatePatientDto } from '@/interfaces';

export function usePatients(filters: IPatientFilters = {}) {
  const { mutate } = useSWRConfig();
  const url = patientsService.buildListUrl(filters);

  const { data, error, isLoading } = useSWR<IPagination<IPatient>>(url);

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
    total: data?.total ?? 0,
    page: data?.page ?? 1,
    limit: data?.limit ?? 20,
    isLoading,
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
