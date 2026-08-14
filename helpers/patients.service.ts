import { GenderEnum, PatientEndpointEnum } from '@/enum';
import { PatientBloodTypeEnum, PatientMaritalStatusEnum, PatientTypeEnum } from '@/enum/patient.enum';
import type {
  ICreatePatientDto,
  IPaginatedList,
  IPatient,
  IPatientFilters,
  IUpdatePatientDto,
  PatientFormValues,
} from '@/interfaces';
import api from './axios';

const normalize = (patient: IPatient): IPatient => ({
  ...patient,
  emergencyContactName: patient.contact?.name ?? patient.emergencyContactName,
  emergencyContactPhone: patient.contact?.phone ?? patient.emergencyContactPhone,
  emergencyContactRelationship: patient.contact?.relationship ?? patient.emergencyContactRelationship,
});

export const toPatientDto = (values: PatientFormValues): ICreatePatientDto => ({
  firstName: values.firstName.trim(),
  lastName: values.lastName.trim(),
  middleName: values.middleName.trim() || undefined,
  dateOfBirth: values.dateOfBirth,
  gender: (values.gender as GenderEnum) || undefined,
  type: (values.type as PatientTypeEnum) || undefined,
  maritalStatus: (values.maritalStatus as PatientMaritalStatusEnum) || undefined,
  bloodType: (values.bloodType as PatientBloodTypeEnum) || undefined,
  phone: values.phone || undefined,
  email: values.email.trim() || undefined,
  nationalId: values.nationalId.trim() || undefined,
  address: values.address.trim() || undefined,
  city: values.city.trim() || undefined,
  insuranceProvider: values.insuranceProvider.trim() || undefined,
  insurancePolicyNumber: values.insurancePolicyNumber.trim() || undefined,
  allergies: values.allergies.trim() || undefined,
  emergencyContact: values.emergencyContactName.trim()
    ? {
        name: values.emergencyContactName.trim(),
        phone: values.emergencyContactPhone.trim(),
        relationship: values.emergencyContactRelationship.trim() || undefined,
      }
    : undefined,
});

class PatientsService {
  async list(filters: IPatientFilters = {}): Promise<IPaginatedList<IPatient>> {
    const { data } = await api.get<IPaginatedList<IPatient>>(PatientEndpointEnum.BASE, { params: filters });
    return { total: data.total, items: data.items.map(normalize) };
  }

  async get(id: string): Promise<IPatient> {
    const { data } = await api.get<IPatient>(`${PatientEndpointEnum.BASE}/${id}`);
    return normalize(data);
  }

  async create(dto: ICreatePatientDto): Promise<IPatient> {
    const { data } = await api.post<IPatient>(PatientEndpointEnum.BASE, dto);
    return normalize(data);
  }

  async update(id: string, dto: IUpdatePatientDto): Promise<IPatient> {
    const { data } = await api.patch<IPatient>(`${PatientEndpointEnum.BASE}/${id}`, dto);
    return normalize(data);
  }

  async remove(id: string): Promise<void> {
    await api.delete(`${PatientEndpointEnum.BASE}/${id}`);
  }
}

export const patientsService = new PatientsService();
export default patientsService;
