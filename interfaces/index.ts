import type { ReactNode } from 'react';
import type { IconType } from 'react-icons';
import type { ButtonVariantEnum, ModalDrawerModeEnum, PillVariantEnum } from '@/enum';
import type { StatVariantEnum } from '@/enum/stat.enum';
import type { IPatient } from './patient.interface';

export * from './base.interface';
export * from './auth.interface';
export * from './user.interface';
export * from './service.interface';
export * from './patient.interface';
export * from './contact.interface';
export * from './consultation.interface';
export * from './triage.interface';
export * from './queue.interfaces';
export * from './otp.interface';
export * from './notification.interface';
export * from './lab.interface';
export * from './inventory.interface';
export * from './pharmacy.interface';

export interface IOption {
  label: string;
  value: string | number;
}

export interface IButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariantEnum;
  loading?: boolean;
}

export interface IInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
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
  compact?: boolean;
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

export interface IDrawerProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  width?: string;
}

export interface IPillProps {
  children: ReactNode;
  variant?: PillVariantEnum;
  icon?: ReactNode;
}

export interface ISkeletonProps {
  className?: string;
}

export interface IEmptyStateProps {
  message: string;
  icon?: IconType;
  actionLabel?: string;
  onAction?: () => void;
}

export interface IStatCardProps {
  label: string;
  value: number | string;
  icon: IconType;
  hint?: string;
  variant?: StatVariantEnum;
}

export interface IStatsProps {
  items: IStatCardProps[];
  className?: string;
}
export type PatientFormValues = {
  firstName: string;
  lastName: string;
  middleName: string;
  dateOfBirth: string;
  gender: string;
  type: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  nationalId: string;
  maritalStatus: string;
  bloodType: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactRelationship: string;
  insuranceProvider: string;
  insurancePolicyNumber: string;
};

export interface IPatientDrawerProps {
  mode: ModalDrawerModeEnum | null;
  patient: IPatient | null;
  onClose: () => void;
  onSave: (values: PatientFormValues) => void;
  onEdit: (patient: IPatient) => void;
}
