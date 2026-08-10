import Cookies from 'js-cookie';
import { AuthCookieEnum } from '@/enum';
import type { IAuthTokens } from '@/interfaces';

const REFRESH_COOKIE_MAX_AGE_DAYS = 7;

class TokenStore {
  private accessToken: string | null = null;

  getAccessToken(): string | null {
    return this.accessToken;
  }

  setAccessToken(token: string | null): void {
    this.accessToken = token;
  }

  getRefreshToken(): string | undefined {
    return Cookies.get(AuthCookieEnum.REFRESH_TOKEN);
  }

  setRefreshToken(token: string): void {
    Cookies.set(AuthCookieEnum.REFRESH_TOKEN, token, {
      expires: REFRESH_COOKIE_MAX_AGE_DAYS,
      path: '/',
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
    });
  }

  setTokens({ accessToken, refreshToken }: IAuthTokens): void {
    this.setAccessToken(accessToken);
    this.setRefreshToken(refreshToken);
  }

  clear(): void {
    this.accessToken = null;
    Cookies.remove(AuthCookieEnum.REFRESH_TOKEN, { path: '/' });
  }

  hasSession(): boolean {
    return Boolean(this.getRefreshToken());
  }
}

export const tokenStore = new TokenStore();
export default tokenStore;
