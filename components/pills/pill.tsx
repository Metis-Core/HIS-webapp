'use client';
import type { ReactNode } from 'react';
import { PillVariantEnum } from '@/enum';
import type { IPillProps } from '@/interfaces';

/* Status pill — colored dot + label. Never rely on hue alone (AGENTS.md §7).
   Pass an optional icon when the pill communicates clinical state. */
const styles: Record<PillVariantEnum, { chip: string; dot: string }> = {
  [PillVariantEnum.DEFAULT]: {
    chip: 'bg-surface text-ink-muted ring-1 ring-line',
    dot: 'bg-ink-muted',
  },
  [PillVariantEnum.SUCCESS]: {
    chip: 'bg-normal-soft text-normal ring-1 ring-normal/20',
    dot: 'bg-normal',
  },
  [PillVariantEnum.WARNING]: {
    chip: 'bg-watch-soft text-watch ring-1 ring-watch/20',
    dot: 'bg-watch',
  },
  [PillVariantEnum.DANGER]: {
    chip: 'bg-critical-soft text-critical ring-1 ring-critical/20',
    dot: 'bg-critical',
  },
  [PillVariantEnum.INFO]: {
    chip: 'bg-info-soft text-info ring-1 ring-info/20',
    dot: 'bg-info',
  },
};

interface IPillPropsExt extends IPillProps {
  icon?: ReactNode;
}

export default function Pill({ children, variant = PillVariantEnum.DEFAULT, icon }: IPillPropsExt) {
  const tone = styles[variant];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${tone.chip}`}
    >
      {icon ?? <span aria-hidden className={`h-1.5 w-1.5 rounded-full ${tone.dot}`} />}
      {children}
    </span>
  );
}
