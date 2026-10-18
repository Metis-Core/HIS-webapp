import { describe, expect, it } from 'vitest';
import { OrderKindEnum, ServiceVisitKindEnum, VisitIntentEnum, VisitTypeEnum } from '@/enum';
import type { ILabTest, IProcedureTest, IService } from '@/interfaces';
import {
  buildVisitDto,
  CheckInReasonEnum as R,
  feeLines,
  toggleReason,
  totalOf,
  validateChoice,
  type CheckInChoice,
} from './check-in-plan';

const choice = (over: Partial<CheckInChoice> = {}): CheckInChoice => ({
  reasons: [R.CONSULTATION],
  triage: true,
  visitType: VisitTypeEnum.WALK_IN,
  labTests: [],
  procedures: [],
  ...over,
});
const dressing = { id: 'p1', name: 'Wound dressing', kind: OrderKindEnum.SURGERY, price: 15000 } as IProcedureTest;
const xray = { id: 'p2', name: 'X-ray, chest', kind: OrderKindEnum.RADIOLOGY, price: 50000 } as IProcedureTest;
const cbc = { id: 'l1', name: 'Full blood count', price: 20000 } as ILabTest;
const service = (code: string, name: string, fee: number) =>
  ({ id: code, code, name, fee, isActive: true }) as IService;

describe('toggleReason', () => {
  it('adds and removes a reason', () => {
    expect(toggleReason([R.CONSULTATION], R.LAB)).toEqual([R.CONSULTATION, R.LAB]);
    expect(toggleReason([R.CONSULTATION, R.LAB], R.LAB)).toEqual([R.CONSULTATION]);
  });

  it('lets only one maternity service stand at a time', () => {
    expect(toggleReason([R.ANTENATAL], R.DELIVERY)).toEqual([R.DELIVERY]);
    expect(toggleReason([R.CONSULTATION, R.IMMUNIZATION], R.POSTNATAL)).toEqual([R.CONSULTATION, R.POSTNATAL]);
  });
});

describe('validateChoice', () => {
  it('needs a reason, and tests or a procedure when those are chosen', () => {
    expect(validateChoice(choice({ reasons: [] }))).toBe('Choose what the patient came for');
    expect(validateChoice(choice({ reasons: [R.LAB] }))).toBe('Choose the lab tests');
    expect(validateChoice(choice({ reasons: [R.PROCEDURE] }))).toBe('Choose the procedure or imaging');
    expect(validateChoice(choice({ reasons: [R.LAB], labTests: [cbc] }))).toBeNull();
  });

  it('accepts an emergency with nothing else chosen', () => {
    expect(validateChoice(choice({ reasons: [], visitType: VisitTypeEnum.EMERGENCY }))).toBeNull();
  });
});

describe('buildVisitDto', () => {
  it('keeps triage on and asks for a consultation by default', () => {
    expect(buildVisitDto('pt1', choice())).toMatchObject({ patientId: 'pt1', triage: true, consultation: true });
  });

  it('books a surgery stage for a procedure-only visit, with triage still on', () => {
    const dto = buildVisitDto('pt1', choice({ reasons: [R.PROCEDURE], procedures: [dressing] }));
    expect(dto).toMatchObject({ triage: true, consultation: false, stages: [VisitIntentEnum.SURGERY] });
    expect(dto.preferredDoctorId).toBeUndefined();
  });

  it('books radiology and surgery stages for the kinds chosen, and a lab stage for tests', () => {
    const dto = buildVisitDto(
      'pt1',
      choice({ reasons: [R.LAB, R.PROCEDURE], labTests: [cbc], procedures: [dressing, xray] }),
    );
    expect(dto.stages).toEqual([VisitIntentEnum.LAB, VisitIntentEnum.RADIOLOGY, VisitIntentEnum.SURGERY]);
  });

  it('passes the maternity service and the doctor the patient asked for', () => {
    const dto = buildVisitDto('pt1', choice({ reasons: [R.CONSULTATION, R.ANTENATAL], preferredDoctorId: 'd1' }));
    expect(dto).toMatchObject({ service: ServiceVisitKindEnum.ANTENATAL, preferredDoctorId: 'd1' });
  });

  it('drops the requested doctor when there is no consultation', () => {
    const dto = buildVisitDto('pt1', choice({ reasons: [R.IMMUNIZATION], preferredDoctorId: 'd1', triage: false }));
    expect(dto).toMatchObject({ consultation: false, triage: false, service: ServiceVisitKindEnum.IMMUNIZATION });
    expect(dto.preferredDoctorId).toBeUndefined();
  });

  it('forces triage and a consultation for an emergency', () => {
    const dto = buildVisitDto('pt1', choice({ reasons: [], triage: false, visitType: VisitTypeEnum.EMERGENCY }));
    expect(dto).toMatchObject({ triage: true, consultation: true });
  });
});

describe('feeLines', () => {
  const services = [
    service('CONSULTATION', 'Consultation', 30000),
    service('IMMUNIZATION', 'Routine immunization (UNEPI)', 0),
  ];

  it('prices the consultation, a free service, tests and procedures', () => {
    const lines = feeLines(
      choice({
        reasons: [R.CONSULTATION, R.IMMUNIZATION, R.LAB, R.PROCEDURE],
        labTests: [cbc],
        procedures: [dressing],
      }),
      services,
    );
    expect(lines).toEqual([
      { label: 'Consultation', amount: 30000 },
      { label: 'Routine immunization (UNEPI)', amount: 0 },
      { label: 'Full blood count', amount: 20000 },
      { label: 'Wound dressing', amount: 15000 },
    ]);
    expect(totalOf(lines)).toBe(65000);
  });

  it('marks a fee that is not set up in Services', () => {
    expect(feeLines(choice({ reasons: [R.DELIVERY] }), services)).toEqual([{ label: 'Giving birth', amount: null }]);
  });
});
