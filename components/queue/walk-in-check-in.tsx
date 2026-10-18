'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Button, VisitReceiptDrawer } from '@/components';
import LabOrderDrawer from '@/components/lab/page/lab-order.drawer';
import { ButtonVariantEnum, ServiceVisitKindEnum } from '@/enum';
import { extractErrorMessage } from '@/helpers/errors';
import visitsService from '@/helpers/visits.service';
import { useRefreshQueues } from '@/hooks';
import type { IPatient } from '@/interfaces/patient.interface';
import PatientSearchSelect from './patient-search-select';
import ServiceCheckInDrawer from './service-check-in.drawer';

type Props = {
  onCheckedIn: () => Promise<unknown> | void;
};

export default function WalkInCheckIn({ onCheckedIn }: Props) {
  const [patient, setPatient] = useState<IPatient | null>(null);
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [labOpen, setLabOpen] = useState(false);
  const [maternityOpen, setMaternityOpen] = useState(false);
  const [immunizing, setImmunizing] = useState(false);
  const refreshQueues = useRefreshQueues();

  const done = async () => {
    await Promise.all([onCheckedIn(), refreshQueues()]);
    setPatient(null);
  };

  // Immunization is free under the national programme: no triage, no consultation fee; the nurse records which vaccine.
  const checkInForImmunization = async () => {
    if (!patient) return;
    setImmunizing(true);
    try {
      await visitsService.checkInForService(patient.id, ServiceVisitKindEnum.IMMUNIZATION);
      toast.success('Sent to immunization');
      await done();
    } catch (err) {
      toast.error(extractErrorMessage(err, "Couldn't check the patient in — retry"));
    } finally {
      setImmunizing(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-line bg-surface-raised p-5">
      <div className="border-b border-line py-2">
        <h3 className="text-md font-bold text-primary">Check in a registered patient</h3>
        <p className="text-xs text-ink-muted">
          Search the patient, then choose what they came for. New patients: use &quot;New patient&quot; — you&apos;ll be
          offered check-in right after registering. Lab tests only, antenatal and birth, and immunization have no
          consultation fee.
        </p>
      </div>
      <PatientSearchSelect value={patient} onChange={setPatient} />
      <div className="grid grid-cols-2 gap-2">
        <Button type="button" onClick={() => setReceiptOpen(true)} disabled={!patient} className="justify-center">
          Check in to see a doctor
        </Button>
        <Button
          type="button"
          variant={ButtonVariantEnum.SECONDARY}
          onClick={() => setLabOpen(true)}
          disabled={!patient}
          className="justify-center"
        >
          Lab tests only
        </Button>
        <Button
          type="button"
          variant={ButtonVariantEnum.SECONDARY}
          onClick={() => setMaternityOpen(true)}
          disabled={!patient}
          className="justify-center"
        >
          Antenatal and birth
        </Button>
        <Button
          type="button"
          variant={ButtonVariantEnum.SECONDARY}
          onClick={() => void checkInForImmunization()}
          loading={immunizing}
          disabled={!patient || immunizing}
          className="justify-center"
        >
          Immunization
        </Button>
      </div>

      <VisitReceiptDrawer
        open={receiptOpen}
        onClose={() => setReceiptOpen(false)}
        patient={patient}
        onCheckedIn={done}
      />
      <LabOrderDrawer
        open={labOpen}
        patient={patient}
        onClose={() => setLabOpen(false)}
        onOrdered={async () => {
          setLabOpen(false);
          await done();
        }}
      />
      <ServiceCheckInDrawer
        open={maternityOpen}
        patient={patient}
        onClose={() => setMaternityOpen(false)}
        onCheckedIn={done}
      />
    </div>
  );
}
