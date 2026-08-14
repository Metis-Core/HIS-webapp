import type { ReactNode } from 'react';
import type { IconType } from 'react-icons';
import type { ButtonVariantEnum, ModalDrawerModeEnum, PillVariantEnum } from '@/enum';
import type { StatVariantEnum } from '@/enum/stat.enum';
import type { IPatient } from './patient.interface';

export * from './auth.interface';
export * from './user.interface';
export * from './patient.interface';
export * from './queue.interfaces';
export * from './triage.interface';
export * from './consultation.interface';

export interface IBaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface IResponse<T> {
  data: T;
  pagination: IPagination;
}

export interface IError {
  message: string;
  statusCode: number;
}

export type SortOrder = 'ASC' | 'DESC';

export interface IListQuery {
  page?: number;
  limit?: number;
  sortOrder?: SortOrder;
}

export interface IPaginatedList<T> {
  items: T[];
  total: number;
}

export interface IPagedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

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
  allergies: string;
};

export interface IPatientDrawerProps {
  mode: ModalDrawerModeEnum | null;
  patient: IPatient | null;
  onClose: () => void;
  onSave: (values: PatientFormValues) => void;
  onEdit: (patient: IPatient) => void;
}
