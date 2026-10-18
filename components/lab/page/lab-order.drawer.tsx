'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Button, Drawer, Dropdown, Input } from '@/components';
import LabTestPicker from '@/components/consultation/lab-test-picker';
import PatientSearchSelect from '@/components/queue/patient-search-select';
import { ButtonVariantEnum, LabPriorityEnum } from '@/enum';
import { extractErrorMessage } from '@/helpers/errors';
import { labOrdersService } from '@/helpers/lab.service';
import type { ILabOrder, ILabTest, IOption, IPatient } from '@/interfaces';

const priorityOptions: IOption[] = Object.values(LabPriorityEnum).map((v) => ({ label: v, value: v }));

interface LabOrderDrawerProps {
  open: boolean;
  /** Set when ordering from a queue row; otherwise search for the patient. */
  patient: IPatient | null;
  visitId?: string;
  onClose: () => void;
  onOrdered: (order: ILabOrder) => void;
}

/** L1/L9: a walk-in or outside request. The API attaches it to the open visit or opens a lab-only one. */
export default function LabOrderDrawer(props: LabOrderDrawerProps) {
  return (
    <Drawer open={props.open} onClose={props.onClose} title="New lab order" width="w-[640px]">
      {props.open && <LabOrderForm key={props.patient?.id ?? 'search'} {...props} />}
    </Drawer>
  );
}

function LabOrderForm({ patient: preset, visitId, onClose, onOrdered }: LabOrderDrawerProps) {
  const [patient, setPatient] = useState<IPatient | null>(preset);
  const [tests, setTests] = useState<ILabTest[]>([]);
  const [priority, setPriority] = useState(LabPriorityEnum.ROUTINE);
  const [referrer, setReferrer] = useState('');
  const [notes, setNotes] = useState('');
  const [busy, setBusy] = useState(false);
  const total = tests.reduce((sum, t) => sum + Number(t.price), 0);

  const submit = async () => {
    if (!patient) return toast.error('Choose the patient');
    if (tests.length === 0) return toast.error('Select at least one test');
    setBusy(true);
    try {
      const order = await labOrdersService.create({
        patientId: patient.id,
        visitId,
        priority,
        referringClinician: referrer.trim() || undefined,
        clinicalNotes: notes.trim() || undefined,
        items: tests.map((t) => ({ testId: t.id })),
      });
      toast.success('Lab order created and billed');
      onOrdered(order);
    } catch (err) {
      toast.error(extractErrorMessage(err, "Couldn't create the order — retry"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <PatientSearchSelect value={patient} onChange={setPatient} isDisabled={Boolean(preset)} />
      <LabTestPicker selected={tests} onChange={setTests} />
      <div className="grid grid-cols-2 gap-3">
        <Dropdown
          label="Priority"
          options={priorityOptions}
          value={priorityOptions.find((o) => o.value === priority) ?? null}
          onChange={(o) => setPriority((o as IOption).value as LabPriorityEnum)}
        />
        <Input
          label="Referring clinician / facility"
          value={referrer}
          maxLength={150}
          onChange={(e) => setReferrer(e.target.value)}
          placeholder="Self-referral if empty"
        />
      </div>
      <Input label="Clinical notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
      <div className="flex items-center justify-end gap-3">
        {tests.length > 0 && (
          <span className="text-sm text-ink-muted">
            Total <span className="font-semibold tabular-nums text-ink">UGX {total.toLocaleString()}</span>
          </span>
        )}
        <Button type="button" variant={ButtonVariantEnum.GHOST} onClick={onClose}>
          Cancel
        </Button>
        <Button type="button" variant={ButtonVariantEnum.PRIMARY} loading={busy} onClick={submit}>
          Create order
        </Button>
      </div>
    </div>
  );
}
