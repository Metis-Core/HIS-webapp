'use client';

import { useEffect, useState } from 'react';
import { Button, Drawer, PhoneInput, PhoneOtpInput, Pill, Toggle } from '@/components';
import { ButtonVariantEnum, PillVariantEnum } from '@/enum';
import { QueueStageEnum } from '@/enum/queue.enum';
import { serviceFeeMap } from '@/data/services';
import type { IOption } from '@/interfaces';
import type { IPatient } from '@/interfaces/patient.interface';
import { FaShieldAlt } from 'react-icons/fa';

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
  const [useAltPhone, setUseAltPhone] = useState(false);
  const [altPhone, setAltPhone] = useState('');
  const [altPhoneNote, setAltPhoneNote] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [sentOtp, setSentOtp] = useState('');
  const [otpValue, setOtpValue] = useState('');
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpError, setOtpError] = useState(false);

  useEffect(() => {
    if (!open) return;
    // reset consent/insurance state each time the receipt drawer reopens
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setInsuranceVerified(false);
    setVerifyingInsurance(false);
    setUseAltPhone(false);
    setAltPhone('');
    setAltPhoneNote('');
    setOtpSent(false);
    setSentOtp('');
    setOtpValue('');
    setOtpVerified(false);
    setOtpError(false);
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

  const sendOtp = () => {
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    setSentOtp(code);
    setOtpSent(true);
    setOtpVerified(false);
    setOtpValue('');
    setOtpError(false);
    console.log(`OTP sent to ${useAltPhone ? altPhone : 'the registered phone number'}: ${code}`);
  };

  const verifyOtp = () => {
    if (otpValue === sentOtp) {
      setOtpVerified(true);
      setOtpError(false);
    } else {
      setOtpError(true);
    }
  };

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

        <div
          className={`flex items-center justify-between rounded-xl border px-4 py-3 text-sm ${
            otpVerified ? 'border-green-200 bg-green-50 text-green-800' : 'border-amber-200 bg-amber-50 text-amber-800'
          }`}
        >
          <span className="font-medium">{otpVerified ? 'Payment consent verified' : 'Awaiting payment consent'}</span>
          <Pill variant={otpVerified ? PillVariantEnum.SUCCESS : PillVariantEnum.WARNING}>
            {otpVerified ? 'Verified' : 'Pending'}
          </Pill>
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

        <div className="flex flex-col gap-4 rounded-xl border border-grey-200 p-4 text-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="font-bold text-zinc-800">Verify payment consent</p>
              <p className="text-xs text-zinc-500">
                Send a one-time code and have the patient read it back to confirm consent.
              </p>
            </div>
            <Toggle
              checked={useAltPhone}
              onChange={(checked) => {
                setUseAltPhone(checked);
                setOtpSent(false);
                setOtpVerified(false);
                setOtpValue('');
              }}
              label="Use alternative number"
            />
          </div>

          {useAltPhone && (
            <div className="flex flex-col gap-3 rounded-lg border border-amber-200 bg-amber-50 p-3">
              <PhoneInput label="Alternative phone number" value={altPhone} onChange={(v) => setAltPhone(v ?? '')} />
              <div className="flex w-full flex-col gap-1">
                <label className="text-md font-medium tracking-wider text-slate-700">
                  Reason for using an alternative number
                </label>
                <textarea
                  value={altPhoneNote}
                  onChange={(event) => setAltPhoneNote(event.target.value)}
                  placeholder="e.g. patient's phone is unreachable, using a relative's number"
                  rows={2}
                  className="rounded-md border cursor-pointer border-slate-400 bg-white text-slate-700 px-3 py-2 text-md outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600 placeholder:text-slate-500"
                />
              </div>
              <p className="text-xs text-amber-700">
                The verification code will be sent to this number instead of the patient&apos;s registered phone.
              </p>
            </div>
          )}

          {!otpSent ? (
            <Button
              type="button"
              className="w-full justify-center"
              disabled={useAltPhone && !altPhone}
              onClick={sendOtp}
            >
              Send verification code
            </Button>
          ) : (
            <div className="flex flex-col gap-2">
              <label className="text-md font-medium tracking-wider text-slate-700">Enter the 4-digit code</label>
              <PhoneOtpInput
                length={4}
                value={otpValue}
                onChange={(v) => {
                  setOtpValue(v);
                  setOtpError(false);
                }}
              />
              {otpError && (
                <span className="text-xs text-red-500">That code doesn&apos;t match. Please try again.</span>
              )}

              {otpVerified ? (
                <span className="text-xs font-medium text-green-700">
                  Consent verified — the patient confirmed the code.
                </span>
              ) : (
                <>
                  <Button
                    type="button"
                    className="w-full justify-center"
                    disabled={otpValue.length < 4}
                    onClick={verifyOtp}
                  >
                    Verify consent
                  </Button>
                  <button
                    type="button"
                    onClick={sendOtp}
                    className="self-center text-xs font-medium text-green-800 hover:underline"
                  >
                    Didn&apos;t get a code? Resend
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {otpVerified && (
          <Button type="button" onClick={onConfirm} disabled={submitting} className="w-full justify-center">
            {submitting ? 'Adding…' : 'Confirm & add to queue'}
          </Button>
        )}
      </div>
    </Drawer>
  );
}
