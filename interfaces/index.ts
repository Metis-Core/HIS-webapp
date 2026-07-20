import type { ReactNode } from "react";
import type { ButtonVariantEnum, PillVariantEnum } from "@/enum";

export interface IOption {
  label: string;
  value: string | number;
}

export interface IButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariantEnum;
  loading?: boolean;
}

export interface IInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export interface IToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
}

export interface ISelectProps {
  options: IOption[];
  value?: IOption | IOption[] | null;
  onChange: (value: IOption | IOption[] | null) => void;
  label?: string;
  error?: string;
  isMulti?: boolean;
  placeholder?: string;
  isDisabled?: boolean;
}

export interface IPhoneInputProps {
  value?: string;
  onChange: (value?: string) => void;
  label?: string;
  error?: string;
  disabled?: boolean;
}

export interface IModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export interface IPillProps {
  children: ReactNode;
  variant?: PillVariantEnum;
}

export interface ISkeletonProps {
  className?: string;
}
