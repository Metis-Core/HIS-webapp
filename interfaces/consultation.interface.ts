import type { IBaseEntity } from './base.interface';
import type {
  ConsultationSortByEnum,
  ConsultationStatusEnum,
  ConsultationTypeEnum,
  DepartmentEnum,
  SortOrderEnum,
} from '@/enum';
import type { IAdmitPatientDto } from './admission.interface';
import type { IConsultationDiagnosis, IConsultationDiagnosisDto } from './diagnosis.interface';
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
  examinationAndAssessment?: string | null;
  diagnosis?: string | null;
  diagnoses?: IConsultationDiagnosis[];
  plan?: string | null;
  notes?: string | null;
  completionNotes?: string | null;
  cancellationReason?: string | null;
  followUpDate?: string | null;
  startedAt?: string | null;
  completedAt?: string | null;
}

export interface ICreateConsultationDto {
  patientId: string;
  doctorId?: string;
  visitId?: string;
  triageId?: string;
  type?: ConsultationTypeEnum;
  department?: DepartmentEnum;
  chiefComplaint: string;
  historyOfPresentIllness?: string;
  examinationAndAssessment?: string;
  diagnosis?: string;
  diagnoses?: IConsultationDiagnosisDto[];
  plan?: string;
  notes?: string;
  followUpDate?: string;
  startedAt?: string;
}

export type IUpdateConsultationDto = Partial<ICreateConsultationDto>;

export interface ICompleteConsultationDto {
  nextDepartment?: DepartmentEnum;
  nextIntents?: string[];
  notes?: string;
  admission?: IAdmitPatientDto;
}

export interface ICancelConsultationDto {
  reason?: string;
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
  startedFrom?: string;
  startedTo?: string;
  createdFrom?: string;
  createdTo?: string;
  sortBy?: ConsultationSortByEnum;
  sortOrder?: SortOrderEnum;
  page?: number;
  limit?: number;
}

export interface IConsultationAddendum extends IBaseEntity {
  consultationId: string;
  authorId: string;
  author?: IUser;
  body: string;
}

export interface ICreateAddendumDto {
  body: string;
}
