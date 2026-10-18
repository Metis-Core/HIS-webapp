'use client';

import RemoteSearchSelect from '@/components/inputs/remote-search-select';
import { patientFullName } from '@/data/patients';
import patientsService from '@/helpers/patients.service';
import { PICKER_PAGE_SIZE } from '@/helpers/pagination';
import type { IOption } from '@/interfaces';
import type { IPatient } from '@/interfaces/patient.interface';

const MIN_SEARCH_LENGTH = 2;

interface PatientSearchSelectProps {
  value: IPatient | null;
  onChange: (patient: IPatient | null) => void;
  label?: string;
  isDisabled?: boolean;
}

const toOption = (p: IPatient): IOption => ({ label: `${patientFullName(p)} - ${p.mrn}`, value: p.id });
const buildUrl = (search: string) => patientsService.buildListUrl({ search, limit: PICKER_PAGE_SIZE });

/** Finds any registered patient by name, MRN, phone or national ID using server-side search. */
export default function PatientSearchSelect({
  value,
  onChange,
  label = 'Patient',
  isDisabled = false,
}: PatientSearchSelectProps) {
  return (
    <RemoteSearchSelect<IPatient>
      label={label}
      placeholder="Search name, MRN, phone or national ID"
      value={value}
      onChange={onChange}
      buildUrl={buildUrl}
      toOption={toOption}
      minSearchLength={MIN_SEARCH_LENGTH}
      isDisabled={isDisabled}
      noun="patients"
    />
  );
}
