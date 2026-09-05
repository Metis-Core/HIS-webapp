import type { IBaseEntity } from './base.interface';
import type {
  LabOrderItemStatusEnum,
  LabOrderStatusEnum,
  LabPriorityEnum,
  LabSampleTypeEnum,
  LabTestCategoryEnum,
} from '@/enum';
import type { IPatient } from './patient.interface';
import type { IUser } from './user.interface';

export interface ILab extends IBaseEntity {}

export interface ILabTest extends IBaseEntity {
  code: string;
  name: string;
  description?: string | null;
  category: LabTestCategoryEnum;
  sampleType: LabSampleTypeEnum;
  unit?: string | null;
  referenceRange?: string | null;
  price: number;
  turnaroundHours?: number | null;
  isActive: boolean;
}

export interface ICreateLabTestDto {
  code: string;
  name: string;
  description?: string;
  category: LabTestCategoryEnum;
  sampleType: LabSampleTypeEnum;
  unit?: string;
  referenceRange?: string;
  price: number;
  turnaroundHours?: number;
  isActive?: boolean;
}

export type IUpdateLabTestDto = Partial<ICreateLabTestDto>;

export interface ILabTestFilters {
  page?: number;
  limit?: number;
  search?: string;
  category?: LabTestCategoryEnum;
  sampleType?: LabSampleTypeEnum;
  isActive?: boolean;
}

export interface ILabOrderItem extends IBaseEntity {
  orderId: string;
  testId: string;
  test?: ILabTest;
  status: LabOrderItemStatusEnum;
  resultValue?: string | null;
  resultNotes?: string | null;
  isAbnormal: boolean;
  resultedById?: string | null;
  resultedBy?: IUser | null;
  collectedAt?: Date | null;
  resultedAt?: Date | null;
}

export interface ILabOrder extends IBaseEntity {
  patientId: string;
  patient?: IPatient;
  consultationId?: string | null;
  visitId?: string | null;
  orderedById: string;
  orderedBy?: IUser;
  status: LabOrderStatusEnum;
  priority: LabPriorityEnum;
  clinicalNotes?: string | null;
  completedAt?: Date | null;
  items: ILabOrderItem[];
}

export interface ICreateLabOrderItemDto {
  testId: string;
}

export interface ICreateLabOrderDto {
  patientId: string;
  consultationId?: string;
  visitId?: string;
  priority?: LabPriorityEnum;
  clinicalNotes?: string;
  items: ICreateLabOrderItemDto[];
}

export interface IUpdateLabOrderDto {
  status?: LabOrderStatusEnum;
  priority?: LabPriorityEnum;
  clinicalNotes?: string;
}

export interface IUpdateLabOrderItemDto {
  status?: LabOrderItemStatusEnum;
  resultValue?: string;
  resultNotes?: string;
  isAbnormal?: boolean;
}

export interface ILabOrderFilters {
  page?: number;
  limit?: number;
  patientId?: string;
  consultationId?: string;
  visitId?: string;
  orderedById?: string;
  status?: LabOrderStatusEnum;
  priority?: LabPriorityEnum;
}
