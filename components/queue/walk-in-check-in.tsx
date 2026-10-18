'use client';

import { useState } from 'react';
import { Button } from '@/components';
import CheckInDrawer from '@/components/check-in/check-in.drawer';
import { useRefreshQueues } from '@/hooks';
import type { IPatient } from '@/interfaces/patient.interface';
import PatientSearchSelect from './patient-search-select';

type Props = {
  onCheckedIn: () => Promise<unknown> | void;
};

export default function WalkInCheckIn({ onCheckedIn }: Props) {
  const [patient, setPatient] = useState<IPatient | null>(null);
  const [open, setOpen] = useState(false);
  const refreshQueues = useRefreshQueues();

  const done = async () => {
    await Promise.all([onCheckedIn(), refreshQueues()]);
    setPatient(null);
  };

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-line bg-surface-raised p-5">
      <div className="border-b border-line py-2">
        <h3 className="text-md font-bold text-primary">Check in a registered patient</h3>
        <p className="text-xs text-ink-muted">
          Search the patient, then choose what they came for: a doctor, lab tests, a procedure, antenatal care, birth or
          immunization. New patients: use &quot;New patient&quot; — you&apos;ll be offered check-in right after
          registering.
        </p>
      </div>
      <PatientSearchSelect value={patient} onChange={setPatient} />
      <Button type="button" onClick={() => setOpen(true)} disabled={!patient} className="w-full justify-center">
        Check in
      </Button>
      <CheckInDrawer open={open} onClose={() => setOpen(false)} patient={patient} onCheckedIn={done} />
    </div>
  );
}
