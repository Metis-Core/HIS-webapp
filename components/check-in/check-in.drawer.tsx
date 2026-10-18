'use client';

import { useState } from 'react';
import { FaExclamationTriangle } from 'react-icons/fa';
import { toast } from 'sonner';
import useSWR from 'swr';
import { Drawer, Dropdown } from '@/components';
import Button from '@/components/buttons/button';
import LabTestPicker from '@/components/consultation/lab-test-picker';
import { ButtonVariantEnum, TriageCategoryEnum, VisitTypeEnum } from '@/enum';
import { extractErrorMessage } from '@/helpers/errors';
import { labOrdersService } from '@/helpers/lab.service';
import { ordersService } from '@/helpers/ledger.service';
import servicesService from '@/helpers/services.service';
import { useCheckIn } from '@/hooks';
import type { IInsuranceVerification, IOption, IPagination, IService } from '@/interfaces';
import type { IPatient } from '@/interfaces/patient.interface';
import { formatFee, formatUGX } from '@/components/billing/billing-format';
import {
  buildVisitDto,
  CheckInReasonEnum,
  feeLines,
  totalOf,
  validateChoice,
  type CheckInChoice,
} from './check-in-plan';
import DoctorRequest from './doctor-request';
import InsuranceCheck from './insurance-check';
import ProcedurePicker from './procedure-picker';
import ReasonPicker from './reason-picker';

const visitTypeOptions: IOption[] = [
  { label: 'Walk-in', value: VisitTypeEnum.WALK_IN },
  { label: 'Appointment', value: VisitTypeEnum.APPOINTMENT },
  { label: 'Emergency', value: VisitTypeEnum.EMERGENCY },
];
const categoryOptions: IOption[] = [
  { label: 'Red — immediate', value: TriageCategoryEnum.RED },
  { label: 'Yellow — urgent', value: TriageCategoryEnum.YELLOW },
  { label: 'Green — can wait', value: TriageCategoryEnum.GREEN },
];
const single = (value: IOption | IOption[] | null) => (Array.isArray(value) ? (value[0] ?? null) : value);

const emptyChoice = (): CheckInChoice => ({
  reasons: [CheckInReasonEnum.CONSULTATION],
  triage: true,
  visitType: VisitTypeEnum.WALK_IN,
  labTests: [],
  procedures: [],
});

type Props = {
  open: boolean;
  onClose: () => void;
  patient: IPatient | null;
  onCheckedIn?: () => Promise<unknown> | void;
};

/** Every check-in: what the patient came for, triage (on by default), a doctor if asked for by name, tests and fees. */
export default function CheckInDrawer({ open, onClose, patient, onCheckedIn }: Props) {
  return (
    <Drawer open={open} onClose={onClose} title="Check in" width="w-[640px]">
      {open && <CheckInForm patient={patient} onClose={onClose} onCheckedIn={onCheckedIn} />}
    </Drawer>
  );
}

/** Mounted only while the drawer is open, so every check-in starts from the defaults. */
function CheckInForm({ onClose, patient, onCheckedIn }: Omit<Props, 'open'>) {
  const { checkIn } = useCheckIn({ enabled: false });
  const { data: services } = useSWR<IPagination<IService>>(
    servicesService.buildListUrl({ isActive: true, limit: 100 }),
  );
  const [choice, setChoice] = useState<CheckInChoice>(emptyChoice);
  const [category, setCategory] = useState<IOption>(categoryOptions[0]);
  const [verification, setVerification] = useState<IInsuranceVerification | null>(null);
  const [consented, setConsented] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const emergency = choice.visitType === VisitTypeEnum.EMERGENCY;
  const wantsDoctor = emergency || choice.reasons.includes(CheckInReasonEnum.CONSULTATION);
  const lines = feeLines(choice, services?.items ?? []);
  const unpriced = lines.some((line) => line.amount === null);
  const set = (patch: Partial<CheckInChoice>) => setChoice((current) => ({ ...current, ...patch }));

  const confirm = async () => {
    if (!patient || submitting) return;
    const problem = validateChoice(choice);
    if (problem) return void toast.error(problem);
    setSubmitting(true);
    try {
      const visit = await checkIn(
        buildVisitDto(patient.id, choice, {
          triageCategory: emergency ? (category.value as TriageCategoryEnum) : undefined,
          insuranceVerification: verification ?? undefined,
        }),
      );
      // The orders are placed against the new visit, which books and bills them.
      const failures: string[] = [];
      if (choice.labTests.length > 0) {
        await labOrdersService
          .create({ patientId: patient.id, visitId: visit.id, items: choice.labTests.map((t) => ({ testId: t.id })) })
          .catch((err: unknown) => failures.push(extractErrorMessage(err, "the lab tests couldn't be ordered")));
      }
      for (const procedure of choice.procedures) {
        await ordersService
          .place({ patientId: patient.id, visitId: visit.id, testId: procedure.id })
          .catch((err: unknown) => failures.push(extractErrorMessage(err, `${procedure.name} couldn't be ordered`)));
      }
      if (failures.length > 0)
        toast.error(`Checked in, but: ${failures.join('; ')}. Order them again from the lab or orders page.`);
      else toast.success(emergency ? 'Emergency checked in — flagged in every queue' : 'Checked in');
      await onCheckedIn?.();
      onClose();
    } catch (err) {
      toast.error(extractErrorMessage(err, "Couldn't check in — retry"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className="flex flex-col gap-5">
        {patient && (
          <p className="text-sm text-ink-muted">
            Patient:{' '}
            <span className="font-medium text-ink">
              {patient.firstName} {patient.lastName}
              {patient.mrn ? ` · ${patient.mrn}` : ''}
            </span>
          </p>
        )}

        <ReasonPicker reasons={choice.reasons} onChange={(reasons) => set({ reasons })} />

        <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-line p-4 text-sm">
          <input
            type="checkbox"
            checked={emergency ? true : choice.triage}
            disabled={emergency}
            onChange={(e) => set({ triage: e.target.checked })}
            className="mt-0.5 h-4 w-4 cursor-pointer accent-brand"
          />
          <div>
            <p className="font-bold text-ink">Triage first</p>
            <p className="mt-0.5 text-xs text-ink-muted">
              On for every patient by default; the nurse checks vitals before the next stage. Turn it off only when the
              patient does not need it, such as an immunization or a lab-only visit. Emergencies always have triage.
            </p>
          </div>
        </label>

        <Dropdown
          label="Visit type"
          options={visitTypeOptions}
          value={visitTypeOptions.find((o) => o.value === choice.visitType) ?? visitTypeOptions[0]}
          onChange={(value) => set({ visitType: (single(value)?.value ?? VisitTypeEnum.WALK_IN) as VisitTypeEnum })}
        />
        {emergency && (
          <div className="flex flex-col gap-1">
            <Dropdown
              label="Emergency triage colour"
              options={categoryOptions}
              value={category}
              onChange={(value) => setCategory(single(value) ?? categoryOptions[0])}
            />
            <p className="text-xs text-ink-muted">
              An emergency number is issued and the patient jumps every department&apos;s queue. Triage can raise the
              colour; lowering it needs a reason.
            </p>
          </div>
        )}

        {wantsDoctor && (
          <DoctorRequest doctorId={choice.preferredDoctorId} onChange={(id) => set({ preferredDoctorId: id })} />
        )}

        {choice.reasons.includes(CheckInReasonEnum.LAB) && (
          <section className="flex flex-col gap-2">
            <h3 className="text-sm font-semibold text-ink">Lab tests</h3>
            <LabTestPicker selected={choice.labTests} onChange={(labTests) => set({ labTests })} />
          </section>
        )}
        {choice.reasons.includes(CheckInReasonEnum.PROCEDURE) && (
          <ProcedurePicker selected={choice.procedures} onChange={(procedures) => set({ procedures })} />
        )}

        <div className="overflow-hidden rounded-xl border border-line">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-line bg-surface text-ink-muted">
              <tr>
                <th className="px-4 py-2 text-xs font-medium uppercase tracking-wide">Billed now</th>
                <th className="px-4 py-2 text-right text-xs font-medium uppercase tracking-wide">Price</th>
              </tr>
            </thead>
            <tbody>
              {lines.length === 0 ? (
                <tr>
                  <td className="px-4 py-3 text-xs text-ink-muted" colSpan={2}>
                    Nothing is billed yet. Tests and procedures are billed when they are ordered.
                  </td>
                </tr>
              ) : (
                lines.map((line, i) => (
                  <tr key={`${line.label}-${i}`} className="border-b border-line last:border-0">
                    <td className="px-4 py-2 text-ink">{line.label}</td>
                    <td className="px-4 py-2 text-right tabular-nums text-ink">
                      {line.amount === null ? 'Not set' : formatFee(line.amount)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          {lines.length > 0 && (
            <div className="flex items-center justify-between border-t border-line px-4 py-3 text-sm font-bold text-ink">
              <span>Total</span>
              <span className="tabular-nums">{formatUGX(totalOf(lines))}</span>
            </div>
          )}
        </div>
        {unpriced && (
          <div className="flex items-start gap-2 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
            <FaExclamationTriangle className="mt-0.5 shrink-0" aria-hidden />
            <span>A price is not set up for one of these under Services. Ask an admin to add it.</span>
          </div>
        )}

        {patient && <InsuranceCheck patient={patient} verification={verification} onVerified={setVerification} />}

        <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-line p-4 text-sm">
          <input
            type="checkbox"
            checked={consented}
            onChange={(e) => setConsented(e.target.checked)}
            className="mt-0.5 h-4 w-4 cursor-pointer accent-brand"
          />
          <div>
            <p className="font-bold text-ink">Patient consent confirmed</p>
            <p className="mt-0.5 text-xs text-ink-muted">
              I confirm the patient has been told the charges above and consents to proceed.
            </p>
          </div>
        </label>

        <Button
          type="button"
          variant={ButtonVariantEnum.PRIMARY}
          onClick={() => void confirm()}
          disabled={submitting || !consented || !patient}
          className="w-full justify-center"
        >
          {submitting ? 'Checking in…' : 'Confirm and check in'}
        </Button>
      </div>
    </>
  );
}
