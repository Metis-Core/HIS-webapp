'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { FaClipboardList, FaHeartbeat, FaHourglassHalf, FaPlus, FaSearch, FaUserInjured } from 'react-icons/fa';
import { Button, Dropdown, EmptyState, Input, PageHeader, PatientDrawer, Pill, Stats } from '@/components';
import { ButtonVariantEnum, DepartmentEnum, ModalDrawerModeEnum, PillVariantEnum, StatVariantEnum } from '@/enum';
import { QueueEntryStatusEnum, VisitTypeEnum } from '@/enum/queue.enum';
import { PatientTypeEnum } from '@/enum/patient.enum';
import { patientFullName, patientInitials } from '@/data/patients';
import { toPatientDto } from '@/helpers/patients.service';
import { usePatients, useQueue } from '@/hooks';
import type { IOption, IPatient, IQueueEntry, PatientFormValues } from '@/interfaces';

const humanize = (value: string) => value.replace(/_/g, ' ').toLowerCase();

const queueStatusVariants: Record<QueueEntryStatusEnum, PillVariantEnum> = {
  [QueueEntryStatusEnum.WAITING]: PillVariantEnum.WARNING,
  [QueueEntryStatusEnum.CALLED]: PillVariantEnum.INFO,
  [QueueEntryStatusEnum.IN_SERVICE]: PillVariantEnum.INFO,
  [QueueEntryStatusEnum.COMPLETED]: PillVariantEnum.SUCCESS,
  [QueueEntryStatusEnum.SKIPPED]: PillVariantEnum.DEFAULT,
  [QueueEntryStatusEnum.TRANSFERRED]: PillVariantEnum.DEFAULT,
};

const visitTypeOptions: IOption[] = Object.values(VisitTypeEnum).map((type) => ({
  label: humanize(type),
  value: type,
}));

const departmentOptions: IOption[] = Object.values(DepartmentEnum).map((department) => ({
  label: humanize(department),
  value: department,
}));

const patientName = (entry: IQueueEntry) => {
  const patient = entry.visit?.patient;
  return patient ? [patient.firstName, patient.lastName].filter(Boolean).join(' ') : 'Unknown patient';
};

export default function ReceptionistDashboard() {
  const router = useRouter();

  const [drawerMode, setDrawerMode] = useState<ModalDrawerModeEnum | null>(null);
  const [patientSearch, setPatientSearch] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<IOption | null>(null);
  const [visitType, setVisitType] = useState<IOption>(visitTypeOptions[0]);
  const [department, setDepartment] = useState<IOption>(
    departmentOptions.find((option) => option.value === DepartmentEnum.TRIAGE) ?? departmentOptions[0],
  );
  const [notes, setNotes] = useState('');
  const [checkingIn, setCheckingIn] = useState(false);

  const { patients: searchResults } = usePatients({ search: patientSearch.trim() || undefined, limit: 20 });
  const { patients: recentPatients, total: patientTotal, createPatient } = usePatients({ limit: 6 });
  const { entries, total: queueTotal, checkIn } = useQueue({ limit: 100 });

  const patientOptions = useMemo<IOption[]>(
    () =>
      searchResults.map((patient) => ({
        label: `${patientFullName(patient)} · ${patient.phone ?? patient.mrn ?? ''}`.trim(),
        value: patient.id,
      })),
    [searchResults],
  );

  const stats = useMemo(
    () => [
      { label: 'Registered patients', value: patientTotal, icon: FaUserInjured, variant: StatVariantEnum.Green },
      { label: 'In queue today', value: queueTotal, icon: FaClipboardList, variant: StatVariantEnum.Blue },
      {
        label: 'Waiting',
        value: entries.filter((entry) => entry.status === QueueEntryStatusEnum.WAITING).length,
        icon: FaHourglassHalf,
        variant: StatVariantEnum.Amber,
      },
      {
        label: 'Emergencies',
        value: entries.filter((entry) => entry.visit?.visitType === VisitTypeEnum.EMERGENCY).length,
        icon: FaHeartbeat,
        variant: StatVariantEnum.Emerald,
      },
    ],
    [patientTotal, queueTotal, entries],
  );

  const handleRegister = async (values: PatientFormValues) => {
    try {
      await createPatient(toPatientDto(values));
      setDrawerMode(null);
    } catch {
      window.alert('Failed to register patient. Please check the details and try again.');
    }
  };

  const handleCheckIn = async () => {
    if (!selectedPatient) return;
    setCheckingIn(true);
    try {
      await checkIn({
        patientId: String(selectedPatient.value),
        visitType: visitType.value as VisitTypeEnum,
        department: department.value as DepartmentEnum,
        notes: notes.trim() || undefined,
      });
      setSelectedPatient(null);
      setNotes('');
    } catch {
      window.alert('Check-in failed. The patient may already have an open visit today.');
    } finally {
      setCheckingIn(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 py-4">
      <PageHeader
        title="Front desk"
        description="Register patients, check them in and route them to the right department."
        actions={
          <>
            <Button type="button" variant={ButtonVariantEnum.SECONDARY} onClick={() => router.push('/patients')}>
              View all patients
            </Button>
            <Button type="button" onClick={() => setDrawerMode(ModalDrawerModeEnum.ADD)}>
              <FaPlus className="text-base" />
              <span className="font-semibold">Register patient</span>
            </Button>
          </>
        }
      />

      <Stats items={stats} />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-5 lg:col-span-1">
          <h3 className="text-md font-bold text-slate-800">Check in a patient</h3>

          <div className="relative">
            <FaSearch className="pointer-events-none absolute top-1/2 left-3 z-10 -translate-y-1/2 text-xs text-slate-400" />
            <Input
              value={patientSearch}
              onChange={(e) => setPatientSearch(e.target.value)}
              placeholder="Search by name, phone, MRN…"
              className="pl-9"
            />
          </div>

          <Dropdown
            label="Patient"
            placeholder="Select from results"
            options={patientOptions}
            value={selectedPatient}
            onChange={(value) => setSelectedPatient(Array.isArray(value) ? (value[0] ?? null) : value)}
          />

          <Dropdown
            label="Visit type"
            options={visitTypeOptions}
            value={visitType}
            onChange={(value) => setVisitType((Array.isArray(value) ? value[0] : value) ?? visitTypeOptions[0])}
          />

          <Dropdown
            label="Send to department"
            options={departmentOptions}
            value={department}
            onChange={(value) => setDepartment((Array.isArray(value) ? value[0] : value) ?? departmentOptions[0])}
          />

          <Input
            label="Notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Optional reason / instructions"
          />

          <Button
            type="button"
            loading={checkingIn}
            disabled={!selectedPatient}
            onClick={handleCheckIn}
            className="w-full justify-center"
          >
            Check in &amp; add to queue
          </Button>
        </div>

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white lg:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
            <h3 className="text-md font-bold text-slate-800">Today&apos;s queue</h3>
            <Link href="/queue" className="text-xs font-semibold text-green-800 hover:underline">
              Open queue
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="border-b border-slate-200 bg-green-50 text-green-900">
                <tr>
                  <th className="px-6 py-3 text-md font-bold">Patient</th>
                  <th className="px-6 py-3 text-md font-bold">Heading to</th>
                  <th className="px-6 py-3 text-md font-bold">Status</th>
                  <th className="px-6 py-3 text-right text-md font-bold">Waiting</th>
                </tr>
              </thead>
              <tbody>
                {entries.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-0">
                      <div className="flex h-64 w-full items-center justify-center">
                        <EmptyState message="No patients in queue" icon={FaClipboardList} />
                      </div>
                    </td>
                  </tr>
                ) : (
                  entries.map((entry) => (
                    <tr
                      key={entry.id}
                      className="border-b border-slate-100 last:border-0 transition hover:bg-green-50/30"
                    >
                      <td className="px-6 py-4 font-medium text-slate-900">
                        <Link href={`/queue/${entry.id}`} className="hover:text-green-800 hover:underline">
                          {patientName(entry)}
                        </Link>
                      </td>
                      <td className="px-6 py-4 capitalize text-slate-700">{humanize(entry.department)}</td>
                      <td className="px-6 py-4">
                        <Pill variant={queueStatusVariants[entry.status]}>{humanize(entry.status)}</Pill>
                      </td>
                      <td className="px-6 py-4 text-right whitespace-nowrap text-slate-500">
                        {formatDistanceToNow(new Date(entry.createdAt), { addSuffix: true })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <h3 className="text-md font-bold text-slate-800">Recent patients</h3>
          <Link href="/patients" className="text-xs font-semibold text-green-800 hover:underline">
            View all
          </Link>
        </div>
        <div className="flex flex-col divide-y divide-slate-100">
          {recentPatients.length === 0 ? (
            <div className="flex h-40 w-full items-center justify-center">
              <EmptyState message="No recent patients" icon={FaUserInjured} />
            </div>
          ) : (
            recentPatients.map((patient: IPatient) => (
              <Link
                key={patient.id}
                href={`/patients/${patient.id}`}
                className="flex items-center gap-3 py-3 transition hover:bg-slate-50"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-800 text-sm font-bold text-white">
                  {patientInitials(patient)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-slate-900">{patientFullName(patient)}</p>
                  <p className="text-xs text-slate-500">
                    {formatDistanceToNow(new Date(patient.createdAt), { addSuffix: true })}
                  </p>
                </div>
                <Pill
                  variant={patient.type === PatientTypeEnum.INPATIENT ? PillVariantEnum.INFO : PillVariantEnum.SUCCESS}
                >
                  {patient.type}
                </Pill>
              </Link>
            ))
          )}
        </div>
      </div>

      <PatientDrawer
        mode={drawerMode}
        patient={null}
        onClose={() => setDrawerMode(null)}
        onSave={handleRegister}
        onEdit={() => {}}
      />
    </div>
  );
}
