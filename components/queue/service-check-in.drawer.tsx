'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Button, Drawer } from '@/components';
import Segmented from '@/components/inputs/segmented';
import { ButtonVariantEnum, ServiceVisitKindEnum } from '@/enum';
import { extractErrorMessage } from '@/helpers/errors';
import visitsService from '@/helpers/visits.service';
import type { IPatient } from '@/interfaces';

const OPTIONS = [
  { value: ServiceVisitKindEnum.ANTENATAL, label: 'Antenatal visit' },
  { value: ServiceVisitKindEnum.DELIVERY, label: 'Giving birth' },
  { value: ServiceVisitKindEnum.POSTNATAL, label: 'Postnatal visit' },
];

const HELP: Record<string, string> = {
  [ServiceVisitKindEnum.ANTENATAL]:
    'A pregnancy check-up. The nurse records contact number, gestation, blood pressure, tests and danger signs.',
  [ServiceVisitKindEnum.DELIVERY]:
    'The mother is in labour or has just delivered. The delivery fee is billed now; the nurse records the birth and the baby.',
  [ServiceVisitKindEnum.POSTNATAL]: 'A check of the mother and baby after birth.',
};

interface ServiceCheckInDrawerProps {
  open: boolean;
  patient: IPatient | null;
  onClose: () => void;
  onCheckedIn: () => Promise<unknown> | void;
}

/** Reception picks which maternity service the patient needs; each is billed as set up in Services. */
export default function ServiceCheckInDrawer({ open, patient, onClose, onCheckedIn }: ServiceCheckInDrawerProps) {
  const [service, setService] = useState(ServiceVisitKindEnum.ANTENATAL);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!patient) return;
    setBusy(true);
    try {
      await visitsService.checkInForService(patient.id, service);
      toast.success('Sent to the antenatal and immunization queue');
      await onCheckedIn();
      onClose();
    } catch (err) {
      toast.error(extractErrorMessage(err, "Couldn't check the patient in — retry"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Drawer open={open} onClose={onClose} title="Antenatal and birth" width="w-[520px]">
      <div className="flex flex-col gap-4">
        {patient && (
          <p className="text-sm text-ink">
            {patient.firstName} {patient.lastName}
            {patient.mrn && <span className="ml-2 text-xs text-ink-muted">{patient.mrn}</span>}
          </p>
        )}
        <Segmented label="What does the patient need?" options={OPTIONS} value={service} onChange={setService} />
        <p className="text-xs text-ink-muted">{HELP[service]}</p>
        <div className="flex justify-end gap-2">
          <Button type="button" variant={ButtonVariantEnum.GHOST} onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="button"
            variant={ButtonVariantEnum.PRIMARY}
            loading={busy}
            disabled={!patient}
            onClick={() => void submit()}
          >
            Check in
          </Button>
        </div>
      </div>
    </Drawer>
  );
}
