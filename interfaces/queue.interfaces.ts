import { IBaseEntity } from '.';
import { DepartmentEnum, QueueEntryStatusEnum, VisitTypeEnum } from '@/enum/queue.enum';
import type { IPatient } from './patient.interface';

export type IQueue = IBaseEntity;

export interface IQueueEntryRecord extends IBaseEntity {
  visitId: string;
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
  status: string;
  checkedInById: string;
  metadata: Record<string, unknown>;
  queueEntries: IQueueEntryRecord[];
}
