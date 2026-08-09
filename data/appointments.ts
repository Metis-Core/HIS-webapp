import { addDays, setHours, setMinutes, startOfDay } from 'date-fns';
import { PillVariantEnum } from '@/enum';
import { AppointmentStatusEnum, AppointmentTypeEnum } from '@/enum/appointment.enum';

export interface IAppointment {
  id: string;
  patientName: string;
  phone: string;
  doctor: string;
  department: string;
  type: AppointmentTypeEnum;
  status: AppointmentStatusEnum;
  date: Date;
  duration: number;
  reason: string;
}

function at(daysFromNow: number, hour: number, minute = 0) {
  return setMinutes(setHours(addDays(startOfDay(new Date()), daysFromNow), hour), minute);
}

export const appointments: IAppointment[] = [
  {
    id: 'a1',
    patientName: 'Amina Nalwanga',
    phone: '+256 700 111 222',
    doctor: 'Dr. Kiwanuka',
    department: 'General Medicine',
    type: AppointmentTypeEnum.CONSULTATION,
    status: AppointmentStatusEnum.CONFIRMED,
    date: at(0, 9, 0),
    duration: 30,
    reason: 'Routine check-up and prescription refill',
  },
  {
    id: 'a2',
    patientName: 'James Okello',
    phone: '+256 700 333 444',
    doctor: 'Dr. Namutebi',
    department: 'Internal Medicine',
    type: AppointmentTypeEnum.FOLLOW_UP,
    status: AppointmentStatusEnum.SCHEDULED,
    date: at(0, 10, 30),
    duration: 20,
    reason: 'Follow-up on cough and fever workup',
  },
  {
    id: 'a3',
    patientName: 'Sarah Mbabazi',
    phone: '+256 700 555 666',
    doctor: 'Dr. Byaruhanga',
    department: 'Surgical Theatre 2',
    type: AppointmentTypeEnum.SURGERY,
    status: AppointmentStatusEnum.CONFIRMED,
    date: at(0, 13, 0),
    duration: 90,
    reason: 'Pre-surgical evaluation for scheduled appendectomy',
  },
  {
    id: 'a4',
    patientName: 'Peter Kato',
    phone: '+256 700 777 888',
    doctor: 'Lab Tech. Achen',
    department: 'Laboratory',
    type: AppointmentTypeEnum.LAB_TEST,
    status: AppointmentStatusEnum.COMPLETED,
    date: at(0, 8, 0),
    duration: 15,
    reason: 'Full blood count and malaria RDT',
  },
  {
    id: 'a5',
    patientName: 'Grace Nabirye',
    phone: '+256 700 222 999',
    doctor: 'Dr. Namutebi',
    department: 'Internal Medicine',
    type: AppointmentTypeEnum.CONSULTATION,
    status: AppointmentStatusEnum.CANCELLED,
    date: at(0, 15, 0),
    duration: 30,
    reason: 'Chest pain review',
  },
  {
    id: 'a6',
    patientName: 'Moses Ssekandi',
    phone: '+256 700 444 111',
    doctor: 'Pharm. Nassuna',
    department: 'Pharmacy',
    type: AppointmentTypeEnum.VACCINATION,
    status: AppointmentStatusEnum.NO_SHOW,
    date: at(0, 11, 0),
    duration: 15,
    reason: 'Typhoid booster vaccination',
  },
  {
    id: 'a7',
    patientName: 'Ruth Achieng',
    phone: '+256 700 888 222',
    doctor: 'Dr. Byaruhanga',
    department: 'Surgical Theatre 2',
    type: AppointmentTypeEnum.FOLLOW_UP,
    status: AppointmentStatusEnum.SCHEDULED,
    date: at(1, 9, 30),
    duration: 20,
    reason: 'Post-appendectomy wound check',
  },
  {
    id: 'a8',
    patientName: 'Esther Namara',
    phone: '+256 700 666 333',
    doctor: 'Dr. Kiwanuka',
    department: 'General Medicine',
    type: AppointmentTypeEnum.CONSULTATION,
    status: AppointmentStatusEnum.CONFIRMED,
    date: at(1, 14, 0),
    duration: 30,
    reason: 'Discharge clearance review',
  },
  {
    id: 'a9',
    patientName: 'Ivan Mugisha',
    phone: '+256 700 999 000',
    doctor: 'Dr. Namutebi',
    department: 'Internal Medicine',
    type: AppointmentTypeEnum.CONSULTATION,
    status: AppointmentStatusEnum.SCHEDULED,
    date: at(2, 10, 0),
    duration: 30,
    reason: 'New patient consultation for recurring headaches',
  },
  {
    id: 'a10',
    patientName: 'Grace Namuli',
    phone: '+256 700 121 212',
    doctor: 'Lab Tech. Achen',
    department: 'Laboratory',
    type: AppointmentTypeEnum.LAB_TEST,
    status: AppointmentStatusEnum.SCHEDULED,
    date: at(2, 8, 30),
    duration: 15,
    reason: 'Renal function panel',
  },
];

export const statusVariants: Record<AppointmentStatusEnum, PillVariantEnum> = {
  [AppointmentStatusEnum.SCHEDULED]: PillVariantEnum.INFO,
  [AppointmentStatusEnum.CONFIRMED]: PillVariantEnum.SUCCESS,
  [AppointmentStatusEnum.COMPLETED]: PillVariantEnum.DEFAULT,
  [AppointmentStatusEnum.CANCELLED]: PillVariantEnum.DANGER,
  [AppointmentStatusEnum.NO_SHOW]: PillVariantEnum.WARNING,
};

export function typeLabel(value: string) {
  return value
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
