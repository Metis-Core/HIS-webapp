'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { FaArrowLeft, FaBan, FaCheckCircle, FaFlask, FaPills, FaPlus, FaTrash } from 'react-icons/fa';
import { useSWRConfig } from 'swr';
import { Button, Dropdown, Input, PageHeader, Pill } from '@/components';
import CompleteStageDrawer from '@/components/drawers/complete-stage.drawer';
import PatientContextPanel from '@/components/consultation/patient-context.panel';
import {
  ButtonVariantEnum,
  ConsultationStatusEnum,
  ConsultationTypeEnum,
  DepartmentEnum,
  LabPriorityEnum,
  PillVariantEnum,
  VisitIntentEnum,
} from '@/enum';
import { extractErrorMessage } from '@/helpers/errors';
import { labOrdersService } from '@/helpers/lab.service';
import pharmacyService from '@/helpers/pharmacy.service';
import { useConsultation, useConsultations, useInventoryItems, useLabOrdersByConsultation, useLabTests } from '@/hooks';
import type { IOption, IUpdateConsultationDto } from '@/interfaces';

const typeOptions: IOption[] = Object.values(ConsultationTypeEnum).map((v) => ({
  label: v.replaceAll('_', ' '),
  value: v,
}));

const departmentOptions: IOption[] = Object.values(DepartmentEnum).map((v) => ({
  label: v.replaceAll('_', ' '),
  value: v,
}));

const priorityOptions: IOption[] = Object.values(LabPriorityEnum).map((v) => ({
  label: v,
  value: v,
}));

const statusVariant: Record<ConsultationStatusEnum, PillVariantEnum> = {
  [ConsultationStatusEnum.IN_PROGRESS]: PillVariantEnum.INFO,
  [ConsultationStatusEnum.COMPLETED]: PillVariantEnum.SUCCESS,
  [ConsultationStatusEnum.CANCELLED]: PillVariantEnum.DEFAULT,
};

export default function ConsultationDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { mutate: globalMutate } = useSWRConfig();

  const { consultation, isLoading, mutate } = useConsultation(params.id);
  const { updateConsultation, completeConsultation, cancelConsultation } = useConsultations({ limit: 20 });

  const [values, setValues] = useState({
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
  });
  const [savingForm, setSavingForm] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [completingBusy, setCompletingBusy] = useState(false);

  useEffect(() => {
    if (!consultation) return;
    setValues({
      chiefComplaint: consultation.chiefComplaint,
      type: consultation.type,
      department: consultation.department,
      historyOfPresentIllness: consultation.historyOfPresentIllness ?? '',
      examinationFindings: consultation.examinationFindings ?? '',
      assessment: consultation.assessment ?? '',
      diagnosis: consultation.diagnosis ?? '',
      icd10Codes: consultation.icd10Codes ?? '',
      plan: consultation.plan ?? '',
      notes: consultation.notes ?? '',
    });
  }, [consultation]);

  const invalidateAll = () =>
    globalMutate(
      (key) =>
        typeof key === 'string' &&
        (key.startsWith('/consultations') || key.startsWith('/lab') || key.startsWith('/pharmacy')),
    );

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        <div className="h-6 w-64 rounded bg-line/60" />
        <div className="h-40 rounded-lg border border-line bg-surface-raised" />
      </div>
    );
  }

  if (!consultation) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <p className="text-sm text-ink-muted">Consultation not found</p>
        <Button type="button" variant={ButtonVariantEnum.PRIMARY} onClick={() => router.push('/consultations')}>
          Back to consultations
        </Button>
      </div>
    );
  }

  const readOnly = consultation.status !== ConsultationStatusEnum.IN_PROGRESS;

  const set = <K extends keyof typeof values>(key: K, value: (typeof values)[K]) =>
    setValues((s) => ({ ...s, [key]: value }));

  const saveForm = async () => {
    if (!values.chiefComplaint.trim()) {
      toast.error('Chief complaint is required');
      return;
    }
    setSavingForm(true);
    try {
      const payload: IUpdateConsultationDto = {
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
      await toast.promise(updateConsultation(consultation.id, payload), {
        loading: 'Saving…',
        success: 'Consultation saved',
        error: (err) => extractErrorMessage(err, "Couldn't save — retry"),
      });
      await mutate();
    } finally {
      setSavingForm(false);
    }
  };

  const confirmComplete = async ({ nextIntents, notes }: { nextIntents: VisitIntentEnum[]; notes?: string }) => {
    setCompletingBusy(true);
    try {
      await toast.promise(completeConsultation(consultation.id, { nextIntents, notes }), {
        loading: 'Completing…',
        success: nextIntents.length > 0 ? `Completed — routed to ${nextIntents.join(', ')}` : 'Consultation completed',
        error: (err) => extractErrorMessage(err, "Couldn't complete — retry"),
      });
      setCompleting(false);
      await mutate();
      await invalidateAll();
    } finally {
      setCompletingBusy(false);
    }
  };

  const cancel = async () => {
    if (!confirm('Cancel this consultation?')) return;
    await toast.promise(cancelConsultation(consultation.id, {}), {
      loading: 'Cancelling…',
      success: 'Consultation cancelled',
      error: (err) => extractErrorMessage(err, "Couldn't cancel — retry"),
    });
    await mutate();
    await invalidateAll();
  };

  const patientName = consultation.patient
    ? `${consultation.patient.firstName} ${consultation.patient.lastName}`
    : 'Consultation';

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
        title={patientName}
        description={`${consultation.chiefComplaint} · ${consultation.type.replaceAll('_', ' ')} · ${format(new Date(consultation.createdAt), 'dd MMM yyyy')}`}
        action={
          <div className="flex items-center gap-2">
            <Pill variant={statusVariant[consultation.status] ?? PillVariantEnum.DEFAULT}>
              {consultation.status.replaceAll('_', ' ')}
            </Pill>
            {consultation.status === ConsultationStatusEnum.IN_PROGRESS && (
              <>
                <Button type="button" variant={ButtonVariantEnum.SECONDARY} onClick={cancel}>
                  <FaBan className="text-xs" />
                  Cancel visit
                </Button>
                <Button type="button" variant={ButtonVariantEnum.PRIMARY} onClick={() => setCompleting(true)}>
                  <FaCheckCircle className="text-xs" />
                  Complete &amp; route
                </Button>
              </>
            )}
          </div>
        }
      />

      <div className="grid gap-5 lg:grid-cols-12">
        <div className="flex flex-col gap-4 lg:col-span-7">
          <section className="flex flex-col gap-4 rounded-lg border border-line bg-surface-raised p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-ink">Encounter</h2>
              {!readOnly && (
                <Button type="button" variant={ButtonVariantEnum.PRIMARY} onClick={saveForm} loading={savingForm}>
                  Save
                </Button>
              )}
            </div>

            <Input
              label="Chief complaint"
              required
              disabled={readOnly}
              value={values.chiefComplaint}
              onChange={(e) => set('chiefComplaint', e.target.value)}
            />

            <div className="grid grid-cols-2 gap-3">
              <Dropdown
                label="Type"
                options={typeOptions}
                value={typeOptions.find((o) => o.value === values.type) ?? null}
                onChange={(o) => set('type', (o as IOption).value as ConsultationTypeEnum)}
                isDisabled={readOnly}
              />
              <Dropdown
                label="Department"
                options={departmentOptions}
                value={departmentOptions.find((o) => o.value === values.department) ?? null}
                onChange={(o) => set('department', (o as IOption).value as DepartmentEnum)}
                isDisabled={readOnly}
              />
            </div>

            <Input
              label="History of present illness"
              disabled={readOnly}
              value={values.historyOfPresentIllness}
              onChange={(e) => set('historyOfPresentIllness', e.target.value)}
            />
            <Input
              label="Examination findings"
              disabled={readOnly}
              value={values.examinationFindings}
              onChange={(e) => set('examinationFindings', e.target.value)}
            />

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Assessment"
                disabled={readOnly}
                value={values.assessment}
                onChange={(e) => set('assessment', e.target.value)}
              />
              <Input
                label="Diagnosis"
                disabled={readOnly}
                value={values.diagnosis}
                onChange={(e) => set('diagnosis', e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="ICD-10 codes"
                disabled={readOnly}
                value={values.icd10Codes}
                onChange={(e) => set('icd10Codes', e.target.value)}
              />
              <Input
                label="Plan"
                disabled={readOnly}
                value={values.plan}
                onChange={(e) => set('plan', e.target.value)}
              />
            </div>
            <Input
              label="Notes"
              disabled={readOnly}
              value={values.notes}
              onChange={(e) => set('notes', e.target.value)}
            />
          </section>

          {!readOnly && <LabOrdersPanel consultation={consultation} />}
          {!readOnly && <PrescriptionsPanel consultation={consultation} />}
        </div>

        <aside className="flex flex-col gap-4 lg:col-span-5">
          <PatientContextPanel
            patient={consultation.patient ?? null}
            visitId={consultation.visitId ?? null}
            consultationId={consultation.id}
          />
        </aside>
      </div>

      <CompleteStageDrawer
        open={completing}
        title="Complete consultation & route"
        patientName={patientName}
        onClose={() => setCompleting(false)}
        onConfirm={confirmComplete}
        submitting={completingBusy}
      />
    </div>
  );
}

function LabOrdersPanel({
  consultation,
}: {
  consultation: NonNullable<ReturnType<typeof useConsultation>['consultation']>;
}) {
  const { orders, mutate } = useLabOrdersByConsultation(consultation.id);
  const { tests } = useLabTests({ limit: 200, isActive: true });
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [priority, setPriority] = useState<LabPriorityEnum>(LabPriorityEnum.ROUTINE);
  const [notes, setNotes] = useState('');
  const [busy, setBusy] = useState(false);

  const toggle = (id: string) => setSelectedIds((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  const submit = async () => {
    if (selectedIds.length === 0) {
      toast.error('Select at least one test');
      return;
    }
    setBusy(true);
    try {
      await toast.promise(
        labOrdersService.create({
          patientId: consultation.patientId,
          consultationId: consultation.id,
          visitId: consultation.visitId ?? undefined,
          priority,
          clinicalNotes: notes.trim() || undefined,
          items: selectedIds.map((testId) => ({ testId })),
        }),
        {
          loading: 'Ordering tests…',
          success: 'Lab tests ordered',
          error: (err) => extractErrorMessage(err, "Couldn't order — retry"),
        },
      );
      setSelectedIds([]);
      setNotes('');
      await mutate();
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="flex flex-col gap-3 rounded-lg border border-line bg-surface-raised p-5">
      <div className="flex items-center gap-2">
        <FaFlask className="text-brand" />
        <h3 className="text-sm font-semibold text-ink">Lab orders</h3>
      </div>

      {orders.length > 0 && (
        <ul className="flex flex-col divide-y divide-line rounded-md border border-line">
          {orders.map((o) => (
            <li key={o.id} className="flex items-center justify-between px-3 py-2 text-sm">
              <span className="text-ink">{o.items?.map((i) => i.test?.code).join(', ') || 'Tests'}</span>
              <span className="text-xs text-ink-muted capitalize">
                {o.status.replaceAll('_', ' ')} · {o.priority}
              </span>
            </li>
          ))}
        </ul>
      )}

      <div className="rounded-md border border-line p-3">
        <p className="mb-2 text-xs font-medium text-ink-muted">Order new tests</p>
        <div className="flex flex-wrap gap-1.5">
          {tests.map((t) => {
            const active = selectedIds.includes(t.id);
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => toggle(t.id)}
                className={`rounded-full px-2.5 py-1 text-xs ring-1 transition ${
                  active
                    ? 'bg-brand text-white ring-brand'
                    : 'bg-surface text-ink-muted ring-line hover:bg-surface-raised'
                }`}
              >
                {t.code} — {t.name}
              </button>
            );
          })}
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <Dropdown
            label="Priority"
            options={priorityOptions}
            value={priorityOptions.find((o) => o.value === priority) ?? null}
            onChange={(o) => setPriority((o as IOption).value as LabPriorityEnum)}
          />
          <Input label="Clinical notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>
        <div className="mt-3 flex justify-end">
          <Button type="button" variant={ButtonVariantEnum.PRIMARY} loading={busy} onClick={submit}>
            <FaPlus className="text-xs" />
            Order tests
          </Button>
        </div>
      </div>
    </section>
  );
}

function PrescriptionsPanel({
  consultation,
}: {
  consultation: NonNullable<ReturnType<typeof useConsultation>['consultation']>;
}) {
  const { items: inventoryItems } = useInventoryItems({ limit: 200, isActive: true });
  const [rows, setRows] = useState<
    Array<{ itemId: string; dosage: string; frequency: string; duration: string; quantity: string }>
  >([]);
  const [notes, setNotes] = useState('');
  const [busy, setBusy] = useState(false);

  const itemOptions: IOption[] = inventoryItems.map((i) => ({
    label: `${i.sku} — ${i.name}`,
    value: i.id,
  }));

  const addRow = () => setRows((s) => [...s, { itemId: '', dosage: '', frequency: '', duration: '', quantity: '1' }]);

  const removeRow = (idx: number) => setRows((s) => s.filter((_, i) => i !== idx));

  const setRow = (idx: number, key: string, value: string) =>
    setRows((s) => s.map((r, i) => (i === idx ? { ...r, [key]: value } : r)));

  const submit = async () => {
    const filled = rows.filter((r) => r.itemId && r.dosage && r.frequency && r.quantity);
    if (filled.length === 0) {
      toast.error('Add at least one prescription item');
      return;
    }
    setBusy(true);
    try {
      await toast.promise(
        pharmacyService.create({
          patientId: consultation.patientId,
          consultationId: consultation.id,
          notes: notes.trim() || undefined,
          items: filled.map((r) => ({
            itemId: r.itemId,
            dosage: r.dosage,
            frequency: r.frequency,
            duration: r.duration || undefined,
            quantity: Number(r.quantity),
          })),
        }),
        {
          loading: 'Creating prescription…',
          success: 'Prescription created',
          error: (err) => extractErrorMessage(err, "Couldn't create — retry"),
        },
      );
      setRows([]);
      setNotes('');
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="flex flex-col gap-3 rounded-lg border border-line bg-surface-raised p-5">
      <div className="flex items-center gap-2">
        <FaPills className="text-brand" />
        <h3 className="text-sm font-semibold text-ink">Prescriptions</h3>
      </div>

      <div className="rounded-md border border-line p-3">
        {rows.length === 0 ? (
          <p className="text-xs text-ink-muted">No items yet. Click "Add item" to prescribe.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {rows.map((row, idx) => (
              <div key={idx} className="grid grid-cols-12 items-end gap-2">
                <div className="col-span-4">
                  <Dropdown
                    label="Item"
                    options={itemOptions}
                    value={itemOptions.find((o) => o.value === row.itemId) ?? null}
                    onChange={(o) => setRow(idx, 'itemId', (o as IOption).value as string)}
                  />
                </div>
                <div className="col-span-2">
                  <Input
                    label="Dosage"
                    value={row.dosage}
                    onChange={(e) => setRow(idx, 'dosage', e.target.value)}
                    placeholder="500mg"
                  />
                </div>
                <div className="col-span-2">
                  <Input
                    label="Frequency"
                    value={row.frequency}
                    onChange={(e) => setRow(idx, 'frequency', e.target.value)}
                    placeholder="TDS"
                  />
                </div>
                <div className="col-span-2">
                  <Input
                    label="Duration"
                    value={row.duration}
                    onChange={(e) => setRow(idx, 'duration', e.target.value)}
                    placeholder="5 days"
                  />
                </div>
                <div className="col-span-1">
                  <Input
                    label="Qty"
                    type="number"
                    value={row.quantity}
                    onChange={(e) => setRow(idx, 'quantity', e.target.value)}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeRow(idx)}
                  className="col-span-1 mb-1 text-critical hover:opacity-80"
                  aria-label="Remove"
                >
                  <FaTrash className="text-sm" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
          <div className="min-w-[240px] flex-1">
            <Input label="Notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
          <div className="flex gap-2">
            <Button type="button" variant={ButtonVariantEnum.SECONDARY} onClick={addRow}>
              <FaPlus className="text-xs" />
              Add item
            </Button>
            <Button
              type="button"
              variant={ButtonVariantEnum.PRIMARY}
              loading={busy}
              onClick={submit}
              disabled={rows.length === 0}
            >
              Prescribe
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
