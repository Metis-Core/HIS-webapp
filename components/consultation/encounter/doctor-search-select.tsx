'use client';

import RemoteSearchSelect from '@/components/inputs/remote-search-select';
import { AVAILABILITY_LABEL } from '@/components/availability/availability-status';
import { AvailabilityStatusEnum } from '@/enum';
import { availabilityService } from '@/helpers/availability.service';
import { PICKER_PAGE_SIZE } from '@/helpers/pagination';
import type { IDoctorSummary, IOption } from '@/interfaces';

const toOption = (d: IDoctorSummary): IOption => ({
  label:
    d.availability === AvailabilityStatusEnum.AVAILABLE
      ? `Dr ${d.username} · ${d.waiting} waiting`
      : `Dr ${d.username} · ${AVAILABILITY_LABEL[d.availability]}`,
  value: d.id,
});
const buildUrl = (search: string) =>
  availabilityService.doctorsUrl({ search: search || undefined, limit: PICKER_PAGE_SIZE });

/** Finds an active doctor with their availability and current workload. */
export default function DoctorSearchSelect({
  value,
  onChange,
  label = 'Doctor',
}: {
  value: IDoctorSummary | null;
  onChange: (d: IDoctorSummary | null) => void;
  label?: string;
}) {
  return (
    <RemoteSearchSelect<IDoctorSummary>
      label={label}
      placeholder="Search doctors"
      value={value}
      onChange={onChange}
      buildUrl={buildUrl}
      toOption={toOption}
      noun="doctors"
    />
  );
}
