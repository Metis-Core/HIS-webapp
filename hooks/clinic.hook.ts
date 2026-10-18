'use client';

import useSWR, { useSWRConfig } from 'swr';
import { ClinicEndpointEnum } from '@/enum/clinic.enum';
import { clinicService } from '@/helpers/clinic.service';
import { pageInfo } from '@/helpers/pagination';
import type {
  IClinicRecord,
  IClinicRecordFilters,
  IClinicTemplates,
  ICreateClinicRecordDto,
  IPagination,
} from '@/interfaces';

export function useClinicTemplates(enabled = true) {
  const { data } = useSWR<IClinicTemplates>(enabled ? clinicService.templatesUrl() : null, {
    revalidateOnFocus: false,
  });
  return data;
}

export function useClinicRecords(filters: IClinicRecordFilters, enabled = true) {
  const { mutate } = useSWRConfig();
  const key = enabled ? clinicService.recordsUrl(filters) : null;
  const { data, isLoading } = useSWR<IPagination<IClinicRecord>>(key);

  const record = async (dto: ICreateClinicRecordDto) => {
    const created = await clinicService.create(dto);
    await mutate(
      (k) =>
        typeof k === 'string' &&
        (k.startsWith(ClinicEndpointEnum.RECORDS) || k.startsWith('/invoices') || k.startsWith('/charges')),
    );
    return created;
  };

  return { records: data?.items ?? [], pagination: pageInfo(data, filters.limit), isLoading, record };
}
