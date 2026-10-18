import type { IBaseEntity } from './base.interface';
import {
  DepartmentEnum,
  QueueEntryStatusEnum,
  ServiceVisitKindEnum,
  TriageCategoryEnum,
  VisitIntentEnum,
  VisitStatusEnum,
  VisitTypeEnum,
} from '@/enum/queue.enum';
import type { InsuranceVerificationMethodEnum } from '@/enum/billing.enum';
import type { IPatient } from './patient.interface';
import type { IUser } from './user.interface';
import type { AssignmentSourceEnum } from '@/enum/availability.enum';

export type IQueue = IBaseEntity;

export interface IQueueEntryRecord extends IBaseEntity {
  visitId: string;
  visit?: IVisitRecord;
  department: DepartmentEnum;
  status: QueueEntryStatusEnum;
  priority: number;
  sequenceNumber: number;
  servedById: string | null;
  calledAt: Date | null;
  startedAt: Date | null;
  completedAt: Date | null;
  notes: string | null;
  /** `review: true` marks the doctor's second look at diagnostic results. */
  metadata?: { review?: boolean } | null;
}

export interface IVisitRecord extends IBaseEntity {
  patientId: string;
  patient?: IPatient;
  visitType: VisitTypeEnum;
  status: VisitStatusEnum;
  checkedInById: string;
  triageCategory: TriageCategoryEnum | null;
  emergencyNumber: string | null;
  priority: number;
  metadata: Record<string, unknown>;
  assignedDoctorId?: string | null;
  assignedDoctor?: Pick<IUser, 'id' | 'username'> | null;
  assignedAt?: string | null;
  assignmentSource?: AssignmentSourceEnum | null;
  queueEntries: IQueueEntryRecord[];
}

export interface IInsuranceVerification {
  method: InsuranceVerificationMethodEnum;
  reference: string;
}

export interface ICreateVisitDto {
  patientId: string;
  visitType?: VisitTypeEnum;
  triageCategory?: TriageCategoryEnum;
  insuranceVerification?: IInsuranceVerification;
  /** On unless switched off. */
  triage?: boolean;
  /** On unless the patient came only for other services. */
  consultation?: boolean;
  service?: ServiceVisitKindEnum;
  stages?: VisitIntentEnum[];
  preferredDoctorId?: string;
}

export interface IChangePriorityDto {
  triageCategory: TriageCategoryEnum;
  reason: string;
}

export interface IVisitTimelineStage {
  entryId: string;
  department: DepartmentEnum;
  status: QueueEntryStatusEnum;
  review: boolean;
  servedById: string | null;
  servedByName: string | null;
  readyAt: string | null;
  startedAt: string | null;
  completedAt: string | null;
  waitSeconds: number | null;
  serviceSeconds: number | null;
}

export interface IVisitTimeline {
  stages: IVisitTimelineStage[];
  totalSeconds: number | null;
}

export interface IUpdateVisitDto {
  visitType?: VisitTypeEnum;
  status?: VisitStatusEnum;
  metadata?: Record<string, unknown>;
}

export interface IVisitFilters {
  page?: number;
  limit?: number;
}
