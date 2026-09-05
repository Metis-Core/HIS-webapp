'use client';

import type { IconType } from 'react-icons';

export type TabItem<T extends string> = { id: T; label: string; icon?: IconType };

export default function Tabs<T extends string>({
  tabs,
  active,
  onChange,
}: {
  tabs: TabItem<T>[];
  active: T;
  onChange: (id: T) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1 border-b border-line">
      {tabs.map(({ id, label, icon: Icon }) => {
        const isActive = active === id;
        return (
          <button
            key={id}
            type="button"
            onClick={() => onChange(id)}
            className={`flex items-center gap-2 border-b-2 px-3 py-2.5 text-sm font-medium transition ${
              isActive ? 'border-brand text-brand' : 'border-transparent text-ink-muted hover:text-ink'
            }`}
          >
            {Icon && <Icon className="text-sm" />}
            {label}
          </button>
        );
      })}
    </div>
  );
}
