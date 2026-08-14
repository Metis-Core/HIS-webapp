import type { IBaseEntity, SortOrder } from '.';
import type { DepartmentEnum } from '@/enum';
import type { ConsciousnessLevelEnum, TriageAcuityEnum, TriageStatusEnum } from '@/enum/triage.enum';
import type { IPatient } from './patient.interface';
import type { IUser } from './user.interface';

export interface ITriage extends IBaseEntity {
  patientId: string;
  patient?: IPatient;
  triagedById: string;
  triagedBy?: IUser;
  acuity: TriageAcuityEnum;
  status: TriageStatusEnum;
  chiefComplaint: string;
  assessmentNotes?: string | null;
  consciousness: ConsciousnessLevelEnum;
  temperatureC?: string | null;
  heartRate?: number | null;
  respiratoryRate?: number | null;
  bloodPressureSystolic?: number | null;
  bloodPressureDiastolic?: number | null;
  oxygenSaturation?: string | null;
  weightKg?: string | null;
  heightCm?: string | null;
  painScore?: number | null;
  allergiesNoted?: string | null;
  referredToDepartment?: DepartmentEnum | null;
  arrivedAt: string;
  triagedAt?: string | null;
  completedAt?: string | null;
  queueNumber?: string | null;
}

export interface ICreateTriageDto {
  patientId: string;
  visitId?: string;
  triagedById?: string;
  acuity: TriageAcuityEnum;
  status?: TriageStatusEnum;
  chiefComplaint: string;
  assessmentNotes?: string;
  consciousness?: ConsciousnessLevelEnum;
  temperatureC?: number;
  heartRate?: number;
  respiratoryRate?: number;
  bloodPressureSystolic?: number;
  bloodPressureDiastolic?: number;
  oxygenSaturation?: number;
  weightKg?: number;
  heightCm?: number;
  painScore?: number;
  allergiesNoted?: string;
  referredToDepartment?: DepartmentEnum;
  arrivedAt?: string;
  triagedAt?: string;
  queueNumber?: string;
}

export type IUpdateTriageDto = Partial<ICreateTriageDto>;

export interface ITriageFilters {
  q?: string;
  patientId?: string;
  triagedById?: string;
  acuity?: TriageAcuityEnum;
  status?: TriageStatusEnum;
  referredToDepartment?: DepartmentEnum;
  arrivedFrom?: string;
  arrivedTo?: string;
  createdFrom?: string;
  createdTo?: string;
  sortBy?: 'createdAt' | 'arrivedAt' | 'acuity' | 'status' | 'triagedAt';
  sortOrder?: SortOrder;
  page?: number;
  limit?: number;
}
