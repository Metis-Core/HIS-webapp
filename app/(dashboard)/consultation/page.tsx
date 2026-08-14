'use client';

import { Suspense, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import * as Yup from 'yup';
import { format, formatDistanceToNow } from 'date-fns';
import { FaCheckCircle, FaClipboardList, FaPlus, FaSearch, FaStethoscope } from 'react-icons/fa';
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
import { ConsultationStatusEnum, ConsultationTypeEnum } from '@/enum/consultation.enum';
import { useConsultations, usePatients } from '@/hooks';
import type { IConsultation, ICreateConsultationDto, IOption } from '@/interfaces';

const humanize = (value: string) => value.replace(/_/g, ' ').toLowerCase();

const statusVariants: Record<ConsultationStatusEnum, PillVariantEnum> = {
  [ConsultationStatusEnum.IN_PROGRESS]: PillVariantEnum.INFO,
  [ConsultationStatusEnum.COMPLETED]: PillVariantEnum.SUCCESS,
  [ConsultationStatusEnum.CANCELLED]: PillVariantEnum.DANGER,
};

const statusFilterOptions: IOption[] = [
  { label: 'All statuses', value: 'all' },
  ...Object.values(ConsultationStatusEnum).map((status) => ({ label: humanize(status), value: status })),
];

const typeOptions: IOption[] = Object.values(ConsultationTypeEnum).map((type) => ({
  label: humanize(type),
  value: type,
}));

const departmentOptions: IOption[] = Object.values(DepartmentEnum).map((department) => ({
  label: humanize(department),
  value: department,
}));

const routeOptions: IOption[] = [{ label: 'Finish visit (no transfer)', value: '' }, ...departmentOptions];

interface ConsultationFormValues {
  patientId: string;
  type: string;
  department: string;
  chiefComplaint: string;
  historyOfPresentIllness: string;
  examinationFindings: string;
  assessment: string;
  diagnosis: string;
  icd10Codes: string;
  plan: string;
  notes: string;
  followUpDate: string;
}

const emptyForm: ConsultationFormValues = {
  patientId: '',
  type: ConsultationTypeEnum.OUTPATIENT,
  department: DepartmentEnum.OUTPATIENT_CLINIC,
  chiefComplaint: '',
  historyOfPresentIllness: '',
  examinationFindings: '',
  assessment: '',
  diagnosis: '',
  icd10Codes: '',
  plan: '',
  notes: '',
  followUpDate: '',
};

const schema = Yup.object({
  patientId: Yup.string().required('Patient is required'),
  chiefComplaint: Yup.string().required('Chief complaint is required'),
});

const patientName = (consultation: IConsultation) => {
  const patient = consultation.patient;
  return patient ? [patient.firstName, patient.lastName].filter(Boolean).join(' ') : 'Unknown patient';
};

function ConsultationWorkspace() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const prefillPatientId = searchParams.get('patientId') ?? '';
  const prefillVisitId = searchParams.get('visitId') ?? undefined;
  const prefillTriageId = searchParams.get('triageId') ?? undefined;

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<IOption>(statusFilterOptions[0]);
  const [createOpen, setCreateOpen] = useState(Boolean(prefillPatientId));
  const [completing, setCompleting] = useState<IConsultation | null>(null);
  const [routeTo, setRouteTo] = useState<IOption>(routeOptions[0]);
  const [completeNotes, setCompleteNotes] = useState('');
  const [busy, setBusy] = useState(false);

  const { consultations, total, isLoading, createConsultation, completeConsultation, cancelConsultation } =
    useConsultations({
      q: search.trim() || undefined,
      status: status.value === 'all' ? undefined : (status.value as ConsultationStatusEnum),
      limit: 100,
    });

  const { patients } = usePatients({ limit: 100 });
  const patientOptions = useMemo<IOption[]>(
    () => patients.map((patient) => ({ label: `${patient.firstName} ${patient.lastName}`, value: patient.id })),
    [patients],
  );

  const stats = useMemo(
    () => [
      { label: 'Total consultations', value: total, icon: FaClipboardList, variant: StatVariantEnum.Green },
      {
        label: 'In progress',
        value: consultations.filter((c) => c.status === ConsultationStatusEnum.IN_PROGRESS).length,
        icon: FaStethoscope,
        variant: StatVariantEnum.Blue,
      },
      {
        label: 'Completed',
        value: consultations.filter((c) => c.status === ConsultationStatusEnum.COMPLETED).length,
        icon: FaCheckCircle,
        variant: StatVariantEnum.Emerald,
      },
    ],
    [consultations, total],
  );

  const initialValues: ConsultationFormValues = { ...emptyForm, patientId: prefillPatientId || emptyForm.patientId };

  const handleCreate = async (values: ConsultationFormValues) => {
    const payload: ICreateConsultationDto = {
      patientId: values.patientId,
      visitId: prefillVisitId,
      triageId: prefillTriageId,
      type: values.type as ConsultationTypeEnum,
      department: values.department as DepartmentEnum,
      chiefComplaint: values.chiefComplaint.trim(),
      historyOfPresentIllness: values.historyOfPresentIllness.trim() || undefined,
      examinationFindings: values.examinationFindings.trim() || undefined,
      assessment: values.assessment.trim() || undefined,
      diagnosis: values.diagnosis.trim() || undefined,
      icd10Codes: values.icd10Codes.trim() || undefined,
      plan: values.plan.trim() || undefined,
      notes: values.notes.trim() || undefined,
      followUpDate: values.followUpDate || undefined,
    };
    try {
      await createConsultation(payload);
      setCreateOpen(false);
      if (prefillPatientId) router.replace('/consultation');
    } catch {
      window.alert('Failed to start consultation. Please try again.');
    }
  };

  const openComplete = (consultation: IConsultation) => {
    setCompleting(consultation);
    setRouteTo(routeOptions[0]);
    setCompleteNotes('');
  };

  const handleComplete = async () => {
    if (!completing) return;
    setBusy(true);
    try {
      await completeConsultation(completing.id, {
        nextDepartment: routeTo.value ? (routeTo.value as DepartmentEnum) : undefined,
        notes: completeNotes.trim() || undefined,
      });
      setCompleting(null);
    } catch {
      window.alert('Failed to complete consultation. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const handleCancel = async (consultation: IConsultation) => {
    if (!window.confirm('Cancel this consultation?')) return;
    try {
      await cancelConsultation(consultation.id);
    } catch {
      window.alert('Failed to cancel consultation.');
    }
  };

  return (
    <div className="flex flex-col gap-8 py-4">
      <PageHeader
        title="Consultations"
        description="Document clinical encounters, then complete and route patients onward."
        actions={
          <Button type="button" variant={ButtonVariantEnum.PRIMARY} onClick={() => setCreateOpen(true)}>
            <FaPlus className="text-base" />
            <span className="font-semibold">New consultation</span>
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
            placeholder="Search complaint, diagnosis or patient"
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
                <th className="px-6 py-3 text-md font-bold">Chief complaint</th>
                <th className="px-6 py-3 text-md font-bold">Type</th>
                <th className="px-6 py-3 text-md font-bold">Status</th>
                <th className="px-6 py-3 text-md font-bold">Started</th>
                <th className="px-6 py-3 text-right text-md font-bold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center text-sm text-zinc-500">
                    Loading consultations…
                  </td>
                </tr>
              ) : consultations.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-0">
                    <div className="flex h-64 w-full items-center justify-center">
                      <EmptyState message="No consultations found" icon={FaStethoscope} />
                    </div>
                  </td>
                </tr>
              ) : (
                consultations.map((consultation) => (
                  <tr
                    key={consultation.id}
                    className="border-b border-zinc-100 last:border-0 transition hover:bg-green-50/30"
                  >
                    <td className="px-6 py-4 font-medium text-zinc-900">{patientName(consultation)}</td>
                    <td className="px-6 py-4 text-zinc-700">{consultation.chiefComplaint}</td>
                    <td className="px-6 py-4 capitalize text-zinc-600">{humanize(consultation.type)}</td>
                    <td className="px-6 py-4">
                      <Pill variant={statusVariants[consultation.status]}>{humanize(consultation.status)}</Pill>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-zinc-500">
                      {formatDistanceToNow(new Date(consultation.startedAt), { addSuffix: true })}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        {consultation.status === ConsultationStatusEnum.IN_PROGRESS ? (
                          <>
                            <Button type="button" onClick={() => openComplete(consultation)}>
                              Complete & route
                            </Button>
                            <Button
                              type="button"
                              variant={ButtonVariantEnum.DANGER}
                              onClick={() => handleCancel(consultation)}
                            >
                              Cancel
                            </Button>
                          </>
                        ) : (
                          <span className="text-xs text-zinc-400">
                            {consultation.completedAt
                              ? format(new Date(consultation.completedAt), 'dd MMM · HH:mm')
                              : '—'}
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Drawer open={createOpen} onClose={() => setCreateOpen(false)} title="New consultation" width="w-150">
        <Form
          initialValues={initialValues}
          validationSchema={schema}
          onSubmit={handleCreate}
          className="flex h-full flex-col gap-6"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <FormDropdown name="patientId" label="Patient" options={patientOptions} placeholder="Select patient" />
            </div>
            <FormDropdown name="type" label="Type" options={typeOptions} placeholder="Select type" />
            <FormDropdown name="department" label="Department" options={departmentOptions} placeholder="Department" />
            <div className="sm:col-span-2">
              <FormInput name="chiefComplaint" label="Chief complaint" placeholder="Presenting complaint" required />
            </div>
            <div className="sm:col-span-2">
              <FormInput name="historyOfPresentIllness" label="History of present illness" placeholder="Optional" />
            </div>
            <div className="sm:col-span-2">
              <FormInput name="examinationFindings" label="Examination findings" placeholder="Optional" />
            </div>
            <FormInput name="assessment" label="Assessment" placeholder="Optional" />
            <FormInput name="diagnosis" label="Diagnosis" placeholder="Optional" />
            <FormInput name="icd10Codes" label="ICD-10 codes" placeholder="Comma separated" />
            <FormInput name="followUpDate" label="Follow-up date" type="date" />
            <div className="sm:col-span-2">
              <FormInput name="plan" label="Plan" placeholder="Treatment / next steps" />
            </div>
            <div className="sm:col-span-2">
              <FormInput name="notes" label="Notes" placeholder="Optional" />
            </div>
          </div>

          <div className="mt-auto flex justify-end gap-3 border-t border-zinc-100 pt-5">
            <Button type="button" variant={ButtonVariantEnum.DANGER} onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" className="px-6 py-2 font-semibold">
              Start consultation
            </Button>
          </div>
        </Form>
      </Drawer>

      <Drawer open={completing !== null} onClose={() => setCompleting(null)} title="Complete & route patient">
        <div className="flex flex-col gap-5">
          <p className="text-sm text-slate-600">
            Completing <span className="font-semibold text-slate-900">{completing ? patientName(completing) : ''}</span>
            &rsquo;s consultation. Choose where to send the patient next.
          </p>
          <Dropdown
            label="Route to"
            options={routeOptions}
            value={routeTo}
            onChange={(value) => setRouteTo((Array.isArray(value) ? value[0] : value) ?? routeOptions[0])}
          />
          <Input
            label="Handover notes"
            value={completeNotes}
            onChange={(e) => setCompleteNotes(e.target.value)}
            placeholder="Optional notes for the next department"
          />
          <div className="flex justify-end gap-3 border-t border-zinc-100 pt-5">
            <Button type="button" variant={ButtonVariantEnum.DANGER} onClick={() => setCompleting(null)}>
              Cancel
            </Button>
            <Button type="button" loading={busy} onClick={handleComplete}>
              Complete consultation
            </Button>
          </div>
        </div>
      </Drawer>
    </div>
  );
}

export default function ConsultationPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-sm text-slate-500">Loading…</div>}>
      <ConsultationWorkspace />
    </Suspense>
  );
}
