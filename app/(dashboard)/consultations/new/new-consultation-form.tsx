'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { FaArrowLeft, FaStethoscope } from 'react-icons/fa';
import { Button, Input, PageHeader, Pill } from '@/components';
import PatientContextPanel from '@/components/consultation/patient-context.panel';
import DoctorSearchSelect from '@/components/consultation/encounter/doctor-search-select';
import EncounterFields, { EncounterHeaderFields } from '@/components/consultation/encounter/encounter-fields';
import {
  EMPTY_ENCOUNTER,
  EXAM_AND_ASSESSMENT_LABEL,
  codedDiagnoses,
  type EncounterValues,
} from '@/components/consultation/encounter/encounter-values';
import PatientSearchSelect from '@/components/queue/patient-search-select';
import { ButtonVariantEnum, PillVariantEnum } from '@/enum';
import { extractErrorMessage } from '@/helpers/errors';
import { RoleGroups } from '@/helpers/role-groups';
import { useConsultations, usePatient } from '@/hooks';
import type { ICreateConsultationDto, IPatient, IUser } from '@/interfaces';
import { useAuth } from '@/providers';

const optional = (value: string) => value.trim() || undefined;

const toPayload = (v: EncounterValues, patientId: string, visitId: string | null, doctor: IUser | null) =>
  ({
    patientId,
    doctorId: doctor?.id,
    visitId: visitId ?? undefined,
    chiefComplaint: v.chiefComplaint.trim(),
    type: v.type,
    department: v.department,
    historyOfPresentIllness: optional(v.historyOfPresentIllness),
    examinationAndAssessment: optional(v.examinationAndAssessment),
    diagnosis: optional(v.diagnosis),
    diagnoses: codedDiagnoses(v.diagnoses),
    plan: optional(v.plan),
    notes: optional(v.notes),
  }) satisfies ICreateConsultationDto;

export default function NewConsultationForm() {
  const router = useRouter();
  const params = useSearchParams();
  const prefillPatientId = params.get('patientId');
  const prefillVisitId = params.get('visitId');
  const { user } = useAuth();
  const isAdmin = Boolean(user && (RoleGroups.ADMINS as readonly string[]).includes(user.role));

  const [values, setValues] = useState<EncounterValues>(EMPTY_ENCOUNTER);
  const [pickedPatient, setPickedPatient] = useState<IPatient | null>(null);
  const [doctor, setDoctor] = useState<IUser | null>(null);
  const [busy, setBusy] = useState(false);
  const { createConsultation } = useConsultations({ limit: 1 });
  // A prefilled patient is loaded by id; otherwise patients are found by server-side search.
  const { patient: prefillPatient } = usePatient(prefillPatientId);
  const patient = pickedPatient ?? (prefillPatientId ? (prefillPatient ?? null) : null);

  const set = <K extends keyof EncounterValues>(key: K, value: EncounterValues[K]) =>
    setValues((s) => ({ ...s, [key]: value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patient || !values.chiefComplaint.trim()) return void toast.error('Patient and chief complaint are required');
    if (isAdmin && !doctor) return void toast.error('Pick the doctor this consultation is for');
    setBusy(true);
    try {
      const consultation = await toast
        .promise(createConsultation(toPayload(values, patient.id, prefillVisitId, doctor)), {
          loading: 'Creating consultation…',
          success: 'Consultation created',
          error: (err) => extractErrorMessage(err, "Couldn't create — retry"),
        })
        .unwrap();
      router.replace(`/consultations/${consultation.id}`);
    } catch {
      // The toast already reported the failure.
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
        description={`Document the visit — chief complaint, ${EXAM_AND_ASSESSMENT_LABEL.toLowerCase()}, diagnoses, plan.`}
        action={prefillVisitId ? <Pill variant={PillVariantEnum.INFO}>Linked to visit queue</Pill> : undefined}
      />
      <div className="grid gap-5 lg:grid-cols-12">
        <form onSubmit={submit} className="flex flex-col gap-4 lg:col-span-7">
          <section className="flex flex-col gap-4 rounded-lg border border-line bg-surface-raised p-5">
            <h2 className="text-sm font-semibold text-ink">Encounter</h2>
            <div className="grid grid-cols-2 gap-3">
              <PatientSearchSelect value={patient} onChange={setPickedPatient} isDisabled={Boolean(prefillPatientId)} />
              {isAdmin && <DoctorSearchSelect value={doctor} onChange={setDoctor} />}
            </div>
            <EncounterHeaderFields values={values} set={set} />
            <Input
              label="Chief complaint"
              required
              value={values.chiefComplaint}
              onChange={(e) => set('chiefComplaint', e.target.value)}
            />
          </section>
          <section className="flex flex-col gap-3 rounded-lg border border-line bg-surface-raised p-5">
            <h2 className="text-sm font-semibold text-ink">History, assessment &amp; plan</h2>
            <EncounterFields values={values} set={set} />
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
          <PatientContextPanel patient={patient} visitId={prefillVisitId} consultationId={null} />
        </aside>
      </div>
    </div>
  );
}
