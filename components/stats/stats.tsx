'use client';

import StatCard from './stat-card';
import type { IStatsProps } from '@/interfaces';

export default function Stats({ items, className = '' }: IStatsProps) {
  return (
    <div className={`grid gap-3 sm:grid-cols-2 md:grid-cols-4 ${className}`.trim()}>
      {items.map((item) => (
        <StatCard key={item.label} {...item} />
      ))}
    </div>
  );
}
