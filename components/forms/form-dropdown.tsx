'use client';

import { useField } from 'formik';
import Dropdown from '../inputs/dropdown';
import type { IOption, ISelectProps } from '@/interfaces';

type FormDropdownProps = Omit<ISelectProps, 'value' | 'onChange' | 'error'> & {
  name: string;
};

export default function FormDropdown({ name, options, ...props }: FormDropdownProps) {
  const [field, meta, helpers] = useField<string>(name);
  const selected = options.find((option) => String(option.value) === String(field.value)) ?? null;

  return (
    <Dropdown
      {...props}
      options={options}
      value={selected}
      onChange={(option) => {
        const next = Array.isArray(option) ? option[0] : option;
        helpers.setValue(next ? String(next.value) : '');
      }}
      error={meta.touched && meta.error ? String(meta.error) : undefined}
    />
  );
}

export type { IOption };
