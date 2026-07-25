'use client';
import Select from 'react-select';
import type { StylesConfig } from 'react-select';
import type { IOption, ISelectProps } from '@/interfaces';

const controlHeight = 42;

export default function Dropdown({
  options,
  value,
  onChange,
  label,
  error,
  isMulti,
  placeholder = 'Select...',
  isDisabled,
  compact,
}: ISelectProps) {
  const styles: StylesConfig<IOption, boolean> = {
    control: (base, state) => ({
      ...base,
      borderColor: state.isFocused ? '#16a34a' : '#94a3b8',
      boxShadow: state.isFocused ? '0 0 0 1px #16a34a' : 'none',
      borderRadius: '0.375rem',
      minHeight: controlHeight,
      height: controlHeight,
      cursor: 'pointer',
      fontSize: compact ? '0.875rem' : '1rem',
      backgroundColor: '#ffffff',
      '&:hover': { borderColor: '#16a34a' },
    }),
    valueContainer: (base) => ({
      ...base,
      height: controlHeight - 2,
      padding: '0 12px',
      cursor: 'pointer',
    }),
    indicatorsContainer: (base) => ({
      ...base,
      height: controlHeight - 2,
      cursor: 'pointer',
    }),
    dropdownIndicator: (base) => ({
      ...base,
      cursor: 'pointer',
    }),
    clearIndicator: (base) => ({
      ...base,
      cursor: 'pointer',
    }),
    input: (base) => ({
      ...base,
      cursor: 'pointer',
      margin: 0,
      padding: 0,
    }),
    placeholder: (base) => ({
      ...base,
      color: '#64748b',
    }),
    singleValue: (base) => ({
      ...base,
      color: '#334155',
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected ? '#166534' : state.isFocused ? '#f0fdf4' : 'transparent',
      color: state.isSelected ? '#ffffff' : '#334155',
      fontSize: compact ? '0.875rem' : '1rem',
      cursor: 'pointer',
    }),
  };

  return (
    <div className="flex w-full flex-col gap-1">
      {label && <label className="text-md font-medium tracking-wider text-slate-700">{label}</label>}
      <Select
        options={options}
        value={value}
        onChange={(val) => onChange((val as ISelectProps['value']) ?? null)}
        isMulti={isMulti}
        placeholder={placeholder}
        isDisabled={isDisabled}
        classNamePrefix="rs"
        styles={styles}
      />
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
}
