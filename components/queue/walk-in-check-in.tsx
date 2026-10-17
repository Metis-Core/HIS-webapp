'use client';

import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Button, Dropdown, VisitReceiptDrawer } from '@/components';
import { VisitTypeEnum } from '@/enum/queue.enum';
import { api } from '@/helpers/axios';
import { extractErrorMessage } from '@/helpers/errors';
import { useServices } from '@/hooks';
import type { ICreateVisitDto, IInsuranceVerification, IOption } from '@/interfaces';
import type { IPatient } from '@/interfaces/patient.interface';
import PatientSearchSelect from './patient-search-select';

const visitTypeOptions: IOption[] = Object.values(VisitTypeEnum).map((type) => ({
  label: type.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
  value: type,
}));

type Props = {
  onCheckedIn: () => Promise<unknown> | void;
};

export default function WalkInCheckIn({ onCheckedIn }: Props) {
  const [visitType, setVisitType] = useState<IOption>(visitTypeOptions[0]);
  const [patient, setPatient] = useState<IPatient | null>(null);
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { services } = useServices({ search: 'consultation', isActive: true });

  const consultationFee = useMemo(
    () => services.find((s) => s.name.toLowerCase().startsWith('consultation')) ?? null,
    [services],
  );

  const confirm = async (insuranceVerification?: IInsuranceVerification) => {
    if (!patient || submitting) return;
    const dto: ICreateVisitDto = {
      patientId: patient.id,
      visitType: visitType.value as VisitTypeEnum,
      insuranceVerification,
    };
    setSubmitting(true);
    try {
      await toast.promise(api.post('/visits', dto), {
        loading: 'Checking in…',
        success: 'Patient checked in — sent to triage',
        error: (err) => extractErrorMessage(err, "Couldn't check in — retry"),
      });
      await onCheckedIn();
      setVisitType(visitTypeOptions[0]);
      setPatient(null);
      setReceiptOpen(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-line bg-surface-raised p-5">
      <div className="border-b border-line py-2">
        <h3 className="text-md font-bold text-primary">Add walk-in to queue</h3>
        <p className="text-xs text-ink-muted">Search a registered patient. They go to triage, then the doctor.</p>
      </div>
      <Dropdown
        label="Visit type"
        placeholder="Select visit type"
        options={visitTypeOptions}
        value={visitType}
        onChange={(value) => {
          const next = Array.isArray(value) ? value[0] : value;
          if (next) setVisitType(next);
        }}
      />
      <PatientSearchSelect value={patient} onChange={setPatient} />
      <Button type="button" onClick={() => setReceiptOpen(true)} disabled={!patient} className="w-full justify-center">
        Check in
      </Button>

      <VisitReceiptDrawer
        open={receiptOpen}
        onClose={() => setReceiptOpen(false)}
        consultationFee={consultationFee}
        patient={patient}
        onConfirm={confirm}
        submitting={submitting}
      />
    </div>
  );
}
