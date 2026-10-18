'use client';

import useSWR, { useSWRConfig } from 'swr';
import { AvailabilityEndpointEnum, DoctorEndpointEnum } from '@/enum';
import { availabilityService } from '@/helpers/availability.service';
import { pageInfo } from '@/helpers/pagination';
import type {
  IAvailabilityOverview,
  IDoctorFilters,
  IDoctorSummary,
  IPagination,
  ISetAvailabilityDto,
  IStaffAvailability,
  IStaffAvailabilityFilters,
} from '@/interfaces';

const REFRESH_MS = 60_000;
const isAvailabilityKey = (key: unknown) =>
  typeof key === 'string' && (key.startsWith(AvailabilityEndpointEnum.BASE) || key.startsWith(DoctorEndpointEnum.BASE));

/** Own availability, or another user's when an administrator passes `userId`. */
export function useAvailability(userId?: string, enabled = true) {
  const { mutate: globalMutate } = useSWRConfig();
  const key = enabled ? availabilityService.overviewUrl(userId) : null;
  const { data, error, isLoading, mutate } = useSWR<IAvailabilityOverview>(key, {
    refreshInterval: REFRESH_MS,
    revalidateOnFocus: true,
  });

  const apply = async (next: IAvailabilityOverview) => {
    await Promise.all([
      mutate(next, { revalidate: false }),
      !userId && globalMutate(availabilityService.overviewUrl(), next, { revalidate: false }),
    ]);
    await globalMutate(isAvailabilityKey);
    return next;
  };

  const set = async (dto: ISetAvailabilityDto) => apply(await availabilityService.set(dto, userId));

  const cancel = async (periodId: string) => apply(await availabilityService.cancel(periodId, userId));

  return { overview: data, isLoading, error, set, cancel };
}

export function useStaffAvailability(filters: IStaffAvailabilityFilters = {}) {
  const { data, error, isLoading } = useSWR<IPagination<IStaffAvailability>>(availabilityService.staffUrl(filters), {
    keepPreviousData: true,
    refreshInterval: REFRESH_MS,
  });
  return { staff: data?.items ?? [], pagination: pageInfo(data, filters.limit), isLoading, error };
}

export function useDoctors(filters: IDoctorFilters = {}, enabled = true) {
  const key = enabled ? availabilityService.doctorsUrl(filters) : null;
  const { data, error, isLoading } = useSWR<IPagination<IDoctorSummary>>(key, {
    keepPreviousData: true,
    refreshInterval: REFRESH_MS,
  });
  return { doctors: data?.items ?? [], pagination: pageInfo(data, filters.limit), isLoading, error };
}
