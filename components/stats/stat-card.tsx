'use client';

import type { IStatCardProps } from '@/interfaces';

export default function StatCard({ label, value, icon: Icon, hint }: IStatCardProps) {
  return (
    <article className="flex items-center gap-4 rounded-2xl border border-line bg-surface-raised p-5 shadow-sm">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface text-ink-muted">
        <Icon aria-hidden className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium text-ink-muted">{label}</p>
        <p className="mt-0.5 text-2xl font-semibold tabular-nums text-ink">{value}</p>
        {hint && <p className="mt-0.5 text-xs text-ink-muted">{hint}</p>}
      </div>
    </article>
  );
}
