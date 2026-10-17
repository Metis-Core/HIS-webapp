import { AxiosError } from 'axios';

/** Error body produced by the API's global exception filter. */
export interface IApiErrorBody {
  code: string;
  message: string;
  details?: unknown;
}

/** Legacy bodies (`{ message }`) and the standard failure envelope (`{ status: 'failed', error }`). */
interface IErrorPayload {
  status?: string;
  message?: string | string[];
  error?: IApiErrorBody | string;
}

const STATUS_FALLBACKS: Record<number, string> = {
  403: 'You do not have permission to do that',
  404: 'The record could not be found',
  409: 'This conflicts with an existing record',
  429: 'Too many attempts — wait a minute and try again',
};

const joinMessages = (value: unknown): string | null => {
  if (Array.isArray(value)) {
    const parts = value.filter((v): v is string => typeof v === 'string' && v.trim() !== '');
    return parts.length ? parts.join(', ') : null;
  }
  return typeof value === 'string' && value.trim() ? value : null;
};

/** Returns true when a response body is the API's failure envelope. */
export function isFailureEnvelope(body: unknown): body is { status: 'failed'; error: IApiErrorBody } {
  return (
    typeof body === 'object' &&
    body !== null &&
    (body as IErrorPayload).status === 'failed' &&
    typeof (body as IErrorPayload).error === 'object'
  );
}

/** Turns any thrown value (axios error, Error, envelope) into a message that is safe to show a user. */
export function extractErrorMessage(error: unknown, fallback = 'Something went wrong — retry'): string {
  const err = error as AxiosError<IErrorPayload> | undefined;
  const data = err?.response?.data;
  if (data && typeof data === 'object') {
    const envelopeError = typeof data.error === 'object' ? data.error : undefined;
    const message =
      joinMessages(envelopeError?.message) ?? joinMessages(envelopeError?.details) ?? joinMessages(data.message);
    if (message) return message;
  }
  const status = err?.response?.status;
  if (status && STATUS_FALLBACKS[status]) return STATUS_FALLBACKS[status];
  if (error instanceof AxiosError && !err?.response) return 'Cannot reach the server — check your connection';
  return fallback;
}

/** Machine-readable error code from the failure envelope (e.g. `UNAUTHORIZED`, `TOO_MANY_REQUESTS`). */
export function extractErrorCode(error: unknown, fallback = 'UNKNOWN'): string {
  const data = (error as AxiosError<IErrorPayload> | undefined)?.response?.data;
  if (data && typeof data === 'object' && typeof data.error === 'object' && data.error.code) return data.error.code;
  return fallback;
}
