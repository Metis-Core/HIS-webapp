'use client';

import { useEffect, useState } from 'react';
import { FaExclamationTriangle, FaShieldAlt } from 'react-icons/fa';
import { Button, Drawer, Dropdown, Input, Pill } from '@/components';
import { ButtonVariantEnum, PillVariantEnum } from '@/enum';
import { InsuranceVerificationMethodEnum } from '@/enum/billing.enum';
import type { IInsuranceVerification, IOption, IService } from '@/interfaces';
import type { IPatient } from '@/interfaces/patient.interface';

const VAT_RATE = 0.18;

const methodOptions: IOption[] = [
  { label: 'Phone call to insurer', value: InsuranceVerificationMethodEnum.PHONE },
  { label: 'Insurer portal', value: InsuranceVerificationMethodEnum.PORTAL },
  { label: 'Card inspected', value: InsuranceVerificationMethodEnum.CARD },
];

type Props = {
  open: boolean;
  onClose: () => void;
  consultationFee: IService | null;
  patient?: IPatient | null;
  onConfirm: (insuranceVerification?: IInsuranceVerification) => Promise<void> | void;
  submitting: boolean;
};

export default function VisitReceiptDrawer({ open, onClose, consultationFee, patient, onConfirm, submitting }: Props) {
  const [method, setMethod] = useState<IOption | null>(null);
  const [reference, setReference] = useState('');
  const [verification, setVerification] = useState<IInsuranceVerification | null>(null);
  const [consented, setConsented] = useState(false);

  useEffect(() => {
    if (!open) return;
    setMethod(null);
    setReference('');
    setVerification(null);
    setConsented(false);
  }, [open]);

  const markVerified = () => {
    if (!method || !reference.trim()) return;
    setVerification({ method: method.value as InsuranceVerificationMethodEnum, reference: reference.trim() });
  };

  const totalFee = consultationFee?.fee ?? 0;
  const vatAmount = totalFee * VAT_RATE;
  const grandTotal = totalFee + vatAmount;

  return (
    <Drawer open={open} onClose={onClose} title="Check-in receipt" width="w-125">
      <div className="flex flex-col gap-6">
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

        {!consultationFee && (
          <div className="flex items-start gap-2 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
            <FaExclamationTriangle className="mt-0.5 shrink-0" aria-hidden />
            <span>No &quot;Consultation&quot; service is priced yet. Ask an admin to add it under Services.</span>
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
          onClick={() => onConfirm(verification ?? undefined)}
          disabled={submitting || !consented}
          className="w-full justify-center"
        >
          {submitting ? 'Checking in…' : 'Confirm & send to triage'}
        </Button>
      </div>
    </Drawer>
  );
}
