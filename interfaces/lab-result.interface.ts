import type { LabResultFlagEnum } from '@/enum';
import type { IBaseEntity } from './base.interface';
import type { IUser } from './user.interface';

export type LabResultFieldType = 'number' | 'text' | 'select' | 'boolean';
export type LabSexEnumValue = 'male' | 'female';

/** One reference interval; the most specific one matching the patient's sex and age applies. */
export interface ILabReferenceRange {
  sex?: LabSexEnumValue;
  /** Inclusive lower age bound in years. */
  minAgeYears?: number;
  /** Exclusive upper age bound in years. */
  maxAgeYears?: number;
  low?: number;
  high?: number;
  criticalLow?: number;
  criticalHigh?: number;
}

export interface ILabResultField {
  key: string;
  label: string;
  type: LabResultFieldType;
  unit?: string;
  options?: string[];
  required?: boolean;
  helpText?: string;
  /** Section heading on the form and report, e.g. "Microscopy". */
  group?: string;
  ranges?: ILabReferenceRange[];
  /** Expected answers for select/text fields; anything else is flagged abnormal. */
  normalValues?: string[];
}

export interface ILabResultSchema {
  fields: ILabResultField[];
}

export type LabResultValue = string | number | boolean;
export type ILabResultData = Record<string, LabResultValue>;
export type ILabResultFlags = Record<string, LabResultFlagEnum>;

export interface ILabResultAmendment extends IBaseEntity {
  itemId: string;
  previousData: ILabResultData | null;
  previousFlags: ILabResultFlags | null;
  previousNotes: string | null;
  newData: ILabResultData | null;
  newNotes: string | null;
  reason: string;
  amendedById: string;
  amendedBy?: IUser;
  previousVerifiedAt: Date | null;
}

export interface ILabAttachment extends IBaseEntity {
  itemId: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  sha256: string;
  uploadedById: string;
  uploadedBy?: IUser;
}

export interface IAmendLabResultDto {
  resultData: ILabResultData;
  resultNotes?: string;
  reason: string;
}
