'use client';

import PhoneInputLib from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import type { IPhoneInputProps } from '@/interfaces';

const controlClass =
  'flex h-[42px] cursor-pointer items-center rounded-lg border border-line bg-surface-raised px-3 text-sm text-ink outline-none transition focus-within:border-brand focus-within:ring-1 focus-within:ring-brand disabled:cursor-not-allowed disabled:opacity-50 [&_.PhoneInputCountry]:cursor-pointer [&_.PhoneInputCountrySelect]:cursor-pointer [&_.PhoneInputInput]:h-full [&_.PhoneInputInput]:cursor-pointer [&_.PhoneInputInput]:border-0 [&_.PhoneInputInput]:bg-transparent [&_.PhoneInputInput]:text-sm [&_.PhoneInputInput]:text-ink [&_.PhoneInputInput]:outline-none [&_.PhoneInputInput]:placeholder:text-ink-muted/70';

export default function PhoneInput({ value, onChange, label, error, disabled }: IPhoneInputProps) {
  return (
    <div className="flex w-full flex-col gap-1">
      {label && <label className="text-xs font-medium text-ink-muted">{label}</label>}
      <PhoneInputLib
        international
        defaultCountry="UG"
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`PhoneInput ${controlClass} ${error ? 'border-critical focus-within:border-critical focus-within:ring-critical' : ''}`}
      />
      {error && <span className="text-xs text-critical">{error}</span>}
    </div>
  );
}
