'use client';

import { useState } from 'react';
import { FaShieldAlt } from 'react-icons/fa';
import { Button, Dropdown, Input, Pill } from '@/components';
import { ButtonVariantEnum, PillVariantEnum } from '@/enum';
import { InsuranceVerificationMethodEnum } from '@/enum/billing.enum';
import type { IInsuranceVerification, IOption } from '@/interfaces';
import type { IPatient } from '@/interfaces/patient.interface';

const methodOptions: IOption[] = [
  { label: 'Phone call to insurer', value: InsuranceVerificationMethodEnum.PHONE },
  { label: 'Insurer portal', value: InsuranceVerificationMethodEnum.PORTAL },
  { label: 'Card inspected', value: InsuranceVerificationMethodEnum.CARD },
];

interface InsuranceCheckProps {
  patient: IPatient;
  verification: IInsuranceVerification | null;
  onVerified: (verification: IInsuranceVerification) => void;
}

/** Records how the patient's cover was confirmed (R5). Shown only for insured patients. */
export default function InsuranceCheck({ patient, verification, onVerified }: InsuranceCheckProps) {
  const [method, setMethod] = useState<IOption | null>(null);
  const [reference, setReference] = useState('');
  if (!patient.insuranceProvider) return null;

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-line p-4 text-sm">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <FaShieldAlt className="text-primary" />
          <div>
            <p className="font-bold text-ink">{patient.insuranceProvider}</p>
            {patient.insurancePolicyNumber && (
              <p className="text-xs text-ink-muted">Policy {patient.insurancePolicyNumber}</p>
            )}
          </div>
        </div>
        <Pill variant={verification ? PillVariantEnum.SUCCESS : PillVariantEnum.WARNING}>
          {verification ? 'Verified' : 'Unverified'}
        </Pill>
      </div>
      {verification ? (
        <p className="text-xs text-ink-muted">
          Confirmed via {methodOptions.find((o) => o.value === verification.method)?.label.toLowerCase()} · ref{' '}
          {verification.reference}
        </p>
      ) : (
        <>
          <p className="text-xs text-ink-muted">
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
            onClick={() =>
              method &&
              reference.trim() &&
              onVerified({ method: method.value as InsuranceVerificationMethodEnum, reference: reference.trim() })
            }
          >
            Mark insurance verified
          </Button>
        </>
      )}
    </div>
  );
}
