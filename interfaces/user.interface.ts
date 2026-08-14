import type { DepartmentEnum, UserRoleEnum, UserStatusEnum } from '@/enum';
import type { IBaseEntity, IListQuery } from '.';

export interface IUser extends IBaseEntity {
  email: string;
  username: string;
  role: UserRoleEnum;
  department: DepartmentEnum;
  status: UserStatusEnum;
  passwordLastChangedAt?: string | null;
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

export type IUpdateUserDto = Partial<ICreateUserDto>;

export interface IUserFilters extends IListQuery {
  role?: UserRoleEnum;
  department?: DepartmentEnum;
  status?: UserStatusEnum;
  search?: string;
}
