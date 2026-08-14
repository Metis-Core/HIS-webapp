'use client';

import useSWR, { useSWRConfig } from 'swr';
import { PatientEndpointEnum } from '@/enum';
import patientsService from '@/helpers/patients.service';
import type { ICreatePatientDto, IPatientFilters, IUpdatePatientDto } from '@/interfaces';

export function usePatients(filters: IPatientFilters = {}) {
  const { mutate } = useSWRConfig();
  const { data, error, isLoading } = useSWR([PatientEndpointEnum.BASE, filters], () => patientsService.list(filters));

  const invalidate = () => mutate((key) => Array.isArray(key) && key[0] === PatientEndpointEnum.BASE);

  return {
    patients: data?.items ?? [],
    total: data?.total ?? 0,
    isLoading,
    error,
    refresh: invalidate,
    createPatient: async (dto: ICreatePatientDto) => {
      const created = await patientsService.create(dto);
      await invalidate();
      return created;
    },
    updatePatient: async (id: string, dto: IUpdatePatientDto) => {
      const updated = await patientsService.update(id, dto);
      await invalidate();
      return updated;
    },
    removePatient: async (id: string) => {
      await patientsService.remove(id);
      await invalidate();
    },
  };
}

export function usePatient(id?: string) {
  const { data, error, isLoading, mutate } = useSWR(id ? [PatientEndpointEnum.BASE, id] : null, () =>
    patientsService.get(id as string),
  );

  return {
    patient: data,
    error,
    isLoading,
    refresh: mutate,
    updatePatient: async (dto: IUpdatePatientDto) => {
      const updated = await patientsService.update(id as string, dto);
      await mutate(updated, { revalidate: false });
      return updated;
    },
  };
}
