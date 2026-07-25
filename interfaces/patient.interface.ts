import { IBaseEntity } from '.';
import { GenderEnum } from '@/enum';
import { PatientBloodTypeEnum, PatientMaritalStatusEnum, PatientTypeEnum } from '@/enum/patient.enum';

export interface IPatient extends IBaseEntity {
  firstName: string;
  lastName: string;
  middleName?: string;
  dateOfBirth?: Date;
  phone?: string;
  email?: string;
  gender: GenderEnum;
  type: PatientTypeEnum;
  address?: string;
  city?: string;
  nationalId?: string;
  bloodType?: PatientBloodTypeEnum;
  maritalStatus?: PatientMaritalStatusEnum;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelationship?: string;
  insuranceProvider?: string;
  insurancePolicyNumber?: string;
}
