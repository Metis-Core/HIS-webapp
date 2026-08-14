'use client';

import { useMemo, useState } from 'react';
import * as Yup from 'yup';
import { formatDistanceToNow } from 'date-fns';
import { FaClipboardList, FaHeartbeat, FaHourglassHalf, FaPlus, FaSearch } from 'react-icons/fa';
import {
  Button,
  Drawer,
  Dropdown,
  EmptyState,
  Form,
  FormDropdown,
  FormInput,
  Input,
  PageHeader,
  Pill,
  Stats,
} from '@/components';
import { ButtonVariantEnum, DepartmentEnum, PillVariantEnum, StatVariantEnum } from '@/enum';
import { ConsciousnessLevelEnum, TriageAcuityEnum, TriageStatusEnum } from '@/enum/triage.enum';
import { usePatients, useTriage } from '@/hooks';
import type { ICreateTriageDto, IOption, ITriage } from '@/interfaces';

const humanize = (value: string) => value.replace(/_/g, ' ').toLowerCase();
const acuityLabel = (value: TriageAcuityEnum) => value.replace('LEVEL_', 'Level ');

const acuityVariants: Record<TriageAcuityEnum, PillVariantEnum> = {
  [TriageAcuityEnum.LEVEL_1]: PillVariantEnum.DANGER,
  [TriageAcuityEnum.LEVEL_2]: PillVariantEnum.DANGER,
  [TriageAcuityEnum.LEVEL_3]: PillVariantEnum.WARNING,
  [TriageAcuityEnum.LEVEL_4]: PillVariantEnum.INFO,
  [TriageAcuityEnum.LEVEL_5]: PillVariantEnum.SUCCESS,
};

const statusVariants: Record<TriageStatusEnum, PillVariantEnum> = {
  [TriageStatusEnum.WAITING]: PillVariantEnum.WARNING,
  [TriageStatusEnum.IN_PROGRESS]: PillVariantEnum.INFO,
  [TriageStatusEnum.COMPLETED]: PillVariantEnum.SUCCESS,
  [TriageStatusEnum.REFERRED]: PillVariantEnum.INFO,
  [TriageStatusEnum.LEFT_WITHOUT_BEING_SEEN]: PillVariantEnum.DEFAULT,
  [TriageStatusEnum.CANCELLED]: PillVariantEnum.DANGER,
};

const statusFilterOptions: IOption[] = [
  { label: 'All statuses', value: 'all' },
  ...Object.values(TriageStatusEnum).map((status) => ({ label: humanize(status), value: status })),
];

const acuityOptions: IOption[] = Object.values(TriageAcuityEnum).map((acuity) => ({
  label: acuityLabel(acuity),
  value: acuity,
}));

const consciousnessOptions: IOption[] = Object.values(ConsciousnessLevelEnum).map((level) => ({
  label: humanize(level),
  value: level,
}));

const departmentOptions: IOption[] = Object.values(DepartmentEnum).map((department) => ({
  label: humanize(department),
  value: department,
}));

interface TriageFormValues {
  patientId: string;
  acuity: string;
  chiefComplaint: string;
  consciousness: string;
  temperatureC: string;
  heartRate: string;
  respiratoryRate: string;
  bloodPressureSystolic: string;
  bloodPressureDiastolic: string;
  oxygenSaturation: string;
  painScore: string;
  referredToDepartment: string;
  assessmentNotes: string;
}

const emptyForm: TriageFormValues = {
  patientId: '',
  acuity: '',
  chiefComplaint: '',
  consciousness: '',
  temperatureC: '',
  heartRate: '',
  respiratoryRate: '',
  bloodPressureSystolic: '',
  bloodPressureDiastolic: '',
  oxygenSaturation: '',
  painScore: '',
  referredToDepartment: '',
  assessmentNotes: '',
};

const schema = Yup.object({
  patientId: Yup.string().required('Patient is required'),
  acuity: Yup.string().oneOf(Object.values(TriageAcuityEnum)).required('Acuity is required'),
  chiefComplaint: Yup.string().required('Chief complaint is required'),
});

const toNumber = (value: string) => {
  const trimmed = value.trim();
  return trimmed === '' ? undefined : Number(trimmed);
};

const patientName = (triage: ITriage) => {
  const patient = triage.patient;
  return patient ? [patient.firstName, patient.lastName].filter(Boolean).join(' ') : 'Unknown patient';
};

export default function TriagePage() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<IOption>(statusFilterOptions[0]);
  const [open, setOpen] = useState(false);

  const { triages, total, isLoading, createTriage } = useTriage({
    q: search.trim() || undefined,
    status: status.value === 'all' ? undefined : (status.value as TriageStatusEnum),
    limit: 100,
  });

  const { patients } = usePatients({ limit: 100 });
  const patientOptions = useMemo<IOption[]>(
    () => patients.map((patient) => ({ label: `${patient.firstName} ${patient.lastName}`, value: patient.id })),
    [patients],
  );

  const stats = useMemo(
    () => [
      { label: 'Triage records', value: total, icon: FaClipboardList, variant: StatVariantEnum.Green },
      {
        label: 'Waiting',
        value: triages.filter((triage) => triage.status === TriageStatusEnum.WAITING).length,
        icon: FaHourglassHalf,
        variant: StatVariantEnum.Amber,
      },
      {
        label: 'Critical (L1–L2)',
        value: triages.filter(
          (triage) => triage.acuity === TriageAcuityEnum.LEVEL_1 || triage.acuity === TriageAcuityEnum.LEVEL_2,
        ).length,
        icon: FaHeartbeat,
        variant: StatVariantEnum.Emerald,
      },
    ],
    [triages, total],
  );

  const handleSubmit = async (values: TriageFormValues) => {
    const payload: ICreateTriageDto = {
      patientId: values.patientId,
      acuity: values.acuity as TriageAcuityEnum,
      chiefComplaint: values.chiefComplaint.trim(),
      consciousness: (values.consciousness as ConsciousnessLevelEnum) || undefined,
      temperatureC: toNumber(values.temperatureC),
      heartRate: toNumber(values.heartRate),
      respiratoryRate: toNumber(values.respiratoryRate),
      bloodPressureSystolic: toNumber(values.bloodPressureSystolic),
      bloodPressureDiastolic: toNumber(values.bloodPressureDiastolic),
      oxygenSaturation: toNumber(values.oxygenSaturation),
      painScore: toNumber(values.painScore),
      referredToDepartment: (values.referredToDepartment as DepartmentEnum) || undefined,
      assessmentNotes: values.assessmentNotes.trim() || undefined,
    };
    try {
      await createTriage(payload);
      setOpen(false);
    } catch {
      window.alert('Failed to record triage. Please try again.');
    }
  };

  return (
    <div className="flex flex-col gap-8 py-4">
      <PageHeader
        title="Triage"
        description="Assess acuity, capture vitals and route patients to the right department."
        actions={
          <Button type="button" variant={ButtonVariantEnum.PRIMARY} onClick={() => setOpen(true)}>
            <FaPlus className="text-base" />
            <span className="font-semibold">Record triage</span>
          </Button>
        }
      />
      <Stats items={stats} />

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-60 flex-1">
          <FaSearch className="pointer-events-none absolute top-1/2 left-3 z-10 -translate-y-1/2 text-xs text-slate-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search complaint or patient"
            className="pl-9"
          />
        </div>
        <div className="w-52">
          <Dropdown
            compact
            options={statusFilterOptions}
            value={status}
            onChange={(value) => setStatus((Array.isArray(value) ? value[0] : value) ?? statusFilterOptions[0])}
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="border-b border-zinc-200 bg-green-50 text-green-900">
              <tr>
                <th className="px-6 py-3 text-md font-bold">Patient</th>
                <th className="px-6 py-3 text-md font-bold">Acuity</th>
                <th className="px-6 py-3 text-md font-bold">Chief complaint</th>
                <th className="px-6 py-3 text-md font-bold">Status</th>
                <th className="px-6 py-3 text-right text-md font-bold">Arrived</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center text-sm text-zinc-500">
                    Loading triage records…
                  </td>
                </tr>
              ) : triages.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-0">
                    <div className="flex h-64 w-full items-center justify-center">
                      <EmptyState message="No triage records found" icon={FaClipboardList} />
                    </div>
                  </td>
                </tr>
              ) : (
                triages.map((triage) => (
                  <tr
                    key={triage.id}
                    className="border-b border-zinc-100 last:border-0 transition hover:bg-green-50/30"
                  >
                    <td className="px-6 py-4 font-medium text-zinc-900">{patientName(triage)}</td>
                    <td className="px-6 py-4">
                      <Pill variant={acuityVariants[triage.acuity]}>{acuityLabel(triage.acuity)}</Pill>
                    </td>
                    <td className="px-6 py-4 text-zinc-700">{triage.chiefComplaint}</td>
                    <td className="px-6 py-4">
                      <Pill variant={statusVariants[triage.status]}>{humanize(triage.status)}</Pill>
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap text-zinc-500">
                      {formatDistanceToNow(new Date(triage.arrivedAt), { addSuffix: true })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Drawer open={open} onClose={() => setOpen(false)} title="Record triage">
        <Form
          initialValues={emptyForm}
          validationSchema={schema}
          onSubmit={handleSubmit}
          className="flex h-full flex-col gap-6"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <FormDropdown name="patientId" label="Patient" options={patientOptions} placeholder="Select patient" />
            </div>
            <FormDropdown name="acuity" label="Acuity" options={acuityOptions} placeholder="Select acuity" />
            <FormDropdown
              name="consciousness"
              label="Consciousness"
              options={consciousnessOptions}
              placeholder="Select level"
            />
            <div className="sm:col-span-2">
              <FormInput name="chiefComplaint" label="Chief complaint" placeholder="Presenting complaint" required />
            </div>
            <FormInput name="temperatureC" label="Temperature (°C)" type="number" placeholder="36.5" />
            <FormInput name="heartRate" label="Heart rate (bpm)" type="number" placeholder="80" />
            <FormInput name="respiratoryRate" label="Respiratory rate" type="number" placeholder="16" />
            <FormInput name="oxygenSaturation" label="SpO₂ (%)" type="number" placeholder="98" />
            <FormInput name="bloodPressureSystolic" label="BP systolic" type="number" placeholder="120" />
            <FormInput name="bloodPressureDiastolic" label="BP diastolic" type="number" placeholder="80" />
            <FormInput name="painScore" label="Pain score (0–10)" type="number" placeholder="0" />
            <FormDropdown
              name="referredToDepartment"
              label="Refer to"
              options={departmentOptions}
              placeholder="Optional"
            />
            <div className="sm:col-span-2">
              <FormInput name="assessmentNotes" label="Assessment notes" placeholder="Optional" />
            </div>
          </div>

          <div className="mt-auto flex justify-end gap-3 border-t border-zinc-100 pt-5">
            <Button type="button" variant={ButtonVariantEnum.DANGER} onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" className="px-6 py-2 font-semibold">
              Save triage
            </Button>
          </div>
        </Form>
      </Drawer>
    </div>
  );
}
