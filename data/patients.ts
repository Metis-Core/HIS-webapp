import { subDays } from 'date-fns';
import { GenderEnum } from '@/enum';
import { PatientBloodTypeEnum, PatientMaritalStatusEnum, PatientTypeEnum } from '@/enum/patient.enum';
import type { IPatient } from '@/interfaces/patient.interface';

export const seedPatients: IPatient[] = [
  {
    id: '1',
    firstName: 'Amina',
    lastName: 'Nalwanga',
    dateOfBirth: new Date('1992-04-12'),
    phone: '+256700111222',
    email: 'amina@example.com',
    gender: GenderEnum.FEMALE,
    type: PatientTypeEnum.OUTPATIENT,
    address: 'Plot 14 Nakasero Road',
    city: 'Kampala',
    nationalId: 'CM920412ABC',
    maritalStatus: PatientMaritalStatusEnum.MARRIED,
    bloodType: PatientBloodTypeEnum.OPOSITIVE,
    emergencyContactName: 'John Nalwanga',
    emergencyContactPhone: '+256700111333',
    emergencyContactRelationship: 'Spouse',
    insuranceProvider: 'UAP Old Mutual Insurance',
    insurancePolicyNumber: 'UAP-88291',
    createdAt: subDays(new Date(), 2),
    updatedAt: subDays(new Date(), 2),
  },
  {
    id: '2',
    firstName: 'James',
    lastName: 'Okello',
    dateOfBirth: new Date('1988-09-03'),
    phone: '+256700333444',
    gender: GenderEnum.MALE,
    type: PatientTypeEnum.INPATIENT,
    address: 'Block 7 Industrial Area',
    city: 'Jinja',
    maritalStatus: PatientMaritalStatusEnum.SINGLE,
    emergencyContactName: 'Mary Okello',
    emergencyContactPhone: '+256700333555',
    emergencyContactRelationship: 'Sister',
    createdAt: subDays(new Date(), 10),
    updatedAt: subDays(new Date(), 10),
  },
  {
    id: '3',
    firstName: 'Sarah',
    lastName: 'Mbabazi',
    dateOfBirth: new Date('1995-01-20'),
    phone: '+256700555666',
    email: 'sarah@example.com',
    gender: GenderEnum.FEMALE,
    type: PatientTypeEnum.INPATIENT,
    address: 'Mbarara High Street',
    city: 'Mbarara',
    bloodType: PatientBloodTypeEnum.APOSITIVE,
    emergencyContactName: 'Paul Mbabazi',
    emergencyContactPhone: '+256700555777',
    emergencyContactRelationship: 'Brother',
    insuranceProvider: 'Jubilee Health Insurance',
    insurancePolicyNumber: 'JH-44102',
    createdAt: subDays(new Date(), 1),
    updatedAt: subDays(new Date(), 1),
  },
  {
    id: '4',
    firstName: 'Peter',
    lastName: 'Kato',
    dateOfBirth: new Date('1979-11-08'),
    phone: '+256700777888',
    gender: GenderEnum.MALE,
    type: PatientTypeEnum.OUTPATIENT,
    address: 'Entebbe Road, Zone B',
    city: 'Entebbe',
    maritalStatus: PatientMaritalStatusEnum.DIVORCED,
    emergencyContactName: 'Grace Kato',
    emergencyContactPhone: '+256700777999',
    emergencyContactRelationship: 'Daughter',
    insuranceProvider: 'AAR Health Services',
    insurancePolicyNumber: 'AAR-11903',
    createdAt: subDays(new Date(), 30),
    updatedAt: subDays(new Date(), 30),
  },
];

export function patientFullName(patient: IPatient) {
  return [patient.firstName, patient.middleName, patient.lastName].filter(Boolean).join(' ');
}

export function patientInitials(patient: IPatient) {
  return `${patient.firstName[0] ?? ''}${patient.lastName[0] ?? ''}`.toUpperCase();
}
