import type { AuthErrorCodeEnum, AuthStatusEnum, JwtTokenTypeEnum, UserRoleEnum } from '@/enum';
import type { DepartmentEnum, UserStatusEnum } from '@/enum';
import type { IUser } from './user.interface';

export interface ILoginDto {
  identifier: string;
  password: string;
}

export interface IAuthTokens {
  accessToken: string;
  refreshToken: string;
  mustResetPassword?: boolean;
}

export interface IJwtPayload {
  sub: string;
  email: string;
  role: UserRoleEnum;
  department: DepartmentEnum;
  status: UserStatusEnum;
  type: JwtTokenTypeEnum;
  iat: number;
  exp: number;
}

export interface IAuthError {
  code: AuthErrorCodeEnum;
  message: string;
  statusCode?: number;
}

export interface IAuthState {
  status: AuthStatusEnum;
  user: IUser | null;
  error: IAuthError | null;
}

export interface IAuthContext extends IAuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  /** Role the UI renders for; differs from user.role when an admin is viewing as another role. */
  effectiveRole: UserRoleEnum | null;
  /** False for an admin who hasn't chosen a role this session. */
  isRolePicked: boolean;
  viewAsRole: (role: UserRoleEnum | null) => void;
  login: (dto: ILoginDto) => Promise<IUser>;
  logout: (options?: { allDevices?: boolean }) => Promise<void>;
  refreshUser: () => Promise<IUser | undefined>;
}
