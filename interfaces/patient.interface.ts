import { IBaseEntity, IListQuery } from '.';
import { GenderEnum } from '@/enum';
import {
  PatientBloodTypeEnum,
  PatientMaritalStatusEnum,
  PatientStatusEnum,
  PatientTypeEnum,
} from '@/enum/patient.enum';

export interface IContact {
  name: string;
  phone: string;
  relationship?: string;
}

export interface IPatient extends IBaseEntity {
  mrn?: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  dateOfBirth?: Date;
  phone?: string;
  email?: string;
  gender: GenderEnum;
  type: PatientTypeEnum;
  status?: PatientStatusEnum;
  address?: string;
  city?: string;
  nationalId?: string;
  bloodType?: PatientBloodTypeEnum;
  maritalStatus?: PatientMaritalStatusEnum;
  allergies?: string;
  notes?: string;
  contact?: IContact | null;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelationship?: string;
  insuranceProvider?: string;
  insurancePolicyNumber?: string;
}

export interface ICreatePatientDto {
  firstName: string;
  lastName: string;
  middleName?: string;
  dateOfBirth: string;
  gender?: GenderEnum;
  type?: PatientTypeEnum;
  status?: PatientStatusEnum;
  bloodType?: PatientBloodTypeEnum;
  maritalStatus?: PatientMaritalStatusEnum;
  phone?: string;
  email?: string;
  nationalId?: string;
  address?: string;
  city?: string;
  insuranceProvider?: string;
  insurancePolicyNumber?: string;
  allergies?: string;
  emergencyContact?: IContact;
}

export type IUpdatePatientDto = Partial<ICreatePatientDto>;

export interface IPatientFilters extends IListQuery {
  search?: string;
  status?: PatientStatusEnum;
  type?: PatientTypeEnum;
  gender?: GenderEnum;
  bloodType?: PatientBloodTypeEnum;
  maritalStatus?: PatientMaritalStatusEnum;
  city?: string;
  dateOfBirthFrom?: string;
  dateOfBirthTo?: string;
}
