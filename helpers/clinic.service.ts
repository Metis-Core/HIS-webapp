import { api } from './axios';
import { buildQuery } from './crud.service';
import { unwrapData } from './envelope';
import { ClinicEndpointEnum } from '@/enum/clinic.enum';
import type { IClinicRecord, IClinicRecordFilters, ICreateClinicRecordDto } from '@/interfaces';

export const clinicService = {
  templatesUrl: () => ClinicEndpointEnum.TEMPLATES,
  recordsUrl: (filters: IClinicRecordFilters = {}) => `${ClinicEndpointEnum.RECORDS}${buildQuery(filters)}`,

  create: async (dto: ICreateClinicRecordDto) =>
    unwrapData(
      (await api.post<IClinicRecord | { status: 'success'; data: IClinicRecord }>(ClinicEndpointEnum.RECORDS, dto))
        .data,
    ),
};
