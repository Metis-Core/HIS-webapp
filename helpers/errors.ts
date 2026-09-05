import type { AxiosError } from 'axios';

export function extractErrorMessage(error: unknown, fallback = 'Something went wrong — retry'): string {
  const err = error as AxiosError<{ message?: string | string[] }> | undefined;
  const data = err?.response?.data;
  if (!data) return fallback;
  const message = data.message;
  if (Array.isArray(message)) return message.join(', ');
  if (typeof message === 'string' && message.trim()) return message;
  return fallback;
}
