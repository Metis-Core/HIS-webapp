import type { ClinicRecordKindEnum } from '@/enum/clinic.enum';
import type { IBaseEntity, IPageQuery } from './base.interface';
import type { ILabResultData, ILabResultFlags, ILabResultSchema } from './lab-result.interface';
import type { IUser } from './user.interface';

export interface IVaccine {
  name: string;
  schedule: string;
  doses: string[];
  route: string;
  site: string;
  /** Set for private vaccines, which are billed from Services. */
  serviceCode?: string;
}

export interface IClinicTemplates {
  templates: Record<ClinicRecordKindEnum, ILabResultSchema>;
  vaccines: IVaccine[];
  national: string[];
}

export interface IClinicRecord extends IBaseEntity {
  patientId: string;
  visitId: string | null;
  kind: ClinicRecordKindEnum;
  data: ILabResultData;
  flags: ILabResultFlags | null;
  recordedBy?: Pick<IUser, 'id' | 'username'>;
}

export interface ICreateClinicRecordDto {
  patientId: string;
  visitId?: string;
  kind: ClinicRecordKindEnum;
  data: ILabResultData;
}

export interface IClinicRecordFilters extends IPageQuery {
  patientId?: string;
  visitId?: string;
  kind?: ClinicRecordKindEnum;
}
