'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Button, VisitReceiptDrawer } from '@/components';
import { ButtonVariantEnum } from '@/enum';
import { extractErrorMessage } from '@/helpers/errors';
import { labWorkService } from '@/helpers/lab-work.service';
import type { IPatient } from '@/interfaces/patient.interface';
import PatientSearchSelect from './patient-search-select';

type Props = {
  onCheckedIn: () => Promise<unknown> | void;
};

export default function WalkInCheckIn({ onCheckedIn }: Props) {
  const [patient, setPatient] = useState<IPatient | null>(null);
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [sendingToLab, setSendingToLab] = useState(false);

  const done = async () => {
    await onCheckedIn();
    setPatient(null);
  };

  // L1: lab-only walk-ins skip consultation (and its fee); the lab orders and bills the tests.
  const sendToLab = async () => {
    if (!patient) return;
    setSendingToLab(true);
    try {
      await labWorkService.checkInForLab(patient.id);
      toast.success('Sent to the laboratory queue');
      await done();
    } catch (err) {
      toast.error(extractErrorMessage(err, "Couldn't send to the lab — retry"));
    } finally {
      setSendingToLab(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-line bg-surface-raised p-5">
      <div className="border-b border-line py-2">
        <h3 className="text-md font-bold text-primary">Check in a registered patient</h3>
        <p className="text-xs text-ink-muted">
          Search the patient, then confirm the visit type and consultation fee. New patients: use &quot;New
          patient&quot; — you&apos;ll be offered check-in right after registering. For lab tests only (no consultation),
          use &quot;Lab tests only&quot;.
        </p>
      </div>
      <PatientSearchSelect value={patient} onChange={setPatient} />
      <div className="flex gap-2">
        <Button
          type="button"
          onClick={() => setReceiptOpen(true)}
          disabled={!patient}
          className="flex-1 justify-center"
        >
          Check in
        </Button>
        <Button
          type="button"
          variant={ButtonVariantEnum.SECONDARY}
          onClick={sendToLab}
          loading={sendingToLab}
          disabled={!patient}
          className="flex-1 justify-center"
        >
          Lab tests only
        </Button>
      </div>

      <VisitReceiptDrawer
        open={receiptOpen}
        onClose={() => setReceiptOpen(false)}
        patient={patient}
        onCheckedIn={done}
      />
    </div>
  );
}
