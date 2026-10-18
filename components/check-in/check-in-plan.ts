import { OrderKindEnum, ServiceVisitKindEnum, VisitIntentEnum, VisitTypeEnum } from '@/enum';
import type { ICreateVisitDto, ILabTest, IProcedureTest, IService } from '@/interfaces';

export enum CheckInReasonEnum {
  CONSULTATION = 'consultation',
  LAB = 'lab',
  PROCEDURE = 'procedure',
  ANTENATAL = 'antenatal',
  DELIVERY = 'delivery',
  POSTNATAL = 'postnatal',
  IMMUNIZATION = 'immunization',
}

export const REASON_LABEL: Record<CheckInReasonEnum, string> = {
  [CheckInReasonEnum.CONSULTATION]: 'See a doctor',
  [CheckInReasonEnum.LAB]: 'Lab tests',
  [CheckInReasonEnum.PROCEDURE]: 'Procedure or imaging',
  [CheckInReasonEnum.ANTENATAL]: 'Antenatal visit',
  [CheckInReasonEnum.DELIVERY]: 'Giving birth',
  [CheckInReasonEnum.POSTNATAL]: 'Postnatal visit',
  [CheckInReasonEnum.IMMUNIZATION]: 'Immunization',
};

/** A patient needs at most one of these at a time. */
export const MATERNITY_REASONS: readonly CheckInReasonEnum[] = [
  CheckInReasonEnum.ANTENATAL,
  CheckInReasonEnum.DELIVERY,
  CheckInReasonEnum.POSTNATAL,
  CheckInReasonEnum.IMMUNIZATION,
];

const SERVICE_OF: Partial<Record<CheckInReasonEnum, ServiceVisitKindEnum>> = {
  [CheckInReasonEnum.ANTENATAL]: ServiceVisitKindEnum.ANTENATAL,
  [CheckInReasonEnum.DELIVERY]: ServiceVisitKindEnum.DELIVERY,
  [CheckInReasonEnum.POSTNATAL]: ServiceVisitKindEnum.POSTNATAL,
  [CheckInReasonEnum.IMMUNIZATION]: ServiceVisitKindEnum.IMMUNIZATION,
};

/** Service codes the fees come from, as set up in Services. */
export const FEE_CODE: Partial<Record<CheckInReasonEnum, string>> = {
  [CheckInReasonEnum.CONSULTATION]: 'CONSULTATION',
  [CheckInReasonEnum.ANTENATAL]: 'ANTENATAL_VISIT',
  [CheckInReasonEnum.DELIVERY]: 'DELIVERY',
  [CheckInReasonEnum.POSTNATAL]: 'POSTNATAL_VISIT',
  [CheckInReasonEnum.IMMUNIZATION]: 'IMMUNIZATION',
};

export interface CheckInChoice {
  reasons: CheckInReasonEnum[];
  triage: boolean;
  visitType: VisitTypeEnum;
  preferredDoctorId?: string;
  labTests: ILabTest[];
  procedures: IProcedureTest[];
}

/** Adds or removes a reason; choosing another maternity service replaces the one already chosen. */
export function toggleReason(reasons: CheckInReasonEnum[], reason: CheckInReasonEnum): CheckInReasonEnum[] {
  if (reasons.includes(reason)) return reasons.filter((r) => r !== reason);
  const kept = MATERNITY_REASONS.includes(reason) ? reasons.filter((r) => !MATERNITY_REASONS.includes(r)) : reasons;
  return [...kept, reason];
}

export function validateChoice(choice: CheckInChoice): string | null {
  const emergency = choice.visitType === VisitTypeEnum.EMERGENCY;
  if (choice.reasons.length === 0 && !emergency) return 'Choose what the patient came for';
  if (choice.reasons.includes(CheckInReasonEnum.LAB) && choice.labTests.length === 0) {
    return 'Choose the lab tests';
  }
  if (choice.reasons.includes(CheckInReasonEnum.PROCEDURE) && choice.procedures.length === 0) {
    return 'Choose the procedure or imaging';
  }
  return null;
}

/** The visit the API opens: triage stays on unless switched off, and an emergency always has triage and a doctor. */
export function buildVisitDto(
  patientId: string,
  choice: CheckInChoice,
  extra: Pick<ICreateVisitDto, 'triageCategory' | 'insuranceVerification'> = {},
): ICreateVisitDto {
  const emergency = choice.visitType === VisitTypeEnum.EMERGENCY;
  const consultation = emergency || choice.reasons.includes(CheckInReasonEnum.CONSULTATION);
  const service = choice.reasons.map((r) => SERVICE_OF[r]).find(Boolean);
  const stages: VisitIntentEnum[] = [];
  if (choice.reasons.includes(CheckInReasonEnum.LAB)) stages.push(VisitIntentEnum.LAB);
  if (choice.reasons.includes(CheckInReasonEnum.PROCEDURE)) {
    const kinds = new Set(choice.procedures.map((p) => p.kind));
    if (kinds.has(OrderKindEnum.RADIOLOGY)) stages.push(VisitIntentEnum.RADIOLOGY);
    if (kinds.has(OrderKindEnum.SURGERY)) stages.push(VisitIntentEnum.SURGERY);
  }
  return {
    patientId,
    visitType: choice.visitType,
    triage: emergency ? true : choice.triage,
    consultation,
    ...(service && { service }),
    ...(stages.length > 0 && { stages }),
    ...(consultation && choice.preferredDoctorId && { preferredDoctorId: choice.preferredDoctorId }),
    ...extra,
  };
}

export interface FeeLine {
  label: string;
  amount: number | null;
}

/** What is billed at check-in; null means the price is not set up in Services. Free services show an amount of 0. */
export function feeLines(choice: CheckInChoice, services: readonly IService[]): FeeLine[] {
  const byCode = new Map(services.filter((s) => s.code).map((s) => [s.code as string, s]));
  const lines: FeeLine[] = [];
  const emergency = choice.visitType === VisitTypeEnum.EMERGENCY;
  const reasons = emergency ? [CheckInReasonEnum.CONSULTATION, ...choice.reasons] : choice.reasons;
  [...new Set(reasons)].forEach((reason) => {
    const code = FEE_CODE[reason];
    if (!code) return;
    const service = byCode.get(code);
    lines.push({ label: service?.name ?? REASON_LABEL[reason], amount: service ? service.fee : null });
  });
  choice.labTests.forEach((test) => lines.push({ label: test.name, amount: Number(test.price) }));
  choice.procedures.forEach((test) => lines.push({ label: test.name, amount: Number(test.price) }));
  return lines;
}

export const totalOf = (lines: readonly FeeLine[]) => lines.reduce((sum, line) => sum + (line.amount ?? 0), 0);
