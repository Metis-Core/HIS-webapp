import { describe, expect, it } from 'vitest';
import { formatWait, sumCounts, titleCase } from './management-format';

describe('formatWait', () => {
  it('reads naturally at every scale', () => {
    expect(formatWait(45)).toBe('45s');
    expect(formatWait(600)).toBe('10 min');
    expect(formatWait(5_400)).toBe('1 h 30 min');
  });
});

describe('titleCase', () => {
  it('turns enum values into labels', () => {
    expect(titleCase('outpatient_clinic')).toBe('Outpatient clinic');
  });
});

describe('sumCounts', () => {
  it('adds up the rows', () => {
    expect(
      sumCounts([
        { label: 'a', count: 2 },
        { label: 'b', count: 5 },
      ]),
    ).toBe(7);
  });
});
