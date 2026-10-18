import type { IBaseEntity } from './base.interface';
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
}
