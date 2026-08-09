'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import {
  FaCalendarCheck,
  FaClipboardList,
  FaFileInvoiceDollar,
  FaMapMarkerAlt,
  FaPhone,
  FaPlus,
  FaShieldAlt,
  FaUserFriends,
  FaUserInjured,
} from 'react-icons/fa';
import { Button, Drawer, Dropdown, EmptyState, PatientDrawer, Pill, Stats } from '@/components';
import { ButtonVariantEnum, GenderEnum, ModalDrawerModeEnum, PillVariantEnum, StatVariantEnum } from '@/enum';
import { QueueStageEnum, QueueStatusEnum } from '@/enum/queue.enum';
import { PatientTypeEnum } from '@/enum/patient.enum';
import { patientFullName, patientInitials, seedPatients } from '@/data/patients';
import { serviceFeeMap } from '@/data/services';
import type { IOption, PatientFormValues } from '@/interfaces';
import type { IPatient } from '@/interfaces/patient.interface';
import { FaClockRotateLeft } from 'react-icons/fa6';

interface IQueueEntry {
  id: string;
  patientName: string;
  stage: QueueStageEnum;
  status: QueueStatusEnum;
  checkedInAt: Date;
}

interface IAppointment {
  id: string;
  patientName: string;
  doctor: string;
  time: string;
}

const initialQueue: IQueueEntry[] = [
  {
    id: 'q1',
    patientName: 'Amina Nalwanga',
    stage: QueueStageEnum.CONSULTATION,
    status: QueueStatusEnum.IN_PROGRESS,
    checkedInAt: new Date(Date.now() - 25 * 60 * 1000),
  },
  {
    id: 'q2',
    patientName: 'James Okello',
    stage: QueueStageEnum.REGISTRATION,
    status: QueueStatusEnum.PENDING,
    checkedInAt: new Date(Date.now() - 8 * 60 * 1000),
  },
  {
    id: 'q3',
    patientName: 'Sarah Mbabazi',
    stage: QueueStageEnum.LAB,
    status: QueueStatusEnum.PENDING,
    checkedInAt: new Date(Date.now() - 40 * 60 * 1000),
  },
  {
    id: 'q4',
    patientName: 'Peter Kato',
    stage: QueueStageEnum.PHARMACY,
    status: QueueStatusEnum.COMPLETED,
    checkedInAt: new Date(Date.now() - 90 * 60 * 1000),
  },
];

const appointments: IAppointment[] = [
  { id: 'a1', patientName: 'Grace Nabirye', doctor: 'Dr. Kiwanuka', time: '09:30 AM' },
  { id: 'a2', patientName: 'Moses Ssekandi', doctor: 'Dr. Namutebi', time: '11:00 AM' },
  { id: 'a3', patientName: 'Ruth Achieng', doctor: 'Dr. Byaruhanga', time: '02:15 PM' },
];

const stageOptions: IOption[] = Object.values(QueueStageEnum).map((stage) => ({
  label: stage.replace('-', ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
  value: stage,
}));

const statusVariants: Record<QueueStatusEnum, PillVariantEnum> = {
  [QueueStatusEnum.PENDING]: PillVariantEnum.WARNING,
  [QueueStatusEnum.IN_PROGRESS]: PillVariantEnum.INFO,
  [QueueStatusEnum.COMPLETED]: PillVariantEnum.SUCCESS,
  [QueueStatusEnum.CANCELLED]: PillVariantEnum.DANGER,
};

const VAT_RATE = 0.18;

export default function ReceptionistDashboard() {
  const router = useRouter();
  const [patients, setPatients] = useState<IPatient[]>(seedPatients);
  const [queue, setQueue] = useState<IQueueEntry[]>(initialQueue);
  const [drawerMode, setDrawerMode] = useState<ModalDrawerModeEnum | null>(null);
  const [walkInPatient, setWalkInPatient] = useState<IOption | null>(null);
  const [walkInMotives, setWalkInMotives] = useState<IOption[]>([]);
  const [receiptOpen, setReceiptOpen] = useState(false);

  const patientOptions = useMemo<IOption[]>(
    () => patients.map((patient) => ({ label: patientFullName(patient), value: patient.id })),
    [patients],
  );

  const totalFee = walkInMotives.reduce((sum, motive) => sum + (serviceFeeMap[motive.value as QueueStageEnum] ?? 0), 0);
  const vatAmount = totalFee * VAT_RATE;
  const grandTotal = totalFee + vatAmount;
  const walkInPatientRecord = patients.find((patient) => patient.id === walkInPatient?.value) ?? null;

  const recentPatients = useMemo(
    () => [...patients].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).slice(0, 4),
    [patients],
  );

  const stats = useMemo(
    () => [
      { label: "Today's registrations", value: patients.length, icon: FaUserInjured, variant: StatVariantEnum.Green },
      {
        label: 'Patients in queue',
        value: queue.filter((q) => q.status === QueueStatusEnum.PENDING || q.status === QueueStatusEnum.IN_PROGRESS)
          .length,
        icon: FaClipboardList,
        variant: StatVariantEnum.Blue,
      },
      {
        label: "Today's appointments",
        value: appointments.length,
        icon: FaCalendarCheck,
        variant: StatVariantEnum.Emerald,
      },
      { label: 'Pending invoices', value: 6, icon: FaFileInvoiceDollar, variant: StatVariantEnum.Amber },
    ],
    [patients, queue],
  );

  const handleSavePatient = (values: PatientFormValues) => {
    const now = new Date();
    setPatients((prev) => [
      {
        id: crypto.randomUUID(),
        firstName: values.firstName,
        lastName: values.lastName,
        middleName: values.middleName || undefined,
        dateOfBirth: values.dateOfBirth ? new Date(values.dateOfBirth) : undefined,
        phone: values.phone,
        email: values.email || undefined,
        gender: values.gender as GenderEnum,
        type: values.type as PatientTypeEnum,
        address: values.address,
        city: values.city,
        nationalId: values.nationalId || undefined,
        insuranceProvider: values.insuranceProvider || undefined,
        insurancePolicyNumber: values.insurancePolicyNumber || undefined,
        createdAt: now,
        updatedAt: now,
      },
      ...prev,
    ]);
    setDrawerMode(null);
  };

  const openReceipt = () => {
    if (!walkInPatient || walkInMotives.length === 0) return;
    setReceiptOpen(true);
  };

  const confirmWalkIn = () => {
    if (!walkInPatient || walkInMotives.length === 0) return;
    setQueue((prev) => [
      {
        id: crypto.randomUUID(),
        patientName: walkInPatient.label,
        stage: walkInMotives[0].value as QueueStageEnum,
        status: QueueStatusEnum.PENDING,
        checkedInAt: new Date(),
      },
      ...prev,
    ]);
    setWalkInPatient(null);
    setWalkInMotives([]);
    setReceiptOpen(false);
  };

  return (
    <div className="flex flex-col gap-8 py-4">
      <Stats items={stats} />

      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-lg font-bold text-zinc-800">Front desk</h2>
        <div className="flex flex-wrap gap-3">
          <Button type="button" onClick={() => router.push('/patients')} variant={ButtonVariantEnum.SECONDARY}>
            View all patients
          </Button>
          <Button type="button" onClick={() => setDrawerMode(ModalDrawerModeEnum.ADD)}>
            <FaPlus className="text-base" />
            <span className="font-semibold">Register patient</span>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-4 rounded-xl border border-zinc-200 bg-white p-5 lg:col-span-1">
          <h3 className="text-md font-bold text-zinc-800">Add walk-in to queue</h3>
          <Dropdown
            label="Patient"
            placeholder="Search existing patients"
            options={patientOptions}
            value={walkInPatient}
            onChange={(value) => setWalkInPatient(Array.isArray(value) ? (value[0] ?? null) : value)}
          />
          <Dropdown
            label="Motive"
            isMulti
            placeholder="Consultation, lab..."
            options={stageOptions}
            value={walkInMotives}
            onChange={(value) => setWalkInMotives(Array.isArray(value) ? value : value ? [value] : [])}
          />
          <Button type="button" onClick={openReceipt} className="w-full justify-center">
            Add to queue
          </Button>
        </div>

        <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white lg:col-span-2">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="border-b border-zinc-200 bg-green-50 text-green-900">
                <tr>
                  <th className="px-6 py-3 text-md font-bold">Patient</th>
                  <th className="px-6 py-3 text-md font-bold">Stage</th>
                  <th className="px-6 py-3 text-md font-bold">Status</th>
                  <th className="px-6 py-3 text-md font-bold">Waiting</th>
                </tr>
              </thead>
              <tbody>
                {queue.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-0">
                      <div className="flex h-64 w-full items-center justify-center">
                        <EmptyState message="No patients in queue" icon={FaClipboardList} />
                      </div>
                    </td>
                  </tr>
                ) : (
                  queue.map((entry) => (
                    <tr
                      key={entry.id}
                      className="border-b border-zinc-100 last:border-0 transition hover:bg-green-50/30"
                    >
                      <td className="px-6 py-4 font-medium text-zinc-900">{entry.patientName}</td>
                      <td className="px-6 py-4 capitalize text-zinc-600">{entry.stage.replace('-', ' ')}</td>
                      <td className="px-6 py-4">
                        <Pill variant={statusVariants[entry.status]}>{entry.status.replace('-', ' ')}</Pill>
                      </td>
                      <td className="px-6 py-4 text-zinc-500">
                        {formatDistanceToNow(entry.checkedInAt, { addSuffix: true })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="flex flex-col gap-4 rounded-xl border border-zinc-200 bg-white p-5">
          <div className="flex items-center justify-between border-b border-zinc-200 pb-2">
            <h3 className="text-md font-bold text-zinc-800">Recent patients</h3>
            <Button type="button" onClick={() => router.push('/patients')} variant={ButtonVariantEnum.GHOST}>
              View all
            </Button>
          </div>
          <div className="flex flex-col divide-y divide-zinc-100">
            {recentPatients.length === 0 ? (
              <div className="flex h-64 w-full items-center justify-center">
                <EmptyState message="No recent patients" icon={FaUserInjured} />
              </div>
            ) : (
              recentPatients.map((patient) => (
                <div key={patient.id} className="flex items-center gap-3 py-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-800 text-sm font-bold text-white">
                    {patientInitials(patient)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-zinc-900">{patientFullName(patient)}</p>
                    <p className="text-xs text-zinc-500">
                      {formatDistanceToNow(patient.createdAt, { addSuffix: true })}
                    </p>
                  </div>
                  <Pill
                    variant={
                      patient.type === PatientTypeEnum.INPATIENT ? PillVariantEnum.INFO : PillVariantEnum.SUCCESS
                    }
                  >
                    {patient.type}
                  </Pill>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="flex flex-col gap-4 rounded-xl border border-zinc-200 bg-white p-5">
          <div className="flex items-center justify-between border-b border-zinc-200 pb-2">
            <h3 className="text-md font-bold text-zinc-800">Today&apos;s appointments</h3>
            <Button type="button" onClick={() => router.push('/patients')} variant={ButtonVariantEnum.GHOST}>
              View all
            </Button>
          </div>
          <div className="flex flex-col divide-y divide-zinc-100">
            {appointments.length === 0 ? (
              <div className="flex h-64 w-full items-center justify-center">
                <EmptyState message="No patients appointments today" icon={FaClockRotateLeft} />
              </div>
            ) : (
              appointments.map((appointment) => (
                <div key={appointment.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-zinc-900">{appointment.patientName}</p>
                    <p className="text-xs text-zinc-500">{appointment.doctor}</p>
                  </div>
                  <Pill>{appointment.time}</Pill>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <PatientDrawer
        mode={drawerMode}
        patient={null}
        onClose={() => setDrawerMode(null)}
        onSave={handleSavePatient}
        onEdit={() => {}}
      />

      <Drawer open={receiptOpen} onClose={() => setReceiptOpen(false)} title="Visit receipt" width="w-125">
        <div className="flex flex-col gap-6">
          <div className="overflow-hidden rounded-xl border border-zinc-200">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-zinc-200 bg-green-50 text-green-900">
                <tr>
                  <th className="px-4 py-2 font-bold">Service</th>
                  <th className="px-4 py-2 font-bold">Unit cost</th>
                </tr>
              </thead>
              <tbody>
                {walkInMotives.map((motive) => (
                  <tr key={motive.value} className="border-b border-zinc-100 last:border-0">
                    <td className="px-4 py-2 capitalize text-zinc-700">{motive.label}</td>
                    <td className="px-4 py-2 text-zinc-700">
                      UGX {(serviceFeeMap[motive.value as QueueStageEnum] ?? 0).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex flex-col gap-1 border-t border-zinc-200 px-4 py-3 text-sm">
              <div className="flex items-center justify-between text-zinc-700">
                <span>Subtotal</span>
                <span>UGX {totalFee.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between text-zinc-700">
                <span>VAT ({(VAT_RATE * 100).toFixed(0)}%)</span>
                <span>UGX {vatAmount.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between border-t border-zinc-200 pt-2 font-bold text-zinc-900">
                <span>Total</span>
                <span>UGX {grandTotal.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            <span className="font-medium">Awaiting patient consent to pay</span>
            <Pill variant={PillVariantEnum.WARNING}>Pending</Pill>
          </div>

          <div className="flex flex-col gap-2 rounded-xl border border-zinc-200 p-4 text-sm">
            <p className="font-bold text-zinc-800">Patient details</p>
            <div className="flex items-center justify-between text-zinc-700">
              <span>Name</span>
              <span>{walkInPatient?.label}</span>
            </div>
            <div className="flex items-center justify-between text-zinc-700">
              <span>Phone</span>
              <span className="inline-flex items-center gap-1.5">
                <FaPhone className="text-xs text-zinc-400" />
                {walkInPatientRecord?.phone ?? '—'}
              </span>
            </div>
            <div className="flex items-center justify-between text-zinc-700">
              <span>Email</span>
              <span>{walkInPatientRecord?.email ?? '—'}</span>
            </div>
            <div className="flex items-center justify-between text-zinc-700">
              <span>Location</span>
              <span className="inline-flex items-center gap-1.5">
                <FaMapMarkerAlt className="text-xs text-zinc-400" />
                {walkInPatientRecord?.city ?? '—'}
              </span>
            </div>
            <div className="flex items-center justify-between text-zinc-700">
              <span>Insurance</span>
              {walkInPatientRecord?.insuranceProvider ? (
                <span className="flex flex-col items-end gap-0.5">
                  <span className="inline-flex items-center gap-1.5 font-medium text-zinc-800">
                    <FaShieldAlt className="text-xs text-green-700" />
                    {walkInPatientRecord.insuranceProvider}
                  </span>
                  {walkInPatientRecord.insurancePolicyNumber && (
                    <span className="text-xs text-zinc-500">{walkInPatientRecord.insurancePolicyNumber}</span>
                  )}
                </span>
              ) : (
                <span className="text-zinc-400">Self-pay</span>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-2 rounded-xl border border-zinc-200 p-4 text-sm">
            <p className="font-bold text-zinc-800">Next of kin</p>
            <div className="flex items-center justify-between text-zinc-700">
              <span>Name</span>
              <span className="inline-flex items-center gap-1.5">
                <FaUserFriends className="text-xs text-zinc-400" />
                {walkInPatientRecord?.emergencyContactName ?? '—'}
              </span>
            </div>
            <div className="flex items-center justify-between text-zinc-700">
              <span>Phone</span>
              <span>{walkInPatientRecord?.emergencyContactPhone ?? '—'}</span>
            </div>
            <div className="flex items-center justify-between text-zinc-700">
              <span>Relationship</span>
              <span>{walkInPatientRecord?.emergencyContactRelationship ?? '—'}</span>
            </div>
          </div>

          <Button type="button" onClick={confirmWalkIn} className="w-full justify-center">
            Confirm & add to queue
          </Button>
        </div>
      </Drawer>
    </div>
  );
}
