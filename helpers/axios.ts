import axios, { AxiosError, type AxiosResponse } from 'axios';
import { isFailureEnvelope } from './errors';
import tokenStore from './tokens';

export const API_URL = process.env.NEXT_PUBLIC_API_URL || '/his';

export const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = tokenStore.getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let refreshPromise: Promise<void> | null = null;

/**
 * Some legacy endpoints answered failures with HTTP 200 and `{ status: 'failed' }`.
 * Treat that body as an error so callers never mistake it for data.
 */
const rejectFailureEnvelope = (res: AxiosResponse): AxiosResponse | Promise<never> => {
  if (!isFailureEnvelope(res.data)) return res;
  const status = res.status >= 400 ? res.status : 500;
  return Promise.reject(
    new AxiosError(res.data.error.message, res.data.error.code, res.config, res.request, { ...res, status }),
  );
};

api.interceptors.response.use(rejectFailureEnvelope, async (error) => {
  const original = error.config;
  if (error.response?.status === 401 && !original._retry) {
    original._retry = true;
    if (!refreshPromise) {
      refreshPromise = (async () => {
        try {
          const refreshToken = tokenStore.getRefreshToken();
          if (!refreshToken) throw new Error('No refresh token');
          const { data } = await publicApi.post('/auth/refresh', { refreshToken });
          tokenStore.setTokens(data);
        } finally {
          refreshPromise = null;
        }
      })();
    }
    try {
      await refreshPromise;
      original.headers.Authorization = `Bearer ${tokenStore.getAccessToken()}`;
      return api(original);
    } catch {
      tokenStore.clear();
      if (typeof window !== 'undefined') window.location.href = '/auth';
      return Promise.reject(error);
    }
  }
  return Promise.reject(error);
});

export const publicApi = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

publicApi.interceptors.response.use(rejectFailureEnvelope);
