import type { SignEncounterWarning } from '@/components/consultation/sign/sign-warnings';
import type { EncounterValues } from './encounter-values';
import { hasAssessment } from './encounter-values';

interface SignContext {
  values: EncounterValues;
  labOrders: number;
  resultsReady: number;
  prescriptions: number;
}

export function signWarnings({ values, resultsReady }: SignContext): SignEncounterWarning[] {
  const complaint = values.chiefComplaint.trim();
  const warnings: SignEncounterWarning[] = [];
  if (!complaint || complaint.toLowerCase() === 'to be documented') {
    warnings.push({ message: 'Chief complaint is missing — document it on the Encounter tab.', severity: 'critical' });
  }
  if (!hasAssessment(values)) warnings.push({ message: 'No assessment or diagnosis recorded.', severity: 'warning' });
  if (!values.plan.trim()) {
    warnings.push({ message: 'Plan is empty — consider documenting the management plan.', severity: 'warning' });
  }
  if (resultsReady > 0) {
    warnings.push({ message: `${resultsReady} lab result(s) ready — review before signing.`, severity: 'warning' });
  }
  return warnings;
}

const primaryDiagnosis = (values: EncounterValues) => {
  const primary = values.diagnoses.find((d) => d.isPrimary) ?? values.diagnoses[0];
  return primary ? `${primary.code} ${primary.title ?? ''}`.trim() : values.diagnosis.trim();
};

export function SignSummary({ values, labOrders, resultsReady, prescriptions }: SignContext) {
  const rows: Array<[string, string]> = [
    ['Chief complaint', values.chiefComplaint.trim() || '—'],
    ['Diagnosis', primaryDiagnosis(values) || '—'],
    ['Plan', values.plan.trim() || '—'],
    ['Lab orders', `${labOrders}${resultsReady > 0 ? ` · ${resultsReady} ready` : ''}`],
    ['Prescriptions', String(prescriptions)],
  ];
  return (
    <ul className="flex flex-col gap-1 text-xs text-ink">
      {rows.map(([label, text]) => (
        <li key={label} className="flex items-center justify-between">
          <span className="text-ink-muted">{label}</span>
          <span className="max-w-[60%] truncate font-medium">{text}</span>
        </li>
      ))}
    </ul>
  );
}
