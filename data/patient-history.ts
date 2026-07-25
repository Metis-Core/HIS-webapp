import { subDays, subHours } from 'date-fns';

export type PatientVisitType =
  'registration' | 'consultation' | 'treatment' | 'admission' | 'lab' | 'follow-up' | 'insurance' | 'update';

export interface IPatientHistoryEvent {
  id: string;
  patientId: string;
  date: Date;
  title: string;
  description: string;
  type: PatientVisitType;
  handledBy: string;
  department: string;
  notes?: string;
  outcome?: string;
}

export const patientHistory: IPatientHistoryEvent[] = [
  {
    id: 'h-1-1',
    patientId: '1',
    date: subDays(new Date(), 2),
    type: 'registration',
    title: 'Patient registered',
    description: 'Registered at reception as an outpatient with UAP Old Mutual Insurance.',
    handledBy: 'Reception — Grace Namuli',
    department: 'Reception',
    notes: 'Insurance card copied. Patient briefed on outpatient flow.',
    outcome: 'Active outpatient record created',
  },
  {
    id: 'h-1-2',
    patientId: '1',
    date: subDays(new Date(), 1),
    type: 'consultation',
    title: 'General consultation',
    description: 'Presented with mild fever and headache. Vitals recorded and reviewed.',
    handledBy: 'Dr. Samuel Okoth',
    department: 'Outpatient clinic',
    notes: 'BP 118/76, temp 37.8°C. Malaria RDT ordered.',
    outcome: 'Prescribed antipyretics. Follow-up in 3 days.',
  },
  {
    id: 'h-2-1',
    patientId: '2',
    date: subDays(new Date(), 10),
    type: 'registration',
    title: 'Patient registered',
    description: 'Registered at reception as an inpatient. Emergency contact recorded.',
    handledBy: 'Reception — Ivan Ssempijja',
    department: 'Reception',
    outcome: 'Inpatient file opened',
  },
  {
    id: 'h-2-2',
    patientId: '2',
    date: subDays(new Date(), 9),
    type: 'admission',
    title: 'Ward admission',
    description: 'Admitted to male medical ward for observation and IV treatment.',
    handledBy: 'Dr. Patricia Ayo',
    department: 'Inpatient ward',
    notes: 'Bed assigned: Ward B, Bed 12.',
    outcome: 'Admission completed',
  },
  {
    id: 'h-2-3',
    patientId: '2',
    date: subDays(new Date(), 7),
    type: 'lab',
    title: 'Lab results reviewed',
    description: 'Complete blood count and malaria RDT results reviewed by clinician.',
    handledBy: 'Dr. Patricia Ayo',
    department: 'Laboratory',
    notes: 'CBC within normal limits. Malaria RDT negative.',
    outcome: 'Treatment plan adjusted',
  },
  {
    id: 'h-3-1',
    patientId: '3',
    date: subDays(new Date(), 1),
    type: 'registration',
    title: 'Patient registered',
    description: 'Registered as inpatient with Jubilee Health Insurance coverage.',
    handledBy: 'Reception — Grace Namuli',
    department: 'Reception',
    outcome: 'Inpatient registration complete',
  },
  {
    id: 'h-3-2',
    patientId: '3',
    date: subHours(new Date(), 6),
    type: 'insurance',
    title: 'Insurance verified',
    description: 'Policy JH-44102 confirmed active with Jubilee Health Insurance.',
    handledBy: 'Billing — Ruth Nakato',
    department: 'Billing & insurance',
    notes: 'Pre-authorisation reference JH-PA-2201 issued.',
    outcome: 'Coverage approved for current admission',
  },
  {
    id: 'h-4-1',
    patientId: '4',
    date: subDays(new Date(), 30),
    type: 'registration',
    title: 'Patient registered',
    description: 'Registered at reception as outpatient in Entebbe.',
    handledBy: 'Reception — Ivan Ssempijja',
    department: 'Reception',
    outcome: 'Outpatient record created',
  },
  {
    id: 'h-4-2',
    patientId: '4',
    date: subDays(new Date(), 14),
    type: 'follow-up',
    title: 'Follow-up visit',
    description: 'Routine follow-up visit for hypertension management.',
    handledBy: 'Dr. Samuel Okoth',
    department: 'Outpatient clinic',
    notes: 'BP 128/82. Patient reports good adherence to medication.',
    outcome: 'Medication refill issued for 30 days',
  },
  {
    id: 'h-4-3',
    patientId: '4',
    date: subDays(new Date(), 3),
    type: 'treatment',
    title: 'Treatment session',
    description: 'Wound dressing changed and progress assessed.',
    handledBy: 'Nurse — Agnes Tumusiime',
    department: 'Treatment room',
    notes: 'Wound healing well. No signs of infection.',
    outcome: 'Next dressing in 5 days',
  },
  {
    id: 'h-4-4',
    patientId: '4',
    date: subDays(new Date(), 3),
    type: 'update',
    title: 'Profile updated',
    description: 'Emergency contact and insurance details updated at reception.',
    handledBy: 'Reception — Grace Namuli',
    department: 'Reception',
    outcome: 'Patient demographics updated',
  },
];

export function getPatientHistory(patientId: string) {
  return patientHistory
    .filter((event) => event.patientId === patientId)
    .sort((a, b) => b.date.getTime() - a.date.getTime());
}
