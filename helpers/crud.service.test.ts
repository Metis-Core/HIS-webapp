import { describe, expect, it } from 'vitest';
import { buildQuery } from './crud.service';

describe('buildQuery', () => {
  it('skips empty values and joins list filters with commas', () => {
    expect(buildQuery({ search: '', page: 2, status: ['unpaid', 'partially_paid'], from: undefined })).toBe(
      '?page=2&status=unpaid%2Cpartially_paid',
    );
  });

  it('returns an empty string when there is nothing to send', () => {
    expect(buildQuery({})).toBe('');
    expect(buildQuery({ status: [] })).toBe('');
  });
});
