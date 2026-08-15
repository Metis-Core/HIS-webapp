'use client';

import { StatVariantEnum } from '@/enum/stat.enum';
import type { IStatCardProps } from '@/interfaces';

const tones: Record<StatVariantEnum, { icon: string; accent: string }> = {
  [StatVariantEnum.Green]: {
    icon: 'bg-green-50 text-green-700',
    accent: 'border-t-green-600',
  },
  [StatVariantEnum.Blue]: {
    icon: 'bg-blue-50 text-blue-700',
    accent: 'border-t-blue-600',
  },
  [StatVariantEnum.Emerald]: {
    icon: 'bg-emerald-50 text-emerald-700',
    accent: 'border-t-emerald-600',
  },
  [StatVariantEnum.Amber]: {
    icon: 'bg-amber-50 text-amber-700',
    accent: 'border-t-amber-600',
  },
};

export default function StatCard({ label, value, icon: Icon, hint, variant = StatVariantEnum.Green }: IStatCardProps) {
  const tone = tones[variant];

  return (
    <article
      className={`flex items-center gap-4 rounded-lg cursor-pointer border border-slate-400 bg-white p-5  transition hover:-translate-y-0.5 hover:shadow-md`}
    >
      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-xl ${tone.icon}`}>
        <Icon aria-hidden className="w-8 h-8" />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</p>
        <p className="mt-1 text-3xl font-bold tabular-nums tracking-tight text-slate-900">{value}</p>
        {/* {hint && <p className="mt-0.5 text-xs text-zinc-400">{hint}</p>} */}
      </div>
    </article>
  );
}
