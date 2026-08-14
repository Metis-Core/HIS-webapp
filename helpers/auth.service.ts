import { AxiosError } from 'axios';
import { AuthEndpointEnum, AuthErrorCodeEnum } from '@/enum';
import type { IAuthError, IAuthTokens, ILoginDto, ISignupDto, IUser } from '@/interfaces';
import api from './axios';
import tokenStore from './tokens';

class AuthApiError extends Error implements IAuthError {
  readonly code: AuthErrorCodeEnum;
  readonly statusCode?: number;

  constructor(code: AuthErrorCodeEnum, message: string, statusCode?: number) {
    super(message);
    this.name = 'AuthApiError';
    this.code = code;
    this.statusCode = statusCode;
  }
}

const toAuthError = (error: unknown): AuthApiError => {
  if (error instanceof AuthApiError) return error;
  if (error instanceof AxiosError) {
    const status = error.response?.status;
    const message =
      (error.response?.data as { message?: string | string[] } | undefined)?.message?.toString() ?? error.message;
    if (status === 401) return new AuthApiError(AuthErrorCodeEnum.INVALID_CREDENTIALS, message, status);
    if (status === 403) return new AuthApiError(AuthErrorCodeEnum.ACCOUNT_SUSPENDED, message, status);
    if (!error.response) return new AuthApiError(AuthErrorCodeEnum.NETWORK, message);
    return new AuthApiError(AuthErrorCodeEnum.UNKNOWN, message, status);
  }
  return new AuthApiError(AuthErrorCodeEnum.UNKNOWN, (error as Error)?.message ?? 'Unknown error');
};

class AuthService {
  async login(dto: ILoginDto): Promise<IAuthTokens> {
    try {
      const { data } = await api.post<IAuthTokens>(AuthEndpointEnum.LOGIN, dto);
      tokenStore.setTokens(data);
      return data;
    } catch (error) {
      console.log('error');
      console.log(error);
      throw toAuthError(error);
    }
  }

  async signup(dto: ISignupDto): Promise<IAuthTokens> {
    try {
      const { data } = await api.post<IAuthTokens>(AuthEndpointEnum.SIGNUP, dto);
      tokenStore.setTokens(data);
      return data;
    } catch (error) {
      throw toAuthError(error);
    }
  }

  async logout(options: { allDevices?: boolean } = {}): Promise<void> {
    const refreshToken = tokenStore.getRefreshToken();
    try {
      await api.post(AuthEndpointEnum.LOGOUT, options.allDevices || !refreshToken ? {} : { refreshToken });
    } catch {
      // ignore server errors on logout; local state is cleared regardless
    } finally {
      tokenStore.clear();
    }
  }

  async me(): Promise<IUser> {
    try {
      const { data } = await api.get<IUser>(AuthEndpointEnum.ME);
      return data;
    } catch (error) {
      throw toAuthError(error);
    }
  }
}

export const authService = new AuthService();
export { AuthApiError };
export default authService;
