'use client';

import useSWR, { useSWRConfig } from 'swr';
import { PharmacyEndpointEnum } from '@/enum';
import pharmacyService from '@/helpers/pharmacy.service';
import { asList } from './utils';
import type {
  ICreatePrescriptionDto,
  IDispense,
  IDispensePrescriptionDto,
  IPageQuery,
  IPagination,
  IPrescription,
  IPrescriptionFilters,
} from '@/interfaces';
import { pageInfo } from '@/helpers/pagination';

const isPharmacyKey = (key: unknown) => typeof key === 'string' && key.startsWith('/pharmacy');
const isInventoryKey = (key: unknown) => typeof key === 'string' && key.startsWith('/inventory');

export function usePrescriptions(filters: IPrescriptionFilters = {}, { enabled = true }: { enabled?: boolean } = {}) {
  const { mutate } = useSWRConfig();
  const url = enabled ? pharmacyService.buildListUrl(filters) : null;

  const { data, error, isLoading } = useSWR<IPagination<IPrescription>>(url, { keepPreviousData: true });
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
    await Promise.all([invalidate(), mutate(isInventoryKey)]);
    return d;
  };

  return {
    prescriptions: data?.items ?? [],
    total: data?.total ?? 0,
    pagination: pageInfo(data, filters.limit),
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

/** One page of the patient's history, newest first. */
export function usePrescriptionsByPatient(patientId: string | null | undefined, query: IPageQuery = {}) {
  const key = patientId ? pharmacyService.buildByPatientUrl(patientId, query) : null;
  const { data, error, isLoading, mutate } = useSWR<IPagination<IPrescription>>(key, { keepPreviousData: true });
  return { prescriptions: data?.items ?? [], pagination: pageInfo(data, query.limit), isLoading, error, mutate };
}

export function usePrescriptionsByConsultation(consultationId: string | null | undefined) {
  const key = consultationId ? pharmacyService.buildListUrl({ consultationId, limit: 100 }) : null;
  const { data, error, isLoading, mutate } = useSWR<IPagination<IPrescription>>(key, { refreshInterval: 15_000 });
  return { prescriptions: data?.items ?? [], isLoading, error, mutate };
}

export function usePrescriptionDispenses(id: string | null | undefined) {
  const key = id ? `${PharmacyEndpointEnum.PRESCRIPTIONS}/${id}/dispenses` : null;
  const { data, error, isLoading, mutate } = useSWR<unknown>(key);
  return { dispenses: asList<IDispense>(data), isLoading, error, mutate };
}
