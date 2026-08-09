import { PillVariantEnum } from '@/enum';
import { GenderEnum } from '@/enum';
import { QueueStageEnum, QueueStatusEnum } from '@/enum/queue.enum';

export type QueuePriority = 'routine' | 'urgent' | 'emergency';

export interface IQueueNote {
  id: string;
  author: string;
  role: string;
  message: string;
  at: Date;
}

export interface IQueueEntry {
  id: string;
  patientName: string;
  phone: string;
  email?: string;
  dateOfBirth: Date;
  gender: GenderEnum;
  nationalId?: string;
  address: string;
  city: string;
  bloodType?: string;
  insuranceProvider?: string;
  stage: QueueStageEnum;
  status: QueueStatusEnum;
  priority: QueuePriority;
  assignedTo: string;
  department: string;
  checkedInAt: Date;
  notes: IQueueNote[];
}

export const queueEntries: IQueueEntry[] = [
  {
    id: 'q1',
    patientName: 'Amina Nalwanga',
    phone: '+256 700 111 222',
    email: 'amina@example.com',
    dateOfBirth: new Date('1992-04-12'),
    gender: GenderEnum.FEMALE,
    nationalId: 'CM920412ABC',
    address: 'Plot 14 Nakasero Road',
    city: 'Kampala',
    bloodType: 'O+',
    insuranceProvider: 'UAP Old Mutual Insurance',
    stage: QueueStageEnum.REGISTRATION,
    status: QueueStatusEnum.PENDING,
    priority: 'routine',
    assignedTo: 'Front Desk 1',
    department: 'Reception',
    checkedInAt: new Date(Date.now() - 6 * 60 * 1000),
    notes: [
      {
        id: 'q1-n1',
        author: 'Grace Namuli',
        role: 'Front Desk 1 · Reception',
        message: 'Checked in for a routine outpatient visit. Insurance card verified.',
        at: new Date(Date.now() - 5 * 60 * 1000),
      },
    ],
  },
  {
    id: 'q2',
    patientName: 'James Okello',
    phone: '+256 700 333 444',
    dateOfBirth: new Date('1988-09-03'),
    gender: GenderEnum.MALE,
    address: 'Block 7 Industrial Area',
    city: 'Jinja',
    stage: QueueStageEnum.CONSULTATION,
    status: QueueStatusEnum.IN_PROGRESS,
    priority: 'routine',
    assignedTo: 'Dr. Kiwanuka',
    department: 'General Medicine',
    checkedInAt: new Date(Date.now() - 22 * 60 * 1000),
    notes: [
      {
        id: 'q2-n1',
        author: 'Ivan Ssempijja',
        role: 'Front Desk 2 · Reception',
        message: 'Registered and directed to General Medicine for consultation.',
        at: new Date(Date.now() - 21 * 60 * 1000),
      },
      {
        id: 'q2-n2',
        author: 'Dr. Kiwanuka',
        role: 'General Medicine',
        message:
          'Complains of persistent cough and mild fever for 3 days. BP 122/80, temp 37.9°C. Ordering a lab workup before prescribing.',
        at: new Date(Date.now() - 6 * 60 * 1000),
      },
    ],
  },
  {
    id: 'q3',
    patientName: 'Sarah Mbabazi',
    phone: '+256 700 555 666',
    email: 'sarah@example.com',
    dateOfBirth: new Date('1995-01-20'),
    gender: GenderEnum.FEMALE,
    address: 'Mbarara High Street',
    city: 'Mbarara',
    bloodType: 'A+',
    insuranceProvider: 'Jubilee Health Insurance',
    stage: QueueStageEnum.EXAMINATION,
    status: QueueStatusEnum.IN_PROGRESS,
    priority: 'urgent',
    assignedTo: 'Dr. Namutebi',
    department: 'Internal Medicine',
    checkedInAt: new Date(Date.now() - 35 * 60 * 1000),
    notes: [
      {
        id: 'q3-n1',
        author: 'Dr. Namutebi',
        role: 'Internal Medicine',
        message: 'Reviewed vitals: BP 145/95, elevated for baseline. Proceeding with a detailed physical examination.',
        at: new Date(Date.now() - 20 * 60 * 1000),
      },
      {
        id: 'q3-n2',
        author: 'Dr. Namutebi',
        role: 'Internal Medicine',
        message:
          'Suspecting early hypertension. Requesting renal function panel and ECG before confirming treatment plan.',
        at: new Date(Date.now() - 8 * 60 * 1000),
      },
    ],
  },
  {
    id: 'q4',
    patientName: 'Peter Kato',
    phone: '+256 700 777 888',
    dateOfBirth: new Date('1979-11-08'),
    gender: GenderEnum.MALE,
    address: 'Entebbe Road, Zone B',
    city: 'Entebbe',
    insuranceProvider: 'AAR Health Services',
    stage: QueueStageEnum.LAB,
    status: QueueStatusEnum.PENDING,
    priority: 'routine',
    assignedTo: 'Lab Tech. Achen',
    department: 'Laboratory',
    checkedInAt: new Date(Date.now() - 48 * 60 * 1000),
    notes: [
      {
        id: 'q4-n1',
        author: 'Dr. Byaruhanga',
        role: 'General Medicine',
        message: 'Requesting full blood count and malaria RDT following consultation for recurring fatigue.',
        at: new Date(Date.now() - 40 * 60 * 1000),
      },
      {
        id: 'q4-n2',
        author: 'Lab Tech. Achen',
        role: 'Laboratory',
        message: 'Sample collected, awaiting analyser slot. Results expected within the hour.',
        at: new Date(Date.now() - 10 * 60 * 1000),
      },
    ],
  },
  {
    id: 'q5',
    patientName: 'Grace Nabirye',
    phone: '+256 700 222 999',
    dateOfBirth: new Date('1990-06-18'),
    gender: GenderEnum.FEMALE,
    address: 'Ntinda Trading Centre',
    city: 'Kampala',
    stage: QueueStageEnum.RADIOLOGY,
    status: QueueStatusEnum.PENDING,
    priority: 'urgent',
    assignedTo: 'Radiographer Okot',
    department: 'Radiology',
    checkedInAt: new Date(Date.now() - 15 * 60 * 1000),
    notes: [
      {
        id: 'q5-n1',
        author: 'Dr. Namutebi',
        role: 'Internal Medicine',
        message: 'Chest pain reported. Requesting chest X-ray to rule out any pulmonary involvement.',
        at: new Date(Date.now() - 12 * 60 * 1000),
      },
    ],
  },
  {
    id: 'q6',
    patientName: 'Moses Ssekandi',
    phone: '+256 700 444 111',
    dateOfBirth: new Date('1985-02-27'),
    gender: GenderEnum.MALE,
    address: 'Kireka Cell',
    city: 'Kampala',
    stage: QueueStageEnum.PHARMACY,
    status: QueueStatusEnum.COMPLETED,
    priority: 'routine',
    assignedTo: 'Pharm. Nassuna',
    department: 'Pharmacy',
    checkedInAt: new Date(Date.now() - 70 * 60 * 1000),
    notes: [
      {
        id: 'q6-n1',
        author: 'Dr. Kiwanuka',
        role: 'General Medicine',
        message: 'Diagnosed with typhoid fever. Prescribed a 7-day course of antibiotics and antipyretics.',
        at: new Date(Date.now() - 55 * 60 * 1000),
      },
      {
        id: 'q6-n2',
        author: 'Pharm. Nassuna',
        role: 'Pharmacy',
        message: 'Medication dispensed. Patient counselled on dosage and completing the full course.',
        at: new Date(Date.now() - 20 * 60 * 1000),
      },
    ],
  },
  {
    id: 'q7',
    patientName: 'Ruth Achieng',
    phone: '+256 700 888 222',
    dateOfBirth: new Date('1975-12-01'),
    gender: GenderEnum.FEMALE,
    address: 'Naguru Hill',
    city: 'Kampala',
    bloodType: 'B+',
    insuranceProvider: 'Britam Insurance Uganda',
    stage: QueueStageEnum.SURGERY,
    status: QueueStatusEnum.IN_PROGRESS,
    priority: 'emergency',
    assignedTo: 'Dr. Byaruhanga',
    department: 'Surgical Theatre 2',
    checkedInAt: new Date(Date.now() - 110 * 60 * 1000),
    notes: [
      {
        id: 'q7-n1',
        author: 'Dr. Byaruhanga',
        role: 'Surgical Theatre 2',
        message: 'Acute appendicitis confirmed on ultrasound. Consented for emergency appendectomy.',
        at: new Date(Date.now() - 95 * 60 * 1000),
      },
      {
        id: 'q7-n2',
        author: 'Dr. Byaruhanga',
        role: 'Surgical Theatre 2',
        message: 'Procedure underway under general anaesthesia. Vitals stable.',
        at: new Date(Date.now() - 30 * 60 * 1000),
      },
    ],
  },
  {
    id: 'q8',
    patientName: 'David Mugisha',
    phone: '+256 700 999 333',
    dateOfBirth: new Date('1982-07-14'),
    gender: GenderEnum.MALE,
    address: 'Bugolobi Flats',
    city: 'Kampala',
    stage: QueueStageEnum.POSTOPERATIVE,
    status: QueueStatusEnum.IN_PROGRESS,
    priority: 'urgent',
    assignedTo: 'Nurse Atim',
    department: 'Recovery Ward',
    checkedInAt: new Date(Date.now() - 130 * 60 * 1000),
    notes: [
      {
        id: 'q8-n1',
        author: 'Dr. Byaruhanga',
        role: 'Surgical Theatre 1',
        message: 'Hernia repair completed without complications. Moved to recovery for monitoring.',
        at: new Date(Date.now() - 90 * 60 * 1000),
      },
      {
        id: 'q8-n2',
        author: 'Nurse Atim',
        role: 'Recovery Ward',
        message: 'Vitals stable, mild pain reported. Administered prescribed analgesics.',
        at: new Date(Date.now() - 25 * 60 * 1000),
      },
    ],
  },
  {
    id: 'q9',
    patientName: 'Esther Namara',
    phone: '+256 700 121 232',
    dateOfBirth: new Date('1998-03-05'),
    gender: GenderEnum.FEMALE,
    address: 'Kansanga',
    city: 'Kampala',
    stage: QueueStageEnum.DISCHARGE,
    status: QueueStatusEnum.COMPLETED,
    priority: 'routine',
    assignedTo: 'Front Desk 2',
    department: 'Reception',
    checkedInAt: new Date(Date.now() - 200 * 60 * 1000),
    notes: [
      {
        id: 'q9-n1',
        author: 'Dr. Namutebi',
        role: 'Internal Medicine',
        message: 'Recovered well after treatment. Cleared for discharge with a follow-up in 2 weeks.',
        at: new Date(Date.now() - 40 * 60 * 1000),
      },
      {
        id: 'q9-n2',
        author: 'Grace Namuli',
        role: 'Front Desk 2 · Reception',
        message: 'Discharge summary and invoice issued. Follow-up appointment booked.',
        at: new Date(Date.now() - 15 * 60 * 1000),
      },
    ],
  },
  {
    id: 'q10',
    patientName: 'Brian Tumusiime',
    phone: '+256 700 343 545',
    dateOfBirth: new Date('2001-10-22'),
    gender: GenderEnum.MALE,
    address: 'Kyambogo',
    city: 'Kampala',
    stage: QueueStageEnum.FOLLOWUP,
    status: QueueStatusEnum.PENDING,
    priority: 'routine',
    assignedTo: 'Dr. Kiwanuka',
    department: 'General Medicine',
    checkedInAt: new Date(Date.now() - 4 * 60 * 1000),
    notes: [
      {
        id: 'q10-n1',
        author: 'Dr. Kiwanuka',
        role: 'General Medicine',
        message: 'Booked for a 2-week follow-up to reassess medication response.',
        at: new Date(Date.now() - 3 * 60 * 1000),
      },
    ],
  },
  {
    id: 'q11',
    patientName: 'Patricia Auma',
    phone: '+256 700 656 767',
    dateOfBirth: new Date('1968-05-30'),
    gender: GenderEnum.FEMALE,
    address: 'Mulago Hill Road',
    city: 'Kampala',
    insuranceProvider: 'Jubilee Health Insurance',
    stage: QueueStageEnum.REFERRAL,
    status: QueueStatusEnum.CANCELLED,
    priority: 'urgent',
    assignedTo: 'Dr. Byaruhanga',
    department: 'Mulago Referral Hospital',
    checkedInAt: new Date(Date.now() - 260 * 60 * 1000),
    notes: [
      {
        id: 'q11-n1',
        author: 'Dr. Byaruhanga',
        role: 'General Medicine',
        message: 'Case requires specialist cardiology review. Referral letter prepared for Mulago Referral Hospital.',
        at: new Date(Date.now() - 250 * 60 * 1000),
      },
      {
        id: 'q11-n2',
        author: 'Reception — Ivan Ssempijja',
        role: 'Reception',
        message: 'Referral cancelled at patient request; opted for a private specialist instead.',
        at: new Date(Date.now() - 200 * 60 * 1000),
      },
    ],
  },
  {
    id: 'q12',
    patientName: 'Ivan Wasswa',
    phone: '+256 700 878 989',
    dateOfBirth: new Date('1990-08-09'),
    gender: GenderEnum.MALE,
    address: 'Ggaba Road',
    city: 'Kampala',
    bloodType: 'AB+',
    stage: QueueStageEnum.TRANSFER,
    status: QueueStatusEnum.PENDING,
    priority: 'emergency',
    assignedTo: 'Nurse Atim',
    department: 'Intensive Care Unit',
    checkedInAt: new Date(Date.now() - 12 * 60 * 1000),
    notes: [
      {
        id: 'q12-n1',
        author: 'Dr. Byaruhanga',
        role: 'Emergency Unit',
        message:
          'Critical condition following road traffic accident. Stabilised and being transferred to ICU for close monitoring.',
        at: new Date(Date.now() - 9 * 60 * 1000),
      },
    ],
  },
];

export const stageLabel = (value: string) => value.replace('-', ' ').replace(/\b\w/g, (c) => c.toUpperCase());

export const statusVariants: Record<QueueStatusEnum, PillVariantEnum> = {
  [QueueStatusEnum.PENDING]: PillVariantEnum.WARNING,
  [QueueStatusEnum.IN_PROGRESS]: PillVariantEnum.INFO,
  [QueueStatusEnum.COMPLETED]: PillVariantEnum.SUCCESS,
  [QueueStatusEnum.CANCELLED]: PillVariantEnum.DANGER,
};

export const priorityVariants: Record<QueuePriority, PillVariantEnum> = {
  routine: PillVariantEnum.DEFAULT,
  urgent: PillVariantEnum.WARNING,
  emergency: PillVariantEnum.DANGER,
};

export function getQueueEntry(id: string) {
  return queueEntries.find((entry) => entry.id === id) ?? null;
}

export function initialsOf(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
}
