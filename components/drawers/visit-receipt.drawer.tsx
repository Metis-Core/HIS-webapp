'use client';

import { useEffect, useState } from 'react';
import { FaShieldAlt } from 'react-icons/fa';
import { Button, Drawer, Pill } from '@/components';
import { ButtonVariantEnum, PillVariantEnum } from '@/enum';
import { QueueStageEnum } from '@/enum/queue.enum';
import { serviceFeeMap } from '@/data/services';
import type { IOption } from '@/interfaces';
import type { IPatient } from '@/interfaces/patient.interface';

const VAT_RATE = 0.18;

type Props = {
  open: boolean;
  onClose: () => void;
  motives: IOption[];
  patient?: IPatient | null;
  onConfirm: () => Promise<void> | void;
  submitting: boolean;
};

export default function VisitReceiptDrawer({ open, onClose, motives, patient, onConfirm, submitting }: Props) {
  const [insuranceVerified, setInsuranceVerified] = useState(false);
  const [verifyingInsurance, setVerifyingInsurance] = useState(false);
  const [consented, setConsented] = useState(false);

  useEffect(() => {
    if (!open) return;
    setInsuranceVerified(false);
    setVerifyingInsurance(false);
    setConsented(false);
  }, [open]);

  const verifyInsurance = async () => {
    setVerifyingInsurance(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    setVerifyingInsurance(false);
    setInsuranceVerified(true);
  };

  const totalFee = motives.reduce((sum, m) => sum + (serviceFeeMap[m.value as QueueStageEnum] ?? 0), 0);
  const vatAmount = totalFee * VAT_RATE;
  const grandTotal = totalFee + vatAmount;

  return (
    <Drawer open={open} onClose={onClose} title="Visit receipt" width="w-125">
      <div className="flex flex-col gap-6">
        <div className="overflow-hidden rounded-xl border border-zinc-200">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-zinc-200 bg-green-50 text-green-900">
              <tr>
                <th className="px-4 py-2 font-bold">Service</th>
                <th className="px-4 py-2 font-bold">Unit cost</th>
              </tr>
            </thead>
            <tbody>
              {motives.map((motive) => (
                <tr key={motive.value} className="border-b border-zinc-100 last:border-0">
                  <td className="px-4 py-2 capitalize text-zinc-700">{motive.label}</td>
                  <td className="px-4 py-2 text-zinc-700">
                    UGX {(serviceFeeMap[motive.value as QueueStageEnum] ?? 0).toLocaleString()}
                  </td>
                </tr>
              ))}
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

        {patient?.insuranceProvider && (
          <div className="flex flex-col gap-3 rounded-xl border border-zinc-200 p-4 text-sm">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <FaShieldAlt className="text-green-700" />
                <div>
                  <p className="font-bold text-zinc-800">{patient.insuranceProvider}</p>
                  {patient.insurancePolicyNumber && (
                    <p className="text-xs text-zinc-500">Policy {patient.insurancePolicyNumber}</p>
                  )}
                </div>
              </div>
              <Pill variant={insuranceVerified ? PillVariantEnum.SUCCESS : PillVariantEnum.WARNING}>
                {insuranceVerified ? 'Verified' : 'Unverified'}
              </Pill>
            </div>
            {!insuranceVerified && (
              <Button
                type="button"
                variant={ButtonVariantEnum.SECONDARY}
                className="w-full justify-center"
                disabled={verifyingInsurance}
                onClick={verifyInsurance}
              >
                {verifyingInsurance ? 'Verifying insurance…' : 'Verify insurance'}
              </Button>
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
              I confirm the patient has been informed of the services above and consents to proceed at the total shown.
            </p>
          </div>
        </label>

        <Button type="button" onClick={onConfirm} disabled={submitting || !consented} className="w-full justify-center">
          {submitting ? 'Adding…' : 'Confirm & add to queue'}
        </Button>
      </div>
    </Drawer>
  );
}
