'use client';

import useSWR, { useSWRConfig } from 'swr';
import { ServiceEndpointEnum } from '@/enum';
import servicesService from '@/helpers/services.service';
import type { ICreateServiceDto, IPagination, IService, IServiceFilters, IUpdateServiceDto } from '@/interfaces';

const isServiceKey = (key: unknown) => typeof key === 'string' && key.startsWith(ServiceEndpointEnum.BASE);

export function useServices(filters: IServiceFilters = {}) {
  const { mutate } = useSWRConfig();
  const url = servicesService.buildListUrl(filters);

  const { data, error, isLoading } = useSWR<IPagination<IService>>(url);

  const invalidate = () => mutate(isServiceKey);

  const createService = async (dto: ICreateServiceDto) => {
    const service = await servicesService.create(dto);
    await invalidate();
    return service;
  };

  const updateService = async (id: string, dto: IUpdateServiceDto) => {
    const service = await servicesService.update(id, dto);
    await invalidate();
    return service;
  };

  const removeService = async (id: string) => {
    await servicesService.remove(id);
    await invalidate();
  };

  return {
    services: data?.items ?? [],
    total: data?.total ?? 0,
    page: data?.page ?? 1,
    limit: data?.limit ?? 20,
    isLoading,
    error,
    createService,
    updateService,
    removeService,
  };
}

export function useService(id: string | null | undefined) {
  const key = id ? `${ServiceEndpointEnum.BASE}/${id}` : null;
  const { data, error, isLoading, mutate } = useSWR<IService>(key);
  return { service: data, isLoading, error, mutate };
}
