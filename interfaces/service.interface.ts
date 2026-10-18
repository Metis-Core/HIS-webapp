import type { ModalDrawerModeEnum, SortOrderEnum } from '@/enum';
import type { IBaseEntity } from './base.interface';

export interface IService extends IBaseEntity {
  name: string;
  /** Stable lookup key, e.g. CONSULTATION for the check-in fee. */
  code?: string | null;
  fee: number;
  description?: string | null;
  isActive: boolean;
}

export interface ICreateServiceDto {
  name: string;
  code?: string;
  fee: number;
  description?: string;
  isActive?: boolean;
}

export type IUpdateServiceDto = Partial<ICreateServiceDto>;

export interface IServiceFilters {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  sortOrder?: SortOrderEnum;
}

export type ServiceFormValues = {
  name: string;
  code: string;
  fee: string;
  description: string;
  isActive: boolean;
};

export interface IServiceDrawerProps {
  mode: ModalDrawerModeEnum | null;
  service: IService | null;
  onClose: () => void;
  onSave: (values: ServiceFormValues) => void;
  onEdit: (service: IService) => void;
}
