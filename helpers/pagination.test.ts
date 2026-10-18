import { describe, expect, it } from 'vitest';
import { pageInfo } from './pagination';

describe('pageInfo', () => {
  it('reads the meta block', () => {
    const info = pageInfo({ items: [], total: 45, meta: { total: 45, page: 2, limit: 20, hasNextPage: true } });
    expect(info).toEqual({ total: 45, page: 2, limit: 20, hasNextPage: true });
  });

  it('falls back to the legacy top-level fields', () => {
    const info = pageInfo({ items: [], total: 30, page: 1, limit: 20 });
    expect(info).toMatchObject({ total: 30, page: 1, limit: 20, hasNextPage: true });
  });

  it('treats a missing response as an empty first page', () => {
    expect(pageInfo(undefined)).toEqual({ total: 0, page: 1, limit: 20, hasNextPage: false });
  });
});
