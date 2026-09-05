import type { IBaseEntity } from './base.interface';
import type { PrescriptionItemStatusEnum, PrescriptionStatusEnum } from '@/enum';
import type { IInventoryItem, IInventoryStore } from './inventory.interface';
import type { IPatient } from './patient.interface';
import type { IUser } from './user.interface';

export interface IPrescriptionItem extends IBaseEntity {
  prescriptionId: string;
  itemId: string;
  item?: IInventoryItem;
  dosage: string;
  frequency: string;
  duration?: string | null;
  quantity: number;
  dispensedQuantity: number;
  status: PrescriptionItemStatusEnum;
  instructions?: string | null;
}

export interface IPrescription extends IBaseEntity {
  patientId: string;
  patient?: IPatient;
  consultationId?: string | null;
  prescribedById: string;
  prescribedBy?: IUser;
  status: PrescriptionStatusEnum;
  notes?: string | null;
  items: IPrescriptionItem[];
}

export interface ICreatePrescriptionItemDto {
  itemId: string;
  dosage: string;
  frequency: string;
  duration?: string;
  quantity: number;
  instructions?: string;
}

export interface ICreatePrescriptionDto {
  patientId: string;
  consultationId?: string;
  visitId?: string;
  notes?: string;
  items: ICreatePrescriptionItemDto[];
}

export interface IPrescriptionFilters {
  page?: number;
  limit?: number;
  patientId?: string;
  consultationId?: string;
  prescribedById?: string;
  status?: PrescriptionStatusEnum;
}

export interface IDispenseItemDto {
  prescriptionItemId: string;
  quantity: number;
}

export interface IDispensePrescriptionDto {
  storeId: string;
  notes?: string;
  items: IDispenseItemDto[];
}

export interface IDispenseItem extends IBaseEntity {
  dispenseId: string;
  prescriptionItemId: string;
  quantity: number;
}

export interface IDispense extends IBaseEntity {
  prescriptionId: string;
  dispensedById: string;
  dispensedBy?: IUser;
  storeId: string;
  store?: IInventoryStore;
  notes?: string | null;
  items: IDispenseItem[];
}
