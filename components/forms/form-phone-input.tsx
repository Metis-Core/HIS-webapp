'use client';

import { useField } from 'formik';
import PhoneInput from '../inputs/phone-input';
import type { IPhoneInputProps } from '@/interfaces';

type FormPhoneInputProps = Omit<IPhoneInputProps, 'value' | 'onChange' | 'error'> & {
  name: string;
};

export default function FormPhoneInput({ name, ...props }: FormPhoneInputProps) {
  const [field, meta, helpers] = useField<string>(name);

  return (
    <PhoneInput
      {...props}
      value={field.value}
      onChange={(value) => helpers.setValue(value ?? '')}
      error={meta.touched && meta.error ? String(meta.error) : undefined}
    />
  );
}
