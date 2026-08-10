import type { DepartmentEnum, UserRoleEnum, UserStatusEnum } from '@/enum';
import type { IBaseEntity } from '.';

export interface IUser extends IBaseEntity {
  email: string;
  username: string;
  role: UserRoleEnum;
  department: DepartmentEnum;
  status: UserStatusEnum;
  firstName?: string;
  lastName?: string;
  phone?: string;
  mustResetPassword?: boolean;
}
