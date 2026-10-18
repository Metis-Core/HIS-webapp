import { api, publicApi } from './axios';
import tokenStore from './tokens';
import type { IAuthTokens, ILoginDto, IUser } from '@/interfaces';
import { AuthEndpointEnum } from '@/enum';

export interface ILoginResponse {
  tokens: IAuthTokens;
  user: IUser;
}

class AuthService {
  async login(dto: ILoginDto): Promise<ILoginResponse> {
    const { data } = await publicApi.post<ILoginResponse>(AuthEndpointEnum.LOGIN, dto);
    tokenStore.setTokens(data.tokens);
    return data;
  }

  async refresh(): Promise<IAuthTokens> {
    const refreshToken = tokenStore.getRefreshToken();
    if (!refreshToken) throw new Error('No refresh token');
    const { data } = await publicApi.post<IAuthTokens>(AuthEndpointEnum.REFRESH, { refreshToken });
    tokenStore.setTokens(data);
    return data;
  }

  /**
   * Changes the signed-in user's password. The API revokes every other session and
   * returns fresh tokens for this one, so store them immediately.
   */
  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    const { data } = await api.post<IAuthTokens>(AuthEndpointEnum.CHANGE_PASSWORD, { currentPassword, newPassword });
    tokenStore.setTokens(data);
  }

  /** Self-service username change; the API asks for the current password again. */
  async updateProfile(username: string, currentPassword: string): Promise<IUser> {
    const { data } = await api.patch<IUser>(AuthEndpointEnum.ME, { username, currentPassword });
    return data;
  }

  async me(): Promise<IUser> {
    const { data } = await api.get<IUser>(AuthEndpointEnum.ME);
    return data;
  }

  async logout(allDevices = false): Promise<void> {
    const refreshToken = tokenStore.getRefreshToken();
    try {
      await api.post(AuthEndpointEnum.LOGOUT, { refreshToken });
    } catch {}
    tokenStore.clear();
  }
}

const authService = new AuthService();
export default authService;
