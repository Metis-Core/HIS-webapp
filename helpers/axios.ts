import axios, { AxiosError, type AxiosInstance, type InternalAxiosRequestConfig } from 'axios';
import { AuthEndpointEnum } from '@/enum';
import type { IAuthTokens } from '@/interfaces';
import tokenStore from './tokens';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

type RetriableConfig = InternalAxiosRequestConfig & { _retry?: boolean };

let refreshing: Promise<IAuthTokens> | null = null;

const isAuthPublicEndpoint = (url: string): boolean =>
  url.endsWith(AuthEndpointEnum.LOGIN) ||
  url.endsWith(AuthEndpointEnum.SIGNUP) ||
  url.endsWith(AuthEndpointEnum.REFRESH);

const performRefresh = async (): Promise<IAuthTokens> => {
  refreshing ??= (async () => {
    try {
      const refreshToken = tokenStore.getRefreshToken();
      if (!refreshToken) throw new Error('Missing refresh token');
      const { data } = await axios.post<IAuthTokens>(
        `${API_BASE_URL}${AuthEndpointEnum.REFRESH}`,
        { refreshToken },
        { headers: { 'Content-Type': 'application/json' } },
      );
      tokenStore.setTokens(data);
      return data;
    } finally {
      refreshing = null;
    }
  })();
  return refreshing;
};

const onUnauthenticated = () => {
  tokenStore.clear();
  if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/auth')) {
    window.location.assign('/auth');
  }
};

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = tokenStore.getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as RetriableConfig | undefined;
    const status = error.response?.status;
    const url = original?.url ?? '';

    if (!original || status !== 401 || original._retry || isAuthPublicEndpoint(url)) {
      return Promise.reject(error);
    }

    if (!tokenStore.getRefreshToken()) {
      onUnauthenticated();
      return Promise.reject(error);
    }

    original._retry = true;
    try {
      await performRefresh();
      return api(original);
    } catch (refreshError) {
      onUnauthenticated();
      return Promise.reject(refreshError);
    }
  },
);

export default api;
