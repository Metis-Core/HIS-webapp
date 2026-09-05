import axios from 'axios';
import tokenStore from './tokens';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

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

api.interceptors.response.use(
  (res) => res,
  async (error) => {
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
  },
);

export const publicApi = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});
