'use client';

import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { FaFlask, FaHeartbeat, FaHistory, FaPills, FaPlus, FaStethoscope, FaTrash } from 'react-icons/fa';
import { formatDistanceToNow } from 'date-fns';
import { Button, Drawer, Dropdown, Input, Pill } from '@/components';
import {
  ButtonVariantEnum,
  ConsultationTypeEnum,
  DepartmentEnum,
  LabOrderItemStatusEnum,
  LabPriorityEnum,
  ModalDrawerModeEnum,
  PillVariantEnum,
  TriageAcuityEnum,
} from '@/enum';
import {
  useConsultationsByPatient,
  useLabOrdersByConsultation,
  useLabOrdersByPatient,
  useLabTests,
  useTriageByPatient,
} from '@/hooks';
import { labOrdersService } from '@/helpers/lab.service';
import pharmacyService from '@/helpers/pharmacy.service';
import { useSWRConfig } from 'swr';
import type {
  IConsultation,
  ICreateConsultationDto,
  ILabOrder,
  IOption,
  IPatient,
  ITriage,
  IUpdateConsultationDto,
} from '@/interfaces';

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

type FormState = typeof emptyValues;

interface ConsultationDrawerProps {
  mode: ModalDrawerModeEnum | null;
  consultation: IConsultation | null;
  patients: IPatient[];
  onClose: () => void;
  onSave: (payload: ICreateConsultationDto | IUpdateConsultationDto, id?: string) => Promise<IConsultation | void>;
  prefillPatient?: IPatient | null;
  prefillPatientId?: string | null;
  prefillVisitId?: string | null;
}

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

export default function ConsultationDrawer({
  mode,
  consultation,
  patients,
  onClose,
  onSave,
  prefillPatient,
  prefillPatientId,
  prefillVisitId,
}: ConsultationDrawerProps) {
  const open = mode !== null;
  const isEdit = mode === ModalDrawerModeEnum.EDIT;
  const [values, setValues] = useState<FormState>(emptyValues);
  const [busy, setBusy] = useState(false);
  const [savedConsultation, setSavedConsultation] = useState<IConsultation | null>(null);
  const { mutate: globalMutate } = useSWRConfig();

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
    if (prefillPatient) push(prefillPatient);
    if (isEdit && consultation?.patient) push(consultation.patient);
    patients.forEach(push);
    return options;
  }, [patients, prefillPatient, isEdit, consultation?.patient]);

  useEffect(() => {
    if (!open) return;
    setSavedConsultation(consultation ?? null);
    if (isEdit && consultation) {
      setValues({
        patientId: consultation.patientId,
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
    } else {
      setValues({
        ...emptyValues,
        patientId: prefillPatient?.id ?? prefillPatientId ?? '',
      });
    }
  }, [consultation, isEdit, open, prefillPatient, prefillPatientId]);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => setValues((s) => ({ ...s, [key]: value }));

  const submit = async () => {
    if (!values.patientId || !values.chiefComplaint.trim()) {
      toast.error('Patient and chief complaint are required');
      return;
    }
    setBusy(true);
    try {
      const payload: ICreateConsultationDto | IUpdateConsultationDto = {
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
      const result = await onSave(payload, consultation?.id);
      if (result) setSavedConsultation(result);
    } finally {
      setBusy(false);
    }
  };

  const canOrderExtras = Boolean(savedConsultation?.id);

  return (
    <Drawer open={open} onClose={onClose} title={isEdit ? 'Edit consultation' : 'New consultation'} width="w-[900px]">
      <form
        className="flex flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <div className="grid grid-cols-2 gap-3">
          <Dropdown
            label="Patient"
            options={patientOptions}
            value={patientOptions.find((o) => o.value === values.patientId) ?? null}
            onChange={(o) => set('patientId', (o as IOption).value as string)}
            isDisabled={isEdit || Boolean(savedConsultation)}
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

        <div className="mt-1 flex justify-end gap-2">
          <Button type="button" variant={ButtonVariantEnum.GHOST} onClick={onClose}>
            Close
          </Button>
          <Button type="submit" variant={ButtonVariantEnum.PRIMARY} loading={busy}>
            {savedConsultation ? 'Save changes' : 'Create consultation'}
          </Button>
        </div>
      </form>

      {canOrderExtras && savedConsultation && (
        <div className="mt-6 flex flex-col gap-6 border-t border-line pt-6">
          <LabOrdersPanel
            consultation={savedConsultation}
            onChanged={() => globalMutate((key) => typeof key === 'string' && key.startsWith('/lab'))}
          />
          <PrescriptionsPanel
            consultation={savedConsultation}
            onChanged={() => globalMutate((key) => typeof key === 'string' && key.startsWith('/pharmacy'))}
          />
        </div>
      )}
    </Drawer>
  );
}

function LabOrdersPanel({ consultation, onChanged }: { consultation: IConsultation; onChanged: () => void }) {
  const { orders, mutate } = useLabOrdersByConsultation(consultation.id);
  const { tests } = useLabTests({ limit: 100, isActive: true });
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [priority, setPriority] = useState<LabPriorityEnum>(LabPriorityEnum.ROUTINE);
  const [notes, setNotes] = useState('');
  const [busy, setBusy] = useState(false);

  const testOptions: IOption[] = tests.map((t) => ({ label: `${t.code} — ${t.name}`, value: t.id }));

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
          error: "Couldn't order — retry",
        },
      );
      setSelectedIds([]);
      setNotes('');
      await mutate();
      onChanged();
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="flex flex-col gap-3">
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
          {testOptions.map((o) => {
            const active = selectedIds.includes(o.value as string);
            return (
              <button
                key={o.value}
                type="button"
                onClick={() => toggle(o.value as string)}
                className={`rounded-full px-2.5 py-1 text-xs ring-1 transition ${
                  active
                    ? 'bg-brand text-white ring-brand'
                    : 'bg-surface text-ink-muted ring-line hover:bg-surface-raised'
                }`}
              >
                {o.label}
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

function PrescriptionsPanel({ consultation, onChanged }: { consultation: IConsultation; onChanged: () => void }) {
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<
    Array<{ itemId: string; name: string; dosage: string; frequency: string; duration: string; quantity: string }>
  >([]);
  const [busy, setBusy] = useState(false);
  const [drug, setDrug] = useState('');

  const addRow = () => {
    if (!drug.trim()) return;
    setItems((s) => [...s, { itemId: '', name: drug.trim(), dosage: '', frequency: '', duration: '', quantity: '1' }]);
    setDrug('');
  };

  const removeRow = (idx: number) => setItems((s) => s.filter((_, i) => i !== idx));

  const setRow = (idx: number, key: string, value: string) =>
    setItems((s) => s.map((r, i) => (i === idx ? { ...r, [key]: value } : r)));

  const submit = async () => {
    const filled = items.filter((i) => i.itemId && i.dosage && i.frequency && i.quantity);
    if (filled.length === 0) {
      toast.error('Add at least one prescription item with itemId, dosage and quantity');
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
          error: "Couldn't create — retry",
        },
      );
      setItems([]);
      setNotes('');
      onChanged();
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <FaPills className="text-brand" />
        <h3 className="text-sm font-semibold text-ink">Prescriptions</h3>
      </div>

      <div className="rounded-md border border-line p-3">
        <div className="flex gap-2">
          <Input
            label="Add item (inventory item UUID or name)"
            value={drug}
            onChange={(e) => setDrug(e.target.value)}
            placeholder="Paste inventory item id"
          />
          <div className="self-end">
            <Button type="button" variant={ButtonVariantEnum.SECONDARY} onClick={addRow}>
              Add
            </Button>
          </div>
        </div>

        {items.length > 0 && (
          <div className="mt-3 flex flex-col gap-2">
            {items.map((row, idx) => (
              <div key={idx} className="grid grid-cols-12 items-end gap-2">
                <div className="col-span-3">
                  <Input label="Item ID" value={row.itemId} onChange={(e) => setRow(idx, 'itemId', e.target.value)} />
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
                <div className="col-span-2">
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

        <div className="mt-3">
          <Input label="Notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>

        <div className="mt-3 flex justify-end">
          <Button type="button" variant={ButtonVariantEnum.PRIMARY} loading={busy} onClick={submit}>
            <FaPlus className="text-xs" />
            Prescribe
          </Button>
        </div>
      </div>
    </section>
  );
}
