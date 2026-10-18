'use client';

import useSWR, { useSWRConfig } from 'swr';
import { ServiceEndpointEnum, VisitEndpointEnum } from '@/enum';
import visitsService from '@/helpers/visits.service';
import type { ICreateVisitDto, IService } from '@/interfaces';

/** Consultation fee (resolved by the API from the CONSULTATION service code) and the check-in call. */
export function useCheckIn({ enabled = true }: { enabled?: boolean } = {}) {
  const { mutate } = useSWRConfig();
  const { data, error, isLoading } = useSWR<IService>(enabled ? ServiceEndpointEnum.CONSULTATION_FEE : null);

  const checkIn = async (dto: ICreateVisitDto) => {
    const visit = await visitsService.create(dto);
    await mutate((key) => typeof key === 'string' && key.startsWith(VisitEndpointEnum.BASE));
    return visit;
  };

  return { consultationFee: data ?? null, feeLoading: isLoading, feeMissing: Boolean(error), checkIn };
}
