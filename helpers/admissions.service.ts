import { AdmissionEndpointEnum } from '@/enum/admission.enum';
import type { IAdmission, IAdmissionFilters } from '@/interfaces';
import { api } from './axios';
import { buildQuery } from './crud.service';
import { unwrapData } from './envelope';

export const admissionsService = {
  listUrl: (filters: IAdmissionFilters = {}) => `${AdmissionEndpointEnum.BASE}${buildQuery(filters)}`,

  discharge: async (id: string, notes?: string) =>
    unwrapData(
      (
        await api.post<IAdmission | { status: 'success'; data: IAdmission }>(
          `${AdmissionEndpointEnum.BASE}/${id}/discharge`,
          { notes: notes || undefined },
        )
      ).data,
    ),
};
