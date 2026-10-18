'use client';

import { Dropdown, Input } from '@/components';
import type { ConsultationTypeEnum, DepartmentEnum } from '@/enum';
import type { IOption } from '@/interfaces';
import DiagnosisPicker from './diagnosis-picker';
import { EXAM_AND_ASSESSMENT_LABEL, departmentOptions, typeOptions, type EncounterValues } from './encounter-values';

type SetField = <K extends keyof EncounterValues>(key: K, value: EncounterValues[K]) => void;

interface EncounterFieldsProps {
  values: EncounterValues;
  set: SetField;
  readOnly?: boolean;
}

/** Type and department, shared by the new and detail consultation pages. */
export function EncounterHeaderFields({ values, set, readOnly }: EncounterFieldsProps) {
  return (
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
  );
}

/** History, examination & assessment, diagnoses and plan, shared by the new and detail pages. */
export default function EncounterFields({ values, set, readOnly }: EncounterFieldsProps) {
  return (
    <>
      <Input
        label="History of present illness"
        disabled={readOnly}
        value={values.historyOfPresentIllness}
        onChange={(e) => set('historyOfPresentIllness', e.target.value)}
      />
      <Input
        label={EXAM_AND_ASSESSMENT_LABEL}
        disabled={readOnly}
        value={values.examinationAndAssessment}
        onChange={(e) => set('examinationAndAssessment', e.target.value)}
      />
      <DiagnosisPicker value={values.diagnoses} onChange={(d) => set('diagnoses', d)} readOnly={readOnly} />
      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Diagnosis notes"
          disabled={readOnly}
          value={values.diagnosis}
          onChange={(e) => set('diagnosis', e.target.value)}
        />
        <Input label="Plan" disabled={readOnly} value={values.plan} onChange={(e) => set('plan', e.target.value)} />
      </div>
      <Input label="Notes" disabled={readOnly} value={values.notes} onChange={(e) => set('notes', e.target.value)} />
    </>
  );
}
