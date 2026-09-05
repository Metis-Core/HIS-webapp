import type { DepartmentEnum, ModalDrawerModeEnum, SortOrderEnum, UserRoleEnum, UserStatusEnum } from '@/enum';
import type { IBaseEntity } from './base.interface';

export interface IUser extends IBaseEntity {
  email: string;
  username: string;
  role: UserRoleEnum;
  department: DepartmentEnum;
  status: UserStatusEnum;
  passwordLastChangedAt?: Date | null;
  firstName?: string;
  lastName?: string;
  phone?: string;
  mustResetPassword?: boolean;
}

export interface ICreateUserDto {
  email: string;
  username: string;
  password: string;
  role?: UserRoleEnum;
  department: DepartmentEnum;
  status?: UserStatusEnum;
}

export interface IUpdateUserDto {
  email?: string;
  username?: string;
  password?: string;
  role?: UserRoleEnum;
  department?: DepartmentEnum;
  status?: UserStatusEnum;
}

export interface IUserFilters {
  page?: number;
  limit?: number;
  role?: UserRoleEnum;
  department?: DepartmentEnum;
  status?: UserStatusEnum;
  search?: string;
  sortOrder?: SortOrderEnum;
}

export type UserFormValues = {
  username: string;
  email: string;
  password: string;
  role: string;
  department: string;
  status: string;
};

export interface IUserDrawerProps {
  mode: ModalDrawerModeEnum | null;
  user: IUser | null;
  onClose: () => void;
  onSave: (values: UserFormValues) => void;
  onEdit: (user: IUser) => void;
}
