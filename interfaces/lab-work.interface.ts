import type { IPageQuery } from './base.interface';
import type { LabAgeBandEnum, LabOrderItemStatusEnum, LabOrderStatusEnum, LabPriorityEnum } from '@/enum';

/** Inclusive calendar days, YYYY-MM-DD. */
export interface ILabDayRange {
  from?: string;
  to?: string;
}

export interface ILabOrderFilters extends ILabDayRange {
  page?: number;
  limit?: number;
  patientId?: string;
  consultationId?: string;
  visitId?: string;
  orderedById?: string;
  /** One status or several (sent comma-separated). */
  status?: LabOrderStatusEnum | LabOrderStatusEnum[];
  /** Patient name, MRN or phone. */
  search?: string;
  priority?: LabPriorityEnum;
}

export interface ILabItemFilters extends IPageQuery, ILabDayRange {
  status?: LabOrderItemStatusEnum | LabOrderItemStatusEnum[];
  testId?: string;
  search?: string;
}

export type ILabBoardSummary = Record<LabOrderItemStatusEnum, number>;

export interface ILabReportFilters extends IPageQuery, ILabDayRange {
  gender?: string;
  ageBand?: LabAgeBandEnum;
  test?: string;
}

export interface ILabReportRow {
  testId: string;
  testCode: string;
  testName: string;
  gender: string;
  ageBand: LabAgeBandEnum | null;
  total: number;
  abnormal: number;
  critical: number;
}
