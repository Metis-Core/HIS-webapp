import { IBaseEntity } from '.';
import type { DepartmentEnum } from '@/enum';
import type { QueueEntryStatusEnum, VisitStatusEnum, VisitTypeEnum } from '@/enum/queue.enum';
import type { IPatient } from './patient.interface';
import type { IUser } from './user.interface';

export interface IVisit extends IBaseEntity {
  patientId: string;
  patient?: IPatient;
  tokenNumber: string;
  serviceDate: string;
  visitType: VisitTypeEnum;
  status: VisitStatusEnum;
  currentDepartment: DepartmentEnum;
  priority: number;
  triageId?: string | null;
  checkedInById: string;
  checkedInBy?: IUser;
  checkedInAt: string;
  completedAt?: string | null;
  queueEntries?: IQueueEntry[];
}

export interface IQueueEntry extends IBaseEntity {
  visitId: string;
  visit?: IVisit;
  department: DepartmentEnum;
  status: QueueEntryStatusEnum;
  priority: number;
  sequenceNumber: number;
  servedById?: string | null;
  servedBy?: IUser | null;
  calledAt?: string | null;
  startedAt?: string | null;
  completedAt?: string | null;
  notes?: string | null;
}

export interface ICheckInVisitDto {
  patientId: string;
  visitType?: VisitTypeEnum;
  department?: DepartmentEnum;
  notes?: string;
}

export interface ICompleteQueueStageDto {
  nextDepartment?: DepartmentEnum;
  notes?: string;
  triageId?: string;
}

export interface ITransferQueueEntryDto {
  nextDepartment: DepartmentEnum;
  notes?: string;
}

export interface IQueueFilters {
  department?: DepartmentEnum;
  status?: QueueEntryStatusEnum;
  patientId?: string;
  visitId?: string;
  visitType?: VisitTypeEnum;
  visitStatus?: VisitStatusEnum;
  serviceDate?: string;
  page?: number;
  limit?: number;
}
