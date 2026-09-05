import type { IBaseEntity } from './base.interface';
import {
  DepartmentEnum,
  QueueEntryStatusEnum,
  VisitIntentEnum,
  VisitStatusEnum,
  VisitTypeEnum,
} from '@/enum/queue.enum';
import type { IPatient } from './patient.interface';

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
}

export interface IVisitRecord extends IBaseEntity {
  patientId: string;
  patient?: IPatient;
  visitType: VisitTypeEnum;
  status: VisitStatusEnum;
  checkedInById: string;
  metadata: Record<string, unknown>;
  queueEntries: IQueueEntryRecord[];
}

export interface ICreateVisitDto {
  patientId: string;
  visitType?: VisitTypeEnum;
  intent: VisitIntentEnum[];
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
