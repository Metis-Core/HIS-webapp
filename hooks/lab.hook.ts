'use client';

import useSWR, { useSWRConfig } from 'swr';
import { LabEndpointEnum } from '@/enum';
import { labOrdersService, labTestsService } from '@/helpers/lab.service';
import type {
  ICreateLabOrderDto,
  ICreateLabTestDto,
  ILabOrder,
  ILabOrderFilters,
  ILabTest,
  ILabTestFilters,
  IPagination,
  IUpdateLabOrderDto,
  IUpdateLabOrderItemDto,
  IUpdateLabTestDto,
} from '@/interfaces';

const isLabKey = (key: unknown) => typeof key === 'string' && key.startsWith('/lab');

export function useLabTests(filters: ILabTestFilters = {}) {
  const { mutate } = useSWRConfig();
  const url = labTestsService.buildListUrl(filters);

  const { data, error, isLoading } = useSWR<IPagination<ILabTest>>(url);
  const invalidate = () => mutate(isLabKey);

  const createTest = async (dto: ICreateLabTestDto) => {
    const t = await labTestsService.create(dto);
    await invalidate();
    return t;
  };

  const updateTest = async (id: string, dto: IUpdateLabTestDto) => {
    const t = await labTestsService.update(id, dto);
    await invalidate();
    return t;
  };

  const removeTest = async (id: string) => {
    await labTestsService.remove(id);
    await invalidate();
  };

  return {
    tests: data?.items ?? [],
    total: data?.total ?? 0,
    isLoading,
    error,
    createTest,
    updateTest,
    removeTest,
  };
}

export function useLabTest(id: string | null | undefined) {
  const key = id ? `${LabEndpointEnum.TESTS}/${id}` : null;
  const { data, error, isLoading, mutate } = useSWR<ILabTest>(key);
  return { test: data, isLoading, error, mutate };
}

export function useLabOrders(filters: ILabOrderFilters = {}) {
  const { mutate } = useSWRConfig();
  const url = labOrdersService.buildListUrl(filters);

  const { data, error, isLoading } = useSWR<IPagination<ILabOrder>>(url);
  const invalidate = () => mutate(isLabKey);

  const createOrder = async (dto: ICreateLabOrderDto) => {
    const o = await labOrdersService.create(dto);
    await invalidate();
    return o;
  };

  const updateOrder = async (id: string, dto: IUpdateLabOrderDto) => {
    const o = await labOrdersService.update(id, dto);
    await invalidate();
    return o;
  };

  const cancelOrder = async (id: string, reason?: string) => {
    const o = await labOrdersService.cancel(id, reason);
    await invalidate();
    return o;
  };

  const updateItem = async (orderId: string, itemId: string, dto: IUpdateLabOrderItemDto) => {
    const o = await labOrdersService.updateItem(orderId, itemId, dto);
    await invalidate();
    return o;
  };

  return {
    orders: data?.items ?? [],
    total: data?.total ?? 0,
    isLoading,
    error,
    createOrder,
    updateOrder,
    cancelOrder,
    updateItem,
  };
}

export function useLabOrder(id: string | null | undefined) {
  const key = id ? `${LabEndpointEnum.ORDERS}/${id}` : null;
  const { data, error, isLoading, mutate } = useSWR<ILabOrder>(key);
  return { order: data, isLoading, error, mutate };
}

export function useLabOrdersByPatient(patientId: string | null | undefined) {
  const key = patientId ? labOrdersService.buildByPatientUrl(patientId) : null;
  const { data, error, isLoading, mutate } = useSWR<ILabOrder[]>(key);
  return { orders: data ?? [], isLoading, error, mutate };
}

export function useLabOrdersByConsultation(consultationId: string | null | undefined) {
  const key = consultationId ? labOrdersService.buildByConsultationUrl(consultationId) : null;
  const { data, error, isLoading, mutate } = useSWR<ILabOrder[]>(key);
  return { orders: data ?? [], isLoading, error, mutate };
}
