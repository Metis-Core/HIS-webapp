import type { IBaseEntity } from './base.interface';
import { GenderEnum } from '@/enum';
import {
  PatientBloodTypeEnum,
  PatientMaritalStatusEnum,
  PatientStatusEnum,
  PatientTypeEnum,
} from '@/enum/patient.enum';
import type { IContact, ICreateContactDto } from './contact.interface';

export interface IPatient extends IBaseEntity {
  mrn?: string;
  firstName: string;
  lastName: string;
  middleName?: string | null;
  dateOfBirth?: string;
  phone?: string | null;
  email?: string | null;
  gender: GenderEnum;
  type: PatientTypeEnum;
  status?: PatientStatusEnum;
  address?: string | null;
  city?: string | null;
  nationalId?: string | null;
  bloodType?: PatientBloodTypeEnum;
  maritalStatus?: PatientMaritalStatusEnum;
  insuranceProvider?: string | null;
  insurancePolicyNumber?: string | null;
  allergies?: string | null;
  notes?: string | null;
  userId?: string | null;
  contact?: IContact | null;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelationship?: string;
}

export interface ICreatePatientDto {
  firstName: string;
  middleName?: string;
  lastName: string;
  dateOfBirth: string;
  gender?: GenderEnum;
  bloodType?: PatientBloodTypeEnum;
  maritalStatus?: PatientMaritalStatusEnum;
  status?: PatientStatusEnum;
  type?: PatientTypeEnum;
  phone?: string;
  email?: string;
  nationalId?: string;
  address?: string;
  city?: string;
  insuranceProvider?: string;
  insurancePolicyNumber?: string;
  allergies?: string;
  emergencyContact?: ICreateContactDto;
}

export interface IUpdatePatientDto extends Partial<ICreatePatientDto> {
  mrn?: string;
}

export interface IPatientFilters {
  page?: number;
  limit?: number;
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
