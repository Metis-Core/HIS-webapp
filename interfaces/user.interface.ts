import type { DepartmentEnum, ModalDrawerModeEnum, UserRoleEnum, UserStatusEnum } from '@/enum';
import type { IBaseEntity } from '.';

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
