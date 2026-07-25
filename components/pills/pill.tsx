import { PillVariantEnum } from '@/enum';
import type { IPillProps } from '@/interfaces';

const styles: Record<PillVariantEnum, string> = {
  [PillVariantEnum.DEFAULT]: 'bg-zinc-100 text-zinc-700',
  [PillVariantEnum.SUCCESS]: 'bg-green-700 text-white',
  [PillVariantEnum.WARNING]: 'bg-amber-700 text-white',
  [PillVariantEnum.DANGER]: 'bg-red-700 text-white',
  [PillVariantEnum.INFO]: 'bg-blue-600 text-white',
};

export default function Pill({ children, variant = PillVariantEnum.DEFAULT }: IPillProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-4 capitalize py-1 text-sm font-medium text-white tracking-wider ${styles[variant]}`}
    >
      {children}
    </span>
  );
}
