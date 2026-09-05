'use client';

import useSWR, { useSWRConfig } from 'swr';
import { PharmacyEndpointEnum } from '@/enum';
import pharmacyService from '@/helpers/pharmacy.service';
import { asList } from './utils';
import type {
  ICreatePrescriptionDto,
  IDispense,
  IDispensePrescriptionDto,
  IPagination,
  IPrescription,
  IPrescriptionFilters,
} from '@/interfaces';

const isPharmacyKey = (key: unknown) => typeof key === 'string' && key.startsWith('/pharmacy');

export function usePrescriptions(filters: IPrescriptionFilters = {}) {
  const { mutate } = useSWRConfig();
  const url = pharmacyService.buildListUrl(filters);

  const { data, error, isLoading } = useSWR<IPagination<IPrescription>>(url);
  const invalidate = () => mutate(isPharmacyKey);

  const createPrescription = async (dto: ICreatePrescriptionDto) => {
    const p = await pharmacyService.create(dto);
    await invalidate();
    return p;
  };

  const cancelPrescription = async (id: string, reason?: string) => {
    const p = await pharmacyService.cancel(id, reason);
    await invalidate();
    return p;
  };

  const dispensePrescription = async (id: string, dto: IDispensePrescriptionDto) => {
    const d = await pharmacyService.dispense(id, dto);
    await invalidate();
    return d;
  };

  return {
    prescriptions: data?.items ?? [],
    total: data?.total ?? 0,
    isLoading,
    error,
    createPrescription,
    cancelPrescription,
    dispensePrescription,
  };
}

export function usePrescription(id: string | null | undefined) {
  const key = id ? `${PharmacyEndpointEnum.PRESCRIPTIONS}/${id}` : null;
  const { data, error, isLoading, mutate } = useSWR<IPrescription>(key);
  return { prescription: data, isLoading, error, mutate };
}

export function usePrescriptionsByPatient(patientId: string | null | undefined) {
  const key = patientId ? pharmacyService.buildByPatientUrl(patientId) : null;
  const { data, error, isLoading, mutate } = useSWR<unknown>(key);
  return { prescriptions: asList<IPrescription>(data), isLoading, error, mutate };
}

export function usePrescriptionDispenses(id: string | null | undefined) {
  const key = id ? `${PharmacyEndpointEnum.PRESCRIPTIONS}/${id}/dispenses` : null;
  const { data, error, isLoading, mutate } = useSWR<unknown>(key);
  return { dispenses: asList<IDispense>(data), isLoading, error, mutate };
}
