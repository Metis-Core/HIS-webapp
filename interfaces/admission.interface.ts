import type { IBaseEntity, IPageQuery } from './base.interface';
import type { IUser } from './user.interface';

export interface IAdmitPatientDto {
  ward: string;
  reason: string;
}

export interface IAdmission extends IBaseEntity {
  patientId: string;
  visitId: string | null;
  consultationId: string | null;
  ward: string;
  reason: string;
  admittedAt: string;
  admittedById: string;
  admittedBy?: IUser;
  dischargedAt: string | null;
  dischargedBy?: IUser | null;
  dischargeNotes: string | null;
}

export interface IAdmissionFilters extends IPageQuery {
  patientId?: string;
  visitId?: string;
  discharged?: boolean;
}
