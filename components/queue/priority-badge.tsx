import Pill from '@/components/pills/pill';
import { PillVariantEnum, TriageCategoryEnum } from '@/enum';
import type { IVisitRecord } from '@/interfaces/queue.interfaces';

const CATEGORY: Record<TriageCategoryEnum, { label: string; variant: PillVariantEnum }> = {
  [TriageCategoryEnum.RED]: { label: 'Red · immediate', variant: PillVariantEnum.DANGER },
  [TriageCategoryEnum.YELLOW]: { label: 'Yellow · urgent', variant: PillVariantEnum.WARNING },
  [TriageCategoryEnum.GREEN]: { label: 'Green', variant: PillVariantEnum.SUCCESS },
};

/** Emergency colour and number, shown in every department queue from registration on (R9). */
export default function PriorityBadge({ visit }: { visit?: Pick<IVisitRecord, 'triageCategory' | 'emergencyNumber'> }) {
  if (!visit?.triageCategory) return null;
  const { label, variant } = CATEGORY[visit.triageCategory];
  return (
    <span className="mt-1 inline-flex flex-wrap items-center gap-1.5" aria-label={`Triage colour ${label}`}>
      <Pill variant={variant}>{label}</Pill>
      {visit.emergencyNumber && <span className="font-mono text-[11px] text-ink-muted">{visit.emergencyNumber}</span>}
    </span>
  );
}
