'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { FaArrowLeft, FaStethoscope } from 'react-icons/fa';
import useSWR from 'swr';
import { Button, Dropdown, Input, PageHeader, Pill } from '@/components';
import PatientContextPanel from '@/components/consultation/patient-context.panel';
import { ButtonVariantEnum, ConsultationTypeEnum, DepartmentEnum, PillVariantEnum } from '@/enum';
import { extractErrorMessage } from '@/helpers/errors';
import { api } from '@/helpers/axios';
import { useConsultations, usePatients } from '@/hooks';
import type { ICreateConsultationDto, IOption, IPatient } from '@/interfaces';

const typeOptions: IOption[] = Object.values(ConsultationTypeEnum).map((v) => ({
  label: v.replaceAll('_', ' '),
  value: v,
}));

const departmentOptions: IOption[] = Object.values(DepartmentEnum).map((v) => ({
  label: v.replaceAll('_', ' '),
  value: v,
}));

const emptyValues = {
  patientId: '',
  chiefComplaint: '',
  type: ConsultationTypeEnum.OUTPATIENT,
  department: DepartmentEnum.OUTPATIENT_CLINIC,
  historyOfPresentIllness: '',
  examinationFindings: '',
  assessment: '',
  diagnosis: '',
  icd10Codes: '',
  plan: '',
  notes: '',
};

export default function NewConsultationPage() {
  const router = useRouter();
  const params = useSearchParams();
  const prefillPatientId = params.get('patientId');
  const prefillVisitId = params.get('visitId');

  const [values, setValues] = useState(emptyValues);
  const [busy, setBusy] = useState(false);

  const { patients } = usePatients({ limit: 100 });
  const { createConsultation } = useConsultations({ limit: 20 });

  const { data: singlePatient } = useSWR<{ data: { data: IPatient } }>(
    prefillPatientId && !patients.some((p) => p.id === prefillPatientId) ? `/patients/${prefillPatientId}` : null,
    api,
  );

  const patientOptions: IOption[] = useMemo(() => {
    const seen = new Set<string>();
    const options: IOption[] = [];
    const push = (p: IPatient) => {
      if (seen.has(p.id)) return;
      seen.add(p.id);
      options.push({
        label: `${p.firstName} ${p.lastName}${p.mrn ? ` (${p.mrn})` : ''}`,
        value: p.id,
      });
    };
    if (singlePatient?.data.data) push(singlePatient.data.data);
    patients.forEach(push);
    return options;
  }, [patients, singlePatient]);

  useEffect(() => {
    if (prefillPatientId) setValues((s) => ({ ...s, patientId: prefillPatientId }));
  }, [prefillPatientId]);

  const currentPatient = patients.find((p) => p.id === values.patientId) ?? singlePatient?.data.data ?? null;

  const set = <K extends keyof typeof values>(key: K, value: (typeof values)[K]) =>
    setValues((s) => ({ ...s, [key]: value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!values.patientId || !values.chiefComplaint.trim()) {
      toast.error('Patient and chief complaint are required');
      return;
    }
    setBusy(true);
    try {
      const payload: ICreateConsultationDto = {
        patientId: values.patientId,
        visitId: prefillVisitId ?? undefined,
        chiefComplaint: values.chiefComplaint.trim(),
        type: values.type,
        department: values.department,
        historyOfPresentIllness: values.historyOfPresentIllness.trim() || undefined,
        examinationFindings: values.examinationFindings.trim() || undefined,
        assessment: values.assessment.trim() || undefined,
        diagnosis: values.diagnosis.trim() || undefined,
        icd10Codes: values.icd10Codes.trim() || undefined,
        plan: values.plan.trim() || undefined,
        notes: values.notes.trim() || undefined,
      };
      const consultation = await toast.promise(createConsultation(payload), {
        loading: 'Creating consultation…',
        success: 'Consultation created',
        error: (err) => extractErrorMessage(err, "Couldn't create — retry"),
      });
      const id = (consultation as { id?: string } | undefined)?.id;
      if (id) router.replace(`/consultations/${id}`);
      else router.replace('/consultations');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <Link
        href="/consultations"
        className="inline-flex w-fit items-center gap-2 text-xs font-medium text-ink-muted hover:text-ink"
      >
        <FaArrowLeft className="text-[10px]" />
        Back to consultations
      </Link>

      <PageHeader
        title="New consultation"
        description="Document the visit — chief complaint, exam findings, assessment, diagnosis, plan."
        action={prefillVisitId ? <Pill variant={PillVariantEnum.INFO}>Linked to visit queue</Pill> : undefined}
      />

      <div className="grid gap-5 lg:grid-cols-12">
        <form onSubmit={submit} className="flex flex-col gap-4 lg:col-span-7">
          <section className="flex flex-col gap-4 rounded-lg border border-line bg-surface-raised p-5">
            <h2 className="text-sm font-semibold text-ink">Encounter</h2>

            <div className="grid grid-cols-2 gap-3">
              <Dropdown
                label="Patient"
                options={patientOptions}
                value={patientOptions.find((o) => o.value === values.patientId) ?? null}
                onChange={(o) => set('patientId', (o as IOption).value as string)}
                isDisabled={Boolean(prefillPatientId)}
              />
              <Dropdown
                label="Type"
                options={typeOptions}
                value={typeOptions.find((o) => o.value === values.type) ?? null}
                onChange={(o) => set('type', (o as IOption).value as ConsultationTypeEnum)}
              />
            </div>

            <Dropdown
              label="Department"
              options={departmentOptions}
              value={departmentOptions.find((o) => o.value === values.department) ?? null}
              onChange={(o) => set('department', (o as IOption).value as DepartmentEnum)}
            />

            <Input
              label="Chief complaint"
              required
              value={values.chiefComplaint}
              onChange={(e) => set('chiefComplaint', e.target.value)}
            />
          </section>

          <section className="flex flex-col gap-3 rounded-lg border border-line bg-surface-raised p-5">
            <h2 className="text-sm font-semibold text-ink">History &amp; examination</h2>
            <Input
              label="History of present illness"
              value={values.historyOfPresentIllness}
              onChange={(e) => set('historyOfPresentIllness', e.target.value)}
            />
            <Input
              label="Examination findings"
              value={values.examinationFindings}
              onChange={(e) => set('examinationFindings', e.target.value)}
            />
          </section>

          <section className="flex flex-col gap-3 rounded-lg border border-line bg-surface-raised p-5">
            <h2 className="text-sm font-semibold text-ink">Assessment &amp; plan</h2>
            <div className="grid grid-cols-2 gap-3">
              <Input label="Assessment" value={values.assessment} onChange={(e) => set('assessment', e.target.value)} />
              <Input label="Diagnosis" value={values.diagnosis} onChange={(e) => set('diagnosis', e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="ICD-10 codes"
                value={values.icd10Codes}
                onChange={(e) => set('icd10Codes', e.target.value)}
                placeholder="A00.0, B45"
              />
              <Input label="Plan" value={values.plan} onChange={(e) => set('plan', e.target.value)} />
            </div>
            <Input label="Notes" value={values.notes} onChange={(e) => set('notes', e.target.value)} />
          </section>

          <div className="flex justify-end gap-2">
            <Button type="button" variant={ButtonVariantEnum.GHOST} onClick={() => router.push('/consultations')}>
              Cancel
            </Button>
            <Button type="submit" variant={ButtonVariantEnum.PRIMARY} loading={busy}>
              <FaStethoscope className="text-xs" />
              Create consultation
            </Button>
          </div>
        </form>

        <aside className="flex flex-col gap-4 lg:col-span-5">
          <PatientContextPanel patient={currentPatient} visitId={prefillVisitId} consultationId={null} />
        </aside>
      </div>
    </div>
  );
}
