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

  async signup(dto: { email: string; username: string; password: string }): Promise<ILoginResponse> {
    const { data } = await publicApi.post<ILoginResponse>(AuthEndpointEnum.SIGNUP, dto);
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

  async me(): Promise<IUser> {
    const { data } = await api.get<IUser>(AuthEndpointEnum.ME);
    return data;
  }

  async logout(allDevices = false): Promise<void> {
    const refreshToken = tokenStore.getRefreshToken();
    try {
      await api.post(AuthEndpointEnum.LOGOUT, { refreshToken });
    } catch {
      // best-effort
    }
    tokenStore.clear();
  }
}

const authService = new AuthService();
export default authService;
