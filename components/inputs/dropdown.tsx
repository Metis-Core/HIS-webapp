'use client';
import { useId } from 'react';
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
  const instanceId = useId();
  const styles: StylesConfig<IOption, boolean> = {
    control: (base, state) => ({
      ...base,
      borderColor: state.isFocused ? 'var(--brand)' : 'var(--line)',
      boxShadow: state.isFocused ? '0 0 0 1px var(--brand)' : 'none',
      borderRadius: '0.5rem',
      minHeight: controlHeight,
      height: controlHeight,
      cursor: 'pointer',
      fontSize: compact ? '0.875rem' : '1rem',
      backgroundColor: 'var(--surface-raised)',
      '&:hover': { borderColor: 'var(--brand)' },
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
      color: 'var(--ink-muted)',
    }),
    singleValue: (base) => ({
      ...base,
      color: 'var(--ink)',
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected ? 'var(--brand)' : state.isFocused ? 'var(--brand-soft)' : 'transparent',
      color: state.isSelected ? 'var(--surface-raised)' : 'var(--ink)',
      fontSize: compact ? '0.875rem' : '1rem',
      cursor: 'pointer',
    }),
  };

  return (
    <div className="flex w-full flex-col gap-1">
      {label && <label className="text-xs font-medium text-ink-muted">{label}</label>}
      <Select
        instanceId={instanceId}
        options={options}
        value={value}
        onChange={(val) => onChange((val as ISelectProps['value']) ?? null)}
        isMulti={isMulti}
        placeholder={placeholder}
        isDisabled={isDisabled}
        classNamePrefix="rs"
        className="capitalize"
        styles={styles}
      />
      {error && <span className="text-xs text-critical">{error}</span>}
    </div>
  );
}
