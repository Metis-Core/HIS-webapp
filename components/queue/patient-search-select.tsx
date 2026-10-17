'use client';

import { useMemo, useState } from 'react';
import { Dropdown } from '@/components';
import { patientFullName } from '@/data/patients';
import { useDebouncedValue, usePatients } from '@/hooks';
import type { IOption } from '@/interfaces';
import type { IPatient } from '@/interfaces/patient.interface';

const MIN_SEARCH_LENGTH = 2;
const RESULT_LIMIT = 20;
const SEARCH_DEBOUNCE_MS = 300;

interface PatientSearchSelectProps {
  value: IPatient | null;
  onChange: (patient: IPatient | null) => void;
  label?: string;
}

const toOption = (p: IPatient): IOption => ({ label: `${patientFullName(p)} - ${p.mrn}`, value: p.id });

/** Finds any registered patient by name, MRN, phone or national ID using server-side search. */
export default function PatientSearchSelect({ value, onChange, label = 'Patient' }: PatientSearchSelectProps) {
  const [text, setText] = useState('');
  const search = useDebouncedValue(text.trim(), SEARCH_DEBOUNCE_MS);
  const enabled = search.length >= MIN_SEARCH_LENGTH;
  const { patients, isValidating, error } = usePatients({ search, limit: RESULT_LIMIT }, { enabled });

  const options = useMemo(() => (enabled ? patients.map(toOption) : []), [enabled, patients]);

  const noOptionsMessage = error
    ? "Couldn't search patients — retry"
    : enabled
      ? 'No matching patients'
      : `Type at least ${MIN_SEARCH_LENGTH} characters`;

  return (
    <Dropdown
      label={label}
      placeholder="Search name, MRN, phone or national ID"
      options={options}
      value={value ? toOption(value) : null}
      inputValue={text}
      onInputChange={setText}
      isLoading={enabled && isValidating}
      isClearable
      noOptionsMessage={noOptionsMessage}
      onChange={(option) => {
        const picked = Array.isArray(option) ? option[0] : option;
        onChange(picked ? (patients.find((p) => p.id === picked.value) ?? null) : null);
      }}
    />
  );
}
