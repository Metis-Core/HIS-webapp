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
    <div className="flex flex-wrap gap-2 border-b border-zinc-200">
      {tabs.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          type="button"
          onClick={() => onChange(id)}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 text-md font-semibold transition ${
            active === id ? 'border-green-800 text-green-800' : 'border-transparent text-zinc-500 hover:text-zinc-800'
          }`}
        >
          {Icon && <Icon className="text-sm" />}
          {label}
        </button>
      ))}
    </div>
  );
}
