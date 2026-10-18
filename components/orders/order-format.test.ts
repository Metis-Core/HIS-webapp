import { describe, expect, it } from 'vitest';
import { LabResultFlagEnum, ResultClassificationEnum } from '@/enum';
import type { ILabResultField } from '@/interfaces';
import { previewFlags, suggestClassification } from './order-format';

const lungs: ILabResultField = {
  key: 'lungs',
  label: 'Lungs',
  type: 'select',
  options: ['Clear', 'Consolidation'],
  normalValues: ['Clear'],
};
const rate: ILabResultField = {
  key: 'rate',
  label: 'Heart rate',
  type: 'number',
  ranges: [{ low: 60, high: 100, criticalLow: 40, criticalHigh: 150 }],
};

describe('previewFlags', () => {
  it('flags an answer outside the normal values', () => {
    expect(previewFlags([lungs], { lungs: 'Consolidation' })).toEqual({ lungs: LabResultFlagEnum.ABNORMAL });
    expect(previewFlags([lungs], { lungs: 'Clear' })).toEqual({});
  });

  it('flags numbers against the reference interval', () => {
    expect(previewFlags([rate], { rate: 72 })).toEqual({});
    expect(previewFlags([rate], { rate: 120 })).toEqual({ rate: LabResultFlagEnum.HIGH });
    expect(previewFlags([rate], { rate: 160 })).toEqual({ rate: LabResultFlagEnum.CRITICAL_HIGH });
    expect(previewFlags([rate], { rate: 30 })).toEqual({ rate: LabResultFlagEnum.CRITICAL_LOW });
  });

  it('ignores fields that are not filled in', () => {
    expect(previewFlags([lungs, rate], {})).toEqual({});
  });
});

describe('suggestClassification', () => {
  it('is normal with no flags, abnormal with any flag and critical when a flag is critical', () => {
    expect(suggestClassification({})).toBe(ResultClassificationEnum.NORMAL);
    expect(suggestClassification({ a: LabResultFlagEnum.HIGH })).toBe(ResultClassificationEnum.ABNORMAL);
    expect(suggestClassification({ a: LabResultFlagEnum.HIGH, b: LabResultFlagEnum.CRITICAL_LOW })).toBe(
      ResultClassificationEnum.CRITICAL,
    );
  });
});
