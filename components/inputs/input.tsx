'use client';
import type { IInputProps } from '@/interfaces';

export default function Input({ label, error, className = '', id, required, ...props }: IInputProps) {
  const inputId = id || props.name;
  return (
    <div className="flex w-full flex-col gap-1">
      {label && (
        <div className="flex items-center gap-1">
          <label htmlFor={inputId} className="text-md font-medium tracking-wider text-slate-700">
            {label}
          </label>
          {required && <span className="text-md font-bold text-red-500">*</span>}
        </div>
      )}
      <input
        id={inputId}
        className={`rounded-md border cursor-pointer border-slate-400 bg-white text-slate-700 px-3 py-2 text-md outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600 placeholder:text-slate-500 ${error ? 'border border-red-500' : ''} ${className}`}
        {...props}
      />
      {/* {error && <span className="text-md text-red-500">{error}</span>} */}
    </div>
  );
}
