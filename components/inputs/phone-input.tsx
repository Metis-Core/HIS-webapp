'use client';

import PhoneInputLib from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import type { IPhoneInputProps } from '@/interfaces';

const controlClass =
  'flex h-[42px] cursor-pointer items-center rounded-md border border-slate-400 bg-white px-3 text-md text-slate-700 outline-none focus-within:border-green-600 focus-within:ring-1 focus-within:ring-green-600 [&_.PhoneInputCountry]:cursor-pointer [&_.PhoneInputCountrySelect]:cursor-pointer [&_.PhoneInputInput]:h-full [&_.PhoneInputInput]:cursor-pointer [&_.PhoneInputInput]:border-0 [&_.PhoneInputInput]:bg-transparent [&_.PhoneInputInput]:text-md [&_.PhoneInputInput]:text-slate-700 [&_.PhoneInputInput]:outline-none [&_.PhoneInputInput]:placeholder:text-slate-500';

export default function PhoneInput({ value, onChange, label, error, disabled }: IPhoneInputProps) {
  return (
    <div className="flex w-full flex-col gap-1">
      {label && <label className="text-md font-medium tracking-wider text-slate-700">{label}</label>}
      <PhoneInputLib
        international
        defaultCountry="UG"
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`PhoneInput ${controlClass} ${error ? 'border-red-500' : ''}`}
      />
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
}
