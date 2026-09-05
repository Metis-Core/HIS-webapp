import type { IBaseEntity } from './base.interface';
import type {
  ConsciousnessLevelEnum,
  DepartmentEnum,
  SortOrderEnum,
  TriageAcuityEnum,
  TriageSortByEnum,
  TriageStatusEnum,
} from '@/enum';
import type { IPatient } from './patient.interface';
import type { IUser } from './user.interface';

export interface ITriage extends IBaseEntity {
  patientId: string;
  patient?: IPatient;
  triagedById: string;
  triagedBy?: IUser;
  visitId?: string | null;
  acuity: TriageAcuityEnum;
  status: TriageStatusEnum;
  chiefComplaint: string;
  assessmentNotes?: string | null;
  consciousness: ConsciousnessLevelEnum;
  temperatureC?: number | null;
  heartRate?: number | null;
  respiratoryRate?: number | null;
  bloodPressureSystolic?: number | null;
  bloodPressureDiastolic?: number | null;
  oxygenSaturation?: number | null;
  weightKg?: number | null;
  heightCm?: number | null;
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
  nextIntents?: string[];
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
  sortBy?: TriageSortByEnum;
  sortOrder?: SortOrderEnum;
  page?: number;
  limit?: number;
}
