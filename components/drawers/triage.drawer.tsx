'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Button, Drawer, Dropdown, Input } from '@/components';
import {
  ButtonVariantEnum,
  ConsciousnessLevelEnum,
  ModalDrawerModeEnum,
  TriageAcuityEnum,
  TriageStatusEnum,
} from '@/enum';
import type { ICreateTriageDto, IOption, IPatient, ITriage, IUpdateTriageDto } from '@/interfaces';
import { usePatient } from '@/hooks';
import PatientSearchSelect from '@/components/queue/patient-search-select';

const emptyValues = {
  patientId: '',
  acuity: TriageAcuityEnum.LEVEL_3,
  status: TriageStatusEnum.WAITING,
  chiefComplaint: '',
  consciousness: ConsciousnessLevelEnum.ALERT,
  temperatureC: '',
  heartRate: '',
  respiratoryRate: '',
  bloodPressureSystolic: '',
  bloodPressureDiastolic: '',
  oxygenSaturation: '',
  weightKg: '',
  heightCm: '',
  painScore: '',
  allergiesNoted: '',
  assessmentNotes: '',
};

type FormState = typeof emptyValues;

interface TriageDrawerProps {
  mode: ModalDrawerModeEnum | null;
  triage: ITriage | null;
  prefillPatient?: IPatient | null;
  prefillPatientId?: string;
  prefillVisitId?: string;
  onClose: () => void;
  onSave: (payload: ICreateTriageDto | IUpdateTriageDto, id?: string) => Promise<void>;
}

const acuityOptions: IOption[] = Object.values(TriageAcuityEnum).map((v) => ({
  label: v.replace('_', ' '),
  value: v,
}));
const statusOptions: IOption[] = Object.values(TriageStatusEnum).map((v) => ({
  label: v.replaceAll('_', ' '),
  value: v,
}));
const consciousnessOptions: IOption[] = Object.values(ConsciousnessLevelEnum).map((v) => ({
  label: v,
  value: v,
}));

const toNum = (v: string) => (v === '' ? undefined : Number(v));

export default function TriageDrawer({
  mode,
  triage,
  prefillPatient,
  prefillPatientId,
  prefillVisitId,
  onClose,
  onSave,
}: TriageDrawerProps) {
  const open = mode !== null;
  const isEdit = mode === ModalDrawerModeEnum.EDIT;
  const [values, setValues] = useState<FormState>(emptyValues);
  const [busy, setBusy] = useState(false);

  // Patients are found by server-side search; a prefilled id without its record is fetched once.
  const [pickedPatient, setPickedPatient] = useState<IPatient | null>(null);
  const needsFetch = !pickedPatient && Boolean(values.patientId);
  const { patient: fetchedPatient } = usePatient(needsFetch ? values.patientId : null);
  const shownPatient = pickedPatient ?? fetchedPatient ?? null;

  useEffect(() => {
    if (!open) return;
    setPickedPatient(isEdit ? (triage?.patient ?? null) : (prefillPatient ?? null));
    if (isEdit && triage) {
      setValues({
        patientId: triage.patientId,
        acuity: triage.acuity,
        status: triage.status,
        chiefComplaint: triage.chiefComplaint,
        consciousness: triage.consciousness,
        temperatureC: triage.temperatureC != null ? String(triage.temperatureC) : '',
        heartRate: triage.heartRate != null ? String(triage.heartRate) : '',
        respiratoryRate: triage.respiratoryRate != null ? String(triage.respiratoryRate) : '',
        bloodPressureSystolic: triage.bloodPressureSystolic != null ? String(triage.bloodPressureSystolic) : '',
        bloodPressureDiastolic: triage.bloodPressureDiastolic != null ? String(triage.bloodPressureDiastolic) : '',
        oxygenSaturation: triage.oxygenSaturation != null ? String(triage.oxygenSaturation) : '',
        weightKg: triage.weightKg != null ? String(triage.weightKg) : '',
        heightCm: triage.heightCm != null ? String(triage.heightCm) : '',
        painScore: triage.painScore != null ? String(triage.painScore) : '',
        allergiesNoted: triage.allergiesNoted ?? '',
        assessmentNotes: triage.assessmentNotes ?? '',
      });
    } else {
      setValues({
        ...emptyValues,
        patientId: prefillPatient?.id ?? prefillPatientId ?? '',
      });
    }
  }, [triage, isEdit, open, prefillPatient, prefillPatientId]);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => setValues((s) => ({ ...s, [key]: value }));

  const submit = async () => {
    if (!values.patientId || !values.chiefComplaint.trim()) {
      toast.error('Patient and chief complaint are required');
      return;
    }
    setBusy(true);
    try {
      const payload: ICreateTriageDto | IUpdateTriageDto = {
        patientId: values.patientId,
        visitId: prefillVisitId,
        acuity: values.acuity,
        status: values.status,
        chiefComplaint: values.chiefComplaint.trim(),
        consciousness: values.consciousness,
        temperatureC: toNum(values.temperatureC),
        heartRate: toNum(values.heartRate),
        respiratoryRate: toNum(values.respiratoryRate),
        bloodPressureSystolic: toNum(values.bloodPressureSystolic),
        bloodPressureDiastolic: toNum(values.bloodPressureDiastolic),
        oxygenSaturation: toNum(values.oxygenSaturation),
        weightKg: toNum(values.weightKg),
        heightCm: toNum(values.heightCm),
        painScore: toNum(values.painScore),
        allergiesNoted: values.allergiesNoted.trim() || undefined,
        assessmentNotes: values.assessmentNotes.trim() || undefined,
      };
      await onSave(payload, triage?.id);
      onClose();
    } finally {
      setBusy(false);
    }
  };

  return (
    <Drawer open={open} onClose={onClose} title={isEdit ? 'Edit triage' : 'New triage'} width="w-[820px]">
      <form
        className="flex flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <div className="grid grid-cols-2 gap-3">
          <PatientSearchSelect
            value={shownPatient}
            onChange={(patient) => {
              setPickedPatient(patient);
              set('patientId', patient?.id ?? '');
            }}
            isDisabled={isEdit}
          />
          <Dropdown
            label="Acuity"
            options={acuityOptions}
            value={acuityOptions.find((o) => o.value === values.acuity) ?? null}
            onChange={(o) => set('acuity', (o as IOption).value as TriageAcuityEnum)}
          />
        </div>

        <Input
          label="Chief complaint"
          required
          value={values.chiefComplaint}
          onChange={(e) => set('chiefComplaint', e.target.value)}
          placeholder="Fever and headache for 3 days"
        />

        <div className="grid grid-cols-4 gap-3">
          <Input
            label="Temp °C"
            type="number"
            step="0.1"
            value={values.temperatureC}
            onChange={(e) => set('temperatureC', e.target.value)}
          />
          <Input
            label="Heart rate"
            type="number"
            value={values.heartRate}
            onChange={(e) => set('heartRate', e.target.value)}
          />
          <Input
            label="Resp rate"
            type="number"
            value={values.respiratoryRate}
            onChange={(e) => set('respiratoryRate', e.target.value)}
          />
          <Input
            label="SpO₂ %"
            type="number"
            value={values.oxygenSaturation}
            onChange={(e) => set('oxygenSaturation', e.target.value)}
          />
        </div>

        <div className="grid grid-cols-4 gap-3">
          <Input
            label="BP systolic"
            type="number"
            value={values.bloodPressureSystolic}
            onChange={(e) => set('bloodPressureSystolic', e.target.value)}
          />
          <Input
            label="BP diastolic"
            type="number"
            value={values.bloodPressureDiastolic}
            onChange={(e) => set('bloodPressureDiastolic', e.target.value)}
          />
          <Input
            label="Weight kg"
            type="number"
            step="0.1"
            value={values.weightKg}
            onChange={(e) => set('weightKg', e.target.value)}
          />
          <Input
            label="Height cm"
            type="number"
            value={values.heightCm}
            onChange={(e) => set('heightCm', e.target.value)}
          />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <Input
            label="Pain (0-10)"
            type="number"
            min={0}
            max={10}
            value={values.painScore}
            onChange={(e) => set('painScore', e.target.value)}
          />
          <Dropdown
            label="Consciousness"
            options={consciousnessOptions}
            value={consciousnessOptions.find((o) => o.value === values.consciousness) ?? null}
            onChange={(o) => set('consciousness', (o as IOption).value as ConsciousnessLevelEnum)}
          />
          <Dropdown
            label="Status"
            options={statusOptions}
            value={statusOptions.find((o) => o.value === values.status) ?? null}
            onChange={(o) => set('status', (o as IOption).value as TriageStatusEnum)}
          />
        </div>

        <Input
          label="Allergies noted"
          value={values.allergiesNoted}
          onChange={(e) => set('allergiesNoted', e.target.value)}
        />

        <Input
          label="Assessment notes"
          value={values.assessmentNotes}
          onChange={(e) => set('assessmentNotes', e.target.value)}
        />

        {prefillVisitId && (
          <p className="rounded-lg border border-line bg-surface px-3 py-2 text-xs text-ink-muted">
            When triage is completed the patient joins the doctor&apos;s queue. The doctor decides on lab, radiology or
            other services.
          </p>
        )}

        <div className="mt-2 flex justify-end gap-2">
          <Button type="button" variant={ButtonVariantEnum.GHOST} onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant={ButtonVariantEnum.PRIMARY} loading={busy}>
            {isEdit ? 'Save changes' : 'Record triage'}
          </Button>
        </div>
      </form>
    </Drawer>
  );
}
