const STORAGE_KEY = 'metis.apiBaseUrl';
const DEFAULT_URL = process.env.NEXT_PUBLIC_API_URL ?? '';

const stripTrailingSlash = (value: string) => value.replace(/\/+$/, '');

export const getApiBaseUrl = (): string => {
  if (typeof window !== 'undefined') {
    const override = window.localStorage.getItem(STORAGE_KEY);
    if (override && override.trim()) return stripTrailingSlash(override.trim());
  }
  return stripTrailingSlash(DEFAULT_URL);
};

export const setApiBaseUrl = (value: string): string => {
  const clean = stripTrailingSlash(value.trim());
  if (!clean) {
    window.localStorage.removeItem(STORAGE_KEY);
    return stripTrailingSlash(DEFAULT_URL);
  }
  window.localStorage.setItem(STORAGE_KEY, clean);
  return clean;
};

export const getDefaultApiBaseUrl = (): string => stripTrailingSlash(DEFAULT_URL);

export const hasApiOverride = (): boolean =>
  typeof window !== 'undefined' && !!window.localStorage.getItem(STORAGE_KEY);
