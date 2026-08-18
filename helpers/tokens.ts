import { AuthCookieEnum } from '@/enum';
import type { IAuthTokens } from '@/interfaces';

// Persist the refresh token in localStorage so it survives app restarts on
// Tauri (where cookies with Secure/SameSite flags can be dropped).
class TokenStore {
  private accessToken: string | null = null;

  getAccessToken(): string | null {
    return this.accessToken;
  }

  setAccessToken(token: string | null): void {
    this.accessToken = token;
  }

  getRefreshToken(): string | undefined {
    if (typeof window === 'undefined') return undefined;
    return window.localStorage.getItem(AuthCookieEnum.REFRESH_TOKEN) ?? undefined;
  }

  setRefreshToken(token: string): void {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(AuthCookieEnum.REFRESH_TOKEN, token);
  }

  setTokens({ accessToken, refreshToken }: IAuthTokens): void {
    this.setAccessToken(accessToken);
    this.setRefreshToken(refreshToken);
  }

  clear(): void {
    this.accessToken = null;
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(AuthCookieEnum.REFRESH_TOKEN);
    }
  }

  hasSession(): boolean {
    return Boolean(this.getRefreshToken());
  }
}

export const tokenStore = new TokenStore();
export default tokenStore;
