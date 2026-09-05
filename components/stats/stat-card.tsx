'use client';

import type { IStatCardProps } from '@/interfaces';

/* Quick-stats strip: 4-5 plain numbers, no charts, no color-tinted card lifts.
   Icon renders in a neutral tint so the number is the signal (AGENTS.md §7). */
export default function StatCard({ label, value, icon: Icon, hint }: IStatCardProps) {
  return (
    <article className="flex items-center gap-4 rounded-lg border border-line bg-surface-raised px-5 py-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-surface text-ink-muted">
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
