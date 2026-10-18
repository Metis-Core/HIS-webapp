import { ConsultationTypeEnum, DepartmentEnum } from '@/enum';
import type { IConsultation, IConsultationDiagnosis, IOption, IUpdateConsultationDto } from '@/interfaces';

/** Decision 4 may rename this field; the label lives here only. */
export const EXAM_AND_ASSESSMENT_LABEL = 'Examination & assessment';

/** A diagnosis as edited on the form; `codeId` is null for old codes not found in the catalogue. */
export interface DiagnosisDraft {
  codeId: string | null;
  code: string;
  title: string | null;
  isPrimary: boolean;
}

export interface EncounterValues {
  chiefComplaint: string;
  type: ConsultationTypeEnum;
  department: DepartmentEnum;
  historyOfPresentIllness: string;
  examinationAndAssessment: string;
  diagnosis: string;
  diagnoses: DiagnosisDraft[];
  plan: string;
  notes: string;
}

export const EMPTY_ENCOUNTER: EncounterValues = {
  chiefComplaint: '',
  type: ConsultationTypeEnum.OUTPATIENT,
  department: DepartmentEnum.OUTPATIENT_CLINIC,
  historyOfPresentIllness: '',
  examinationAndAssessment: '',
  diagnosis: '',
  diagnoses: [],
  plan: '',
  notes: '',
};

const toOptions = (values: string[]): IOption[] => values.map((v) => ({ label: v.replaceAll('_', ' '), value: v }));
export const typeOptions = toOptions(Object.values(ConsultationTypeEnum));
export const departmentOptions = toOptions(Object.values(DepartmentEnum));

const toDraft = (d: IConsultationDiagnosis): DiagnosisDraft => ({
  codeId: d.diagnosisCodeId,
  code: d.code,
  title: d.title,
  isPrimary: d.isPrimary,
});

export const toEncounterValues = (c: IConsultation): EncounterValues => ({
  chiefComplaint: c.chiefComplaint,
  type: c.type,
  department: c.department,
  historyOfPresentIllness: c.historyOfPresentIllness ?? '',
  examinationAndAssessment: c.examinationAndAssessment ?? '',
  diagnosis: c.diagnosis ?? '',
  diagnoses: (c.diagnoses ?? []).map(toDraft),
  plan: c.plan ?? '',
  notes: c.notes ?? '',
});

/** Only catalogue codes can be sent; old unmatched codes are kept by not sending the list at all. */
export const codedDiagnoses = (drafts: DiagnosisDraft[]) =>
  drafts.flatMap((d) => (d.codeId ? [{ codeId: d.codeId, isPrimary: d.isPrimary }] : []));

// Empty strings are sent on purpose so that clearing a field is saved too.
export const toEncounterPayload = (v: EncounterValues, diagnosesChanged: boolean): IUpdateConsultationDto => ({
  chiefComplaint: v.chiefComplaint.trim(),
  type: v.type,
  department: v.department,
  historyOfPresentIllness: v.historyOfPresentIllness.trim(),
  examinationAndAssessment: v.examinationAndAssessment.trim(),
  diagnosis: v.diagnosis.trim(),
  ...(diagnosesChanged ? { diagnoses: codedDiagnoses(v.diagnoses) } : {}),
  plan: v.plan.trim(),
  notes: v.notes.trim(),
});

export const validateEncounter = (v: EncounterValues): string | null =>
  v.chiefComplaint.trim() ? null : 'Chief complaint is required';

export const hasAssessment = (v: EncounterValues): boolean =>
  Boolean(v.examinationAndAssessment.trim() || v.diagnosis.trim() || v.diagnoses.length);
