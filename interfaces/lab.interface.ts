import type { IBaseEntity } from './base.interface';
import type {
  LabOrderItemStatusEnum,
  LabOrderStatusEnum,
  LabPriorityEnum,
  LabSampleTypeEnum,
  LabTestCategoryEnum,
} from '@/enum';
import type { ILabResultData, ILabResultFlags, ILabResultSchema } from './lab-result.interface';
import type { IPatient } from './patient.interface';
import type { IUser } from './user.interface';

export * from './lab-result.interface';
export * from './lab-work.interface';

export interface ILabTest extends IBaseEntity {
  code: string;
  /** Short name staff search by, e.g. FBC for the CBC. */
  abbreviation?: string | null;
  name: string;
  description?: string | null;
  category: LabTestCategoryEnum;
  sampleType: LabSampleTypeEnum;
  unit?: string | null;
  price: number;
  turnaroundHours?: number | null;
  resultSchema?: ILabResultSchema | null;
  isActive: boolean;
}

export interface ICreateLabTestDto {
  code: string;
  abbreviation?: string;
  name: string;
  description?: string;
  category: LabTestCategoryEnum;
  sampleType: LabSampleTypeEnum;
  unit?: string;
  price: number;
  turnaroundHours?: number;
  resultSchema?: ILabResultSchema;
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
  order?: ILabOrder;
  testId: string;
  test?: ILabTest;
  status: LabOrderItemStatusEnum;
  /** Null for clinicians until the lab verifies the result. */
  resultData?: ILabResultData | null;
  resultFlags?: ILabResultFlags | null;
  resultNotes?: string | null;
  isAbnormal: boolean;
  resultedById?: string | null;
  resultedBy?: IUser | null;
  resultedAt?: Date | null;
  collectedById?: string | null;
  collectedBy?: IUser | null;
  collectedAt?: Date | null;
  verifiedById?: string | null;
  verifiedBy?: IUser | null;
  verifiedAt?: Date | null;
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
  referringClinician?: string | null;
  cancellationReason?: string | null;
  completedAt?: Date | null;
  items: ILabOrderItem[];
}

export interface ICreateLabOrderItemDto {
  testId: string;
}

export interface ICreateLabOrderDto {
  patientId: string;
  consultationId?: string;
  /** Omit for a walk-in: the API uses the open visit or opens a lab-only one. */
  visitId?: string;
  priority?: LabPriorityEnum;
  clinicalNotes?: string;
  referringClinician?: string;
  items: ICreateLabOrderItemDto[];
}

export interface IUpdateLabOrderDto {
  priority?: LabPriorityEnum;
  clinicalNotes?: string;
}

/** Status moves and result entry; `verified` has its own endpoint. */
export interface IUpdateLabOrderItemDto {
  status?: LabOrderItemStatusEnum;
  resultData?: ILabResultData;
  resultNotes?: string;
}

/** Body for POST /consultations/:id/lab-orders; patient, consultation and visit come from the URL. */
export type IConsultationLabOrderDto = Omit<
  ICreateLabOrderDto,
  'patientId' | 'consultationId' | 'visitId' | 'referringClinician'
>;
