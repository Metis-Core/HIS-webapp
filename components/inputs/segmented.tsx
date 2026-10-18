'use client';

interface SegmentedOption<T extends string | number> {
  value: T;
  label: string;
}

interface SegmentedProps<T extends string | number> {
  label?: string;
  options: SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
}

export default function Segmented<T extends string | number>({ label, options, value, onChange }: SegmentedProps<T>) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <span className="text-xs font-medium text-ink-muted">{label}</span>}
      <div
        role="radiogroup"
        aria-label={label}
        className="flex flex-wrap gap-0.5 rounded-lg border border-line bg-surface p-0.5"
      >
        {options.map((option) => {
          const active = option.value === value;
          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onChange(option.value)}
              className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition ${
                active ? 'bg-surface-raised text-brand shadow-sm' : 'text-ink-muted hover:text-ink'
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
