import { Pill } from '@/components';
import { LabResultFlagEnum, PillVariantEnum } from '@/enum';
import { FLAG_LABEL, FLAG_SHORT, isCriticalFlag } from '@/helpers/lab-results';

/** Computed flag (L6): H/L, HH/LL for critical, * for an unexpected answer. */
export default function LabFlagPill({ flag }: { flag: LabResultFlagEnum | undefined }) {
  if (!flag) return null;
  const variant = isCriticalFlag(flag)
    ? PillVariantEnum.DANGER
    : flag === LabResultFlagEnum.ABNORMAL
      ? PillVariantEnum.WARNING
      : PillVariantEnum.INFO;
  return (
    <span title={FLAG_LABEL[flag]}>
      <Pill variant={variant}>{FLAG_SHORT[flag]}</Pill>
    </span>
  );
}
