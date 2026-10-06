import type { IPatient } from '@/interfaces/patient.interface';

export function patientFullName(patient: IPatient) {
  return [patient.firstName, patient.middleName, patient.lastName].filter(Boolean).join(' ');
}

export function patientInitials(patient: IPatient) {
  return `${patient.firstName[0] ?? ''}${patient.lastName[0] ?? ''}`.toUpperCase();
}
