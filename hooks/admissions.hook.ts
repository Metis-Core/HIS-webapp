'use client';

import useSWR, { useSWRConfig } from 'swr';
import { AdmissionEndpointEnum } from '@/enum/admission.enum';
import { admissionsService } from '@/helpers/admissions.service';
import type { IAdmission, IAdmissionFilters, IPagination } from '@/interfaces';

export function useAdmissions(filters: IAdmissionFilters, enabled = true) {
  const { mutate } = useSWRConfig();
  const { data, isLoading } = useSWR<IPagination<IAdmission>>(enabled ? admissionsService.listUrl(filters) : null);

  const discharge = async (id: string, notes?: string) => {
    const discharged = await admissionsService.discharge(id, notes);
    // Discharging frees the patient for a new visit, so the check-in guard and the patient lists refresh too.
    await mutate(
      (k) =>
        typeof k === 'string' &&
        (k.startsWith(AdmissionEndpointEnum.BASE) || k.startsWith('/visits') || k.startsWith('/patients')),
    );
    return discharged;
  };

  return { admissions: data?.items ?? [], isLoading, discharge };
}
