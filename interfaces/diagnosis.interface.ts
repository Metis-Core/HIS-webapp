import type { IBaseEntity } from './base.interface';

/** A catalogue entry from GET /icd (ICD-10-CM by default). */
export interface IDiagnosisCode extends IBaseEntity {
  system: string;
  code: string;
  title: string;
}

/** A coded diagnosis on a consultation; code and title are copied when it is recorded. */
export interface IConsultationDiagnosis extends IBaseEntity {
  consultationId: string;
  diagnosisCodeId: string | null;
  system: string;
  code: string;
  title: string | null;
  isPrimary: boolean;
  rank: number;
}

export interface IConsultationDiagnosisDto {
  codeId: string;
  isPrimary?: boolean;
}

export interface IDiagnosisCodeFilters {
  search?: string;
  system?: string;
  page?: number;
  limit?: number;
}
