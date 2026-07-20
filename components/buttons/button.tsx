"use client";

import { ButtonVariantEnum } from "@/enum";
import type { IButtonProps } from "@/interfaces";

const styles: Record<ButtonVariantEnum, string> = {
  [ButtonVariantEnum.Primary]: "bg-blue-600 text-white hover:bg-blue-700",
  [ButtonVariantEnum.Secondary]: "bg-zinc-200 text-zinc-900 hover:bg-zinc-300",
  [ButtonVariantEnum.Danger]: "bg-red-600 text-white hover:bg-red-700",
  [ButtonVariantEnum.Ghost]: "bg-transparent text-zinc-700 hover:bg-zinc-100",
};

export default function Button({
  variant = ButtonVariantEnum.Primary,
  loading,
  disabled,
  children,
  className = "",
  ...props
}: IButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition disabled:opacity-50 ${styles[variant]} ${className}`}
      {...props}
    >
      {loading ? "Loading..." : children}
    </button>
  );
}
