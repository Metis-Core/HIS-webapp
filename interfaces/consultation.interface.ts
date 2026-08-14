import type { IBaseEntity, SortOrder } from '.';
import type { DepartmentEnum } from '@/enum';
import type { ConsultationStatusEnum, ConsultationTypeEnum } from '@/enum/consultation.enum';
import type { IPatient } from './patient.interface';
import type { IUser } from './user.interface';

export interface IConsultation extends IBaseEntity {
  patientId: string;
  patient?: IPatient;
  doctorId: string;
  doctor?: IUser;
  visitId?: string | null;
  triageId?: string | null;
  type: ConsultationTypeEnum;
  status: ConsultationStatusEnum;
  department: DepartmentEnum;
  chiefComplaint: string;
  historyOfPresentIllness?: string | null;
  examinationFindings?: string | null;
  assessment?: string | null;
  diagnosis?: string | null;
  icd10Codes?: string | null;
  plan?: string | null;
  notes?: string | null;
  followUpDate?: string | null;
  startedAt: string;
  completedAt?: string | null;
}

export interface ICreateConsultationDto {
  patientId: string;
  doctorId?: string;
  visitId?: string;
  triageId?: string;
  type?: ConsultationTypeEnum;
  status?: ConsultationStatusEnum;
  department?: DepartmentEnum;
  chiefComplaint: string;
  historyOfPresentIllness?: string;
  examinationFindings?: string;
  assessment?: string;
  diagnosis?: string;
  icd10Codes?: string;
  plan?: string;
  notes?: string;
  followUpDate?: string;
}

export type IUpdateConsultationDto = Partial<ICreateConsultationDto>;

export interface ICompleteConsultationDto {
  nextDepartment?: DepartmentEnum;
  notes?: string;
}

export interface IConsultationFilters {
  q?: string;
  patientId?: string;
  doctorId?: string;
  visitId?: string;
  triageId?: string;
  status?: ConsultationStatusEnum;
  type?: ConsultationTypeEnum;
  department?: DepartmentEnum;
  sortBy?: 'createdAt' | 'startedAt' | 'completedAt' | 'followUpDate';
  sortOrder?: SortOrder;
  page?: number;
  limit?: number;
}

export interface ICompleteConsultationResult {
  consultation: IConsultation;
  queueUpdate: unknown | null;
}
