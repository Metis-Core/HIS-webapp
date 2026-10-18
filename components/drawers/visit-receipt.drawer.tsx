'use client';

import { useEffect, useState } from 'react';
import { FaExclamationTriangle, FaShieldAlt } from 'react-icons/fa';
import { toast } from 'sonner';
import { Button, Drawer, Dropdown, Input, Pill } from '@/components';
import { ButtonVariantEnum, PillVariantEnum, TriageCategoryEnum, VisitTypeEnum } from '@/enum';
import { InsuranceVerificationMethodEnum } from '@/enum/billing.enum';
import { extractErrorMessage } from '@/helpers/errors';
import { useCheckIn } from '@/hooks';
import type { IInsuranceVerification, IOption } from '@/interfaces';
import type { IPatient } from '@/interfaces/patient.interface';

const VAT_RATE = 0.18;

const methodOptions: IOption[] = [
  { label: 'Phone call to insurer', value: InsuranceVerificationMethodEnum.PHONE },
  { label: 'Insurer portal', value: InsuranceVerificationMethodEnum.PORTAL },
  { label: 'Card inspected', value: InsuranceVerificationMethodEnum.CARD },
];

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

type Props = {
  open: boolean;
  onClose: () => void;
  patient: IPatient | null;
  /** Called after the visit is created; the drawer has already shown the confirmation toast. */
  onCheckedIn?: () => Promise<unknown> | void;
  title?: string;
};

/** Check-in step: visit type (and emergency colour), consultation fee, insurance and consent (R5/R9). */
export default function VisitReceiptDrawer({ open, onClose, patient, onCheckedIn, title = 'Check-in receipt' }: Props) {
  const { consultationFee, feeMissing, checkIn } = useCheckIn({ enabled: open });
  const [visitType, setVisitType] = useState<IOption>(visitTypeOptions[0]);
  const [category, setCategory] = useState<IOption>(categoryOptions[0]);
  const [method, setMethod] = useState<IOption | null>(null);
  const [reference, setReference] = useState('');
  const [verification, setVerification] = useState<IInsuranceVerification | null>(null);
  const [consented, setConsented] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const isEmergency = visitType.value === VisitTypeEnum.EMERGENCY;

  useEffect(() => {
    if (!open) return;
    setVisitType(visitTypeOptions[0]);
    setCategory(categoryOptions[0]);
    setMethod(null);
    setReference('');
    setVerification(null);
    setConsented(false);
  }, [open]);

  const confirm = async () => {
    if (!patient || submitting) return;
    setSubmitting(true);
    try {
      await toast
        .promise(
          checkIn({
            patientId: patient.id,
            visitType: visitType.value as VisitTypeEnum,
            triageCategory: isEmergency ? (category.value as TriageCategoryEnum) : undefined,
            insuranceVerification: verification ?? undefined,
          }),
          {
            loading: 'Checking in…',
            success: isEmergency ? 'Emergency checked in — flagged in every queue' : 'Checked in — sent to triage',
            error: (err: unknown) => extractErrorMessage(err, "Couldn't check in — retry"),
          },
        )
        .unwrap();
      await onCheckedIn?.();
      onClose();
    } catch {
      // The toast already shows the reason.
    } finally {
      setSubmitting(false);
    }
  };

  const markVerified = () => {
    if (!method || !reference.trim()) return;
    setVerification({ method: method.value as InsuranceVerificationMethodEnum, reference: reference.trim() });
  };

  const totalFee = consultationFee?.fee ?? 0;
  const vatAmount = totalFee * VAT_RATE;
  const grandTotal = totalFee + vatAmount;

  return (
    <Drawer open={open} onClose={onClose} title={title} width="w-125">
      <div className="flex flex-col gap-6">
        {patient && (
          <p className="text-sm text-ink-muted">
            Patient:{' '}
            <span className="font-medium text-ink">
              {patient.firstName} {patient.lastName}
              {patient.mrn ? ` · ${patient.mrn}` : ''}
            </span>
          </p>
        )}
        <Dropdown
          label="Visit type"
          options={visitTypeOptions}
          value={visitType}
          onChange={(value) => setVisitType(single(value) ?? visitTypeOptions[0])}
        />
        {isEmergency && (
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
        <div className="overflow-hidden rounded-xl border border-zinc-200">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-line bg-primary-soft text-primary">
              <tr>
                <th className="px-4 py-2 font-bold">Service</th>
                <th className="px-4 py-2 font-bold">Unit cost</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-zinc-100 last:border-0">
                <td className="px-4 py-2 text-zinc-700">{consultationFee?.name ?? 'Consultation'}</td>
                <td className="px-4 py-2 text-zinc-700">UGX {totalFee.toLocaleString()}</td>
              </tr>
            </tbody>
          </table>
          <div className="flex flex-col gap-1 border-t border-zinc-200 px-4 py-3 text-sm">
            <div className="flex items-center justify-between text-zinc-700">
              <span>Subtotal</span>
              <span>UGX {totalFee.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between text-zinc-700">
              <span>VAT ({(VAT_RATE * 100).toFixed(0)}%)</span>
              <span>UGX {vatAmount.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between border-t border-zinc-200 pt-2 font-bold text-zinc-900">
              <span>Total</span>
              <span>UGX {grandTotal.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {feeMissing && (
          <div className="flex items-start gap-2 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
            <FaExclamationTriangle className="mt-0.5 shrink-0" aria-hidden />
            <span>
              No consultation fee is configured. Ask an admin to give a service the code CONSULTATION under Services.
            </span>
          </div>
        )}

        <p className="text-xs text-ink-muted">
          Lab tests and other services are added by the doctor and billed at their own prices.
        </p>

        {patient?.insuranceProvider && (
          <div className="flex flex-col gap-3 rounded-xl border border-zinc-200 p-4 text-sm">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <FaShieldAlt className="text-primary" />
                <div>
                  <p className="font-bold text-zinc-800">{patient.insuranceProvider}</p>
                  {patient.insurancePolicyNumber && (
                    <p className="text-xs text-zinc-500">Policy {patient.insurancePolicyNumber}</p>
                  )}
                </div>
              </div>
              <Pill variant={verification ? PillVariantEnum.SUCCESS : PillVariantEnum.WARNING}>
                {verification ? 'Verified' : 'Unverified'}
              </Pill>
            </div>
            {verification ? (
              <p className="text-xs text-zinc-500">
                Confirmed via {methodOptions.find((o) => o.value === verification.method)?.label.toLowerCase()} · ref{' '}
                {verification.reference}
              </p>
            ) : (
              <>
                <p className="text-xs text-zinc-500">
                  Confirm cover with the insurer directly, then record how it was confirmed.
                </p>
                <Dropdown
                  label="Confirmed by"
                  placeholder="Select method"
                  options={methodOptions}
                  value={method}
                  onChange={(value) => setMethod(Array.isArray(value) ? (value[0] ?? null) : value)}
                />
                <Input
                  label="Reference / approval number"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  placeholder="e.g. AUTH-12345"
                />
                <Button
                  type="button"
                  variant={ButtonVariantEnum.SECONDARY}
                  className="w-full justify-center"
                  disabled={!method || !reference.trim()}
                  onClick={markVerified}
                >
                  Mark insurance verified
                </Button>
              </>
            )}
          </div>
        )}

        <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-zinc-200 p-4 text-sm">
          <input
            type="checkbox"
            checked={consented}
            onChange={(e) => setConsented(e.target.checked)}
            className="mt-0.5 h-4 w-4 cursor-pointer accent-brand"
          />
          <div>
            <p className="font-bold text-zinc-800">Patient consent confirmed</p>
            <p className="mt-0.5 text-xs text-zinc-500">
              I confirm the patient has been informed of the consultation fee and consents to proceed.
            </p>
          </div>
        </label>

        <Button
          type="button"
          onClick={confirm}
          disabled={submitting || !consented || !patient}
          className="w-full justify-center"
        >
          {submitting ? 'Checking in…' : 'Confirm & check in'}
        </Button>
      </div>
    </Drawer>
  );
}
