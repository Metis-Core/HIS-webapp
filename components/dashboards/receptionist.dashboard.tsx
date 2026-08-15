'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { FaCalendarCheck, FaClipboardList, FaFileInvoiceDollar, FaPlus, FaUserInjured } from 'react-icons/fa';
import { Button, Dropdown, EmptyState, PatientDrawer, Pill, Stats, VisitReceiptDrawer } from '@/components';
import { ButtonVariantEnum, ModalDrawerModeEnum, PillVariantEnum, StatVariantEnum } from '@/enum';
import { QueueStageEnum, QueueEntryStatusEnum, VisitTypeEnum } from '@/enum/queue.enum';
import { PatientTypeEnum } from '@/enum/patient.enum';
import { patientFullName, patientInitials } from '@/data/patients';
import { currentEntry, departmentStageMap, entryStatusMap, statusVariants } from '@/data/queue';
import type { IOption, IPagination } from '@/interfaces';
import type { IPatient } from '@/interfaces/patient.interface';
import type { IVisitRecord } from '@/interfaces/queue.interfaces';
import { FaClockRotateLeft } from 'react-icons/fa6';
import useSWR from 'swr';
import { publicApi } from '@/helpers/axios';

interface IAppointment {
  id: string;
  patientName: string;
  doctor: string;
  time: string;
}

const appointments: IAppointment[] = [
  { id: 'a1', patientName: 'Grace Nabirye', doctor: 'Dr. Kiwanuka', time: '09:30 AM' },
  { id: 'a2', patientName: 'Moses Ssekandi', doctor: 'Dr. Namutebi', time: '11:00 AM' },
  { id: 'a3', patientName: 'Ruth Achieng', doctor: 'Dr. Byaruhanga', time: '02:15 PM' },
];

const stageOptions: IOption[] = Object.values(QueueStageEnum).map((stage) => ({
  label: stage.replace('-', ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
  value: stage,
}));

const visitTypeOptions: IOption[] = Object.values(VisitTypeEnum).map((type) => ({
  label: type.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
  value: type,
}));

export default function ReceptionistDashboard() {
  const router = useRouter();
  const { data } = useSWR<{ data: { data: IPagination<IPatient> } }>('/patients', publicApi);
  const patients = useMemo(() => data?.data.data.items || [], [data]);

  const { data: visitsData, mutate: mutateVisits } = useSWR<{ data: { data: IPagination<IVisitRecord> } }>(
    '/visits/queues',
    publicApi,
  );
  const visits = useMemo(() => visitsData?.data.data.items || [], [visitsData]);

  const activeQueue = useMemo(
    () =>
      visits
        .map((visit) => ({ visit, entry: currentEntry(visit) }))
        .filter((row) => row.entry && row.entry.status !== QueueEntryStatusEnum.COMPLETED)
        .sort((a, b) => a.entry!.sequenceNumber - b.entry!.sequenceNumber),
    [visits],
  );

  const [drawerMode, setDrawerMode] = useState<ModalDrawerModeEnum | null>(null);
  const [visitType, setVisitType] = useState<IOption>(visitTypeOptions[0]);
  const [walkInPatient, setWalkInPatient] = useState<IOption | null>(null);
  const [walkInMotives, setWalkInMotives] = useState<IOption[]>([]);
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const isWalkIn = visitType.value === VisitTypeEnum.WALK_IN;
  const fixedMotive = stageOptions.find(
    (option) =>
      option.value ===
      (visitType.value === VisitTypeEnum.EMERGENCY ? QueueStageEnum.EXAMINATION : QueueStageEnum.CONSULTATION),
  )!;
  const effectiveMotives = isWalkIn ? walkInMotives : [fixedMotive];

  const patientOptions = useMemo<IOption[]>(
    () =>
      patients && patients.length > 0
        ? patients.map((patient) => ({ label: `${patientFullName(patient)} - ${patient.mrn}`, value: patient.id }))
        : [],
    [patients],
  );

  const recentPatients = useMemo(
    () => [...patients].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).slice(0, 4),
    [patients],
  );

  const stats = useMemo(
    () => [
      { label: "Today's registrations", value: patients.length, icon: FaUserInjured, variant: StatVariantEnum.Green },
      {
        label: 'Patients in queue',
        value: activeQueue.length,
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
    [patients, activeQueue],
  );

  const handleSavePatient = () => {
    setDrawerMode(null);
  };

  const openReceipt = () => {
    if (!walkInPatient || effectiveMotives.length === 0) return;
    setReceiptOpen(true);
  };

  const confirmWalkIn = async () => {
    if (!walkInPatient || effectiveMotives.length === 0 || submitting) return;
    try {
      setSubmitting(true);
      await publicApi.post('/visits', {
        patientId: walkInPatient.value,
        visitType: visitType.value,
        intent: effectiveMotives.map((m) => m.value),
      });
      await mutateVisits();
      setVisitType(visitTypeOptions[0]);
      setWalkInPatient(null);
      setWalkInMotives([]);
      setReceiptOpen(false);
    } finally {
      setSubmitting(false);
    }
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
            label="Visit type"
            placeholder="Select visit type"
            options={visitTypeOptions}
            value={visitType}
            onChange={(value) => {
              const next = Array.isArray(value) ? value[0] : value;
              if (next) setVisitType(next);
            }}
          />
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <label className="text-md font-medium tracking-wider text-slate-700">Patient</label>
              <button
                type="button"
                onClick={() => setDrawerMode(ModalDrawerModeEnum.ADD)}
                className="text-xs font-medium text-green-700 hover:underline"
              >
                Add new patient
              </button>
            </div>
            <Dropdown
              placeholder="Search existing patients"
              options={patientOptions}
              value={walkInPatient}
              onChange={(value) => setWalkInPatient(Array.isArray(value) ? (value[0] ?? null) : value)}
            />
          </div>
          {isWalkIn && (
            <Dropdown
              label="Motive"
              isMulti
              placeholder="Consultation, lab..."
              options={stageOptions}
              value={walkInMotives}
              onChange={(value) => setWalkInMotives(Array.isArray(value) ? value : value ? [value] : [])}
            />
          )}
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
                {activeQueue.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-0">
                      <div className="flex h-64 w-full items-center justify-center">
                        <EmptyState message="No patients in queue" icon={FaClipboardList} />
                      </div>
                    </td>
                  </tr>
                ) : (
                  activeQueue.map(({ visit, entry }) => {
                    const status = entryStatusMap[entry!.status];
                    const stage = departmentStageMap[entry!.department];
                    return (
                      <tr
                        key={entry!.id}
                        className="border-b border-zinc-100 last:border-0 transition hover:bg-green-50/30"
                      >
                        <td className="px-6 py-4 font-medium text-zinc-900">
                          {visit.patient ? patientFullName(visit.patient) : visit.patientId}
                        </td>
                        <td className="px-6 py-4 capitalize text-zinc-600">{stage.replace('-', ' ')}</td>
                        <td className="px-6 py-4">
                          <Pill variant={statusVariants[status]}>{status.replace('-', ' ')}</Pill>
                        </td>
                        <td className="px-6 py-4 text-zinc-500">
                          {formatDistanceToNow(visit.createdAt, { addSuffix: true })}
                        </td>
                      </tr>
                    );
                  })
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

      <VisitReceiptDrawer
        open={receiptOpen}
        onClose={() => setReceiptOpen(false)}
        motives={effectiveMotives}
        patient={patients.find((patient) => patient.id === walkInPatient?.value) ?? null}
        onConfirm={confirmWalkIn}
        submitting={submitting}
      />
    </div>
  );
}
