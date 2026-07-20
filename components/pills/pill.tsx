import { PillVariantEnum } from "@/enum";
import type { IPillProps } from "@/interfaces";

const styles: Record<PillVariantEnum, string> = {
  [PillVariantEnum.Default]: "bg-zinc-100 text-zinc-700",
  [PillVariantEnum.Success]: "bg-green-100 text-green-700",
  [PillVariantEnum.Warning]: "bg-amber-100 text-amber-700",
  [PillVariantEnum.Danger]: "bg-red-100 text-red-700",
  [PillVariantEnum.Info]: "bg-blue-100 text-blue-700",
};

export default function Pill({
  children,
  variant = PillVariantEnum.Default,
}: IPillProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[variant]}`}
    >
      {children}
    </span>
  );
}
