import { GenderEnum } from './index';

export const PatientGenderEnum = GenderEnum;

export enum PatientTypeEnum {
  INPATIENT = 'inpatient',
  OUTPATIENT = 'outpatient',
}

export enum PatientStatusEnum {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  DECEASED = 'deceased',
  MERGED = 'merged',
}

export enum PatientMaritalStatusEnum {
  SINGLE = 'single',
  MARRIED = 'married',
  DIVORCED = 'divorced',
  WIDOWED = 'widowed',
  SEPERATED = 'seperated',
  UNKNOWN = 'unknown',
}

export enum PatientBloodTypeEnum {
  APOSITIVE = 'a+',
  ANEGATIVE = 'a-',
  BPOSITIVE = 'b+',
  BNEGATIVE = 'b-',
  ABPOSITIVE = 'ab+',
  ABNEGATIVE = 'ab-',
  OPOSITIVE = 'o+',
  ONEGATIVE = 'o-',
  UNKNOWN = 'unknown',
}
