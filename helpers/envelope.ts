/** Accepts either a bare payload or the API's `{ status: 'success', data }` envelope and returns the payload. */
export function unwrapData<T>(body: T | { status: 'success'; data: T }): T {
  if (body && typeof body === 'object' && 'status' in body && body.status === 'success' && 'data' in body) {
    return body.data;
  }
  return body as T;
}
