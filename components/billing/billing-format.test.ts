import { describe, expect, it } from 'vitest';
import { formatFee, formatUGX } from './billing-format';

describe('formatFee', () => {
  it('shows a zero fee as Free and any other fee in UGX', () => {
    expect(formatFee(0)).toBe('Free');
    expect(formatFee(30000)).toBe(formatUGX(30000));
  });
});
