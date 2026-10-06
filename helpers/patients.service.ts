import { CrudService } from './crud.service';
import { PatientEndpointEnum } from '@/enum';
import type { ICreatePatientDto, IPatient, IPatientFilters, IUpdatePatientDto, PatientFormValues } from '@/interfaces';
import type { GenderEnum } from '@/enum';
import type { PatientBloodTypeEnum, PatientMaritalStatusEnum, PatientTypeEnum } from '@/enum/patient.enum';

class PatientsService extends CrudService<IPatient, ICreatePatientDto, IUpdatePatientDto, IPatientFilters> {
  constructor() {
    super(PatientEndpointEnum.BASE);
  }
}

const optional = (v?: string) => (v && v.trim() ? v.trim() : undefined);

export function toPatientPayload(values: PatientFormValues): ICreatePatientDto {
  return {
    firstName: values.firstName.trim(),
    lastName: values.lastName.trim(),
    middleName: optional(values.middleName),
    dateOfBirth: values.dateOfBirth,
    gender: values.gender as GenderEnum,
    type: values.type as PatientTypeEnum,
    phone: optional(values.phone),
    email: optional(values.email),
    address: optional(values.address),
    city: optional(values.city),
    nationalId: optional(values.nationalId),
    insuranceProvider: optional(values.insuranceProvider),
    insurancePolicyNumber: optional(values.insurancePolicyNumber),
    maritalStatus: (values.maritalStatus as PatientMaritalStatusEnum) || undefined,
    bloodType: (values.bloodType as PatientBloodTypeEnum) || undefined,
    emergencyContact: {
      name: values.emergencyContactName.trim(),
      phone: values.emergencyContactPhone.trim(),
      relationship: values.emergencyContactRelationship.trim(),
    },
  };
}

const patientsService = new PatientsService();
export default patientsService;
