'use client';

import useSWR, { useSWRConfig } from 'swr';
import { OrderEndpointEnum } from '@/enum';
import { pageInfo } from '@/helpers/pagination';
import { procedureTestsService } from '@/helpers/procedure-tests.service';
import type {
  ICreateProcedureTestDto,
  IPagination,
  IProcedureTest,
  IProcedureTestFilters,
  IUpdateProcedureTestDto,
} from '@/interfaces';

export function useProcedureTests(filters: IProcedureTestFilters = {}) {
  const { mutate } = useSWRConfig();
  const url = procedureTestsService.buildListUrl(filters);
  const { data, error, isLoading } = useSWR<IPagination<IProcedureTest>>(url, { keepPreviousData: true });
  const invalidate = () => mutate((key) => typeof key === 'string' && key.startsWith(OrderEndpointEnum.TESTS));

  const createTest = async (dto: ICreateProcedureTestDto) => {
    const test = await procedureTestsService.create(dto);
    await invalidate();
    return test;
  };

  const updateTest = async (id: string, dto: IUpdateProcedureTestDto) => {
    const test = await procedureTestsService.update(id, dto);
    await invalidate();
    return test;
  };

  const removeTest = async (id: string) => {
    await procedureTestsService.remove(id);
    await invalidate();
  };

  return {
    tests: data?.items ?? [],
    pagination: pageInfo(data, filters.limit),
    isLoading,
    error,
    createTest,
    updateTest,
    removeTest,
  };
}
