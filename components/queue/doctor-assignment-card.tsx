'use client';

import { useState } from 'react';
import { FaUserMd } from 'react-icons/fa';
import { toast } from 'sonner';
import { Button, Input, Modal, Pill } from '@/components';
import DoctorSearchSelect from '@/components/consultation/encounter/doctor-search-select';
import { AssignmentSourceEnum, ButtonVariantEnum, PillVariantEnum } from '@/enum';
import { availabilityService } from '@/helpers/availability.service';
import { extractErrorMessage } from '@/helpers/errors';
import { useRefreshQueues } from '@/hooks';
import type { IDoctorSummary, IVisitRecord } from '@/interfaces';

const SOURCE_LABEL: Record<AssignmentSourceEnum, string> = {
  [AssignmentSourceEnum.AUTO]: 'Assigned automatically',
  [AssignmentSourceEnum.MANUAL]: 'Assigned by staff',
  [AssignmentSourceEnum.CLAIMED]: 'Taken by the doctor',
};

interface DoctorAssignmentCardProps {
  visit: IVisitRecord;
  canReassign: boolean;
  onChanged: () => Promise<unknown>;
}

export default function DoctorAssignmentCard({ visit, canReassign, onChanged }: DoctorAssignmentCardProps) {
  const [open, setOpen] = useState(false);
  const [doctor, setDoctor] = useState<IDoctorSummary | null>(null);
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const refreshQueues = useRefreshQueues();

  const assigned = visit.assignedDoctor;

  const close = () => {
    setOpen(false);
    setDoctor(null);
    setReason('');
    setError(null);
  };

  const finish = async (message: string) => {
    await Promise.all([onChanged(), refreshQueues()]);
    toast.success(message);
  };

  const reassign = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!doctor) return setError('Pick the doctor who will see this patient');
    if (reason.trim().length < 3) return setError('Give a short reason for moving the patient');
    setBusy(true);
    setError(null);
    try {
      await availabilityService.reassign(visit.id, { doctorId: doctor.id, reason: reason.trim() });
      await finish(`Patient moved to Dr ${doctor.username}`);
      close();
    } catch (err) {
      setError(extractErrorMessage(err, "Couldn't move the patient — retry"));
    } finally {
      setBusy(false);
    }
  };

  const autoAssign = async () => {
    setBusy(true);
    try {
      await availabilityService.autoAssign(visit.id);
      await finish('Doctor assigned');
    } catch (err) {
      toast.error(extractErrorMessage(err, "Couldn't assign a doctor — retry"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="rounded-lg border border-line bg-surface-raised p-5">
      <h2 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-ink-muted">
        <FaUserMd aria-hidden /> Doctor
      </h2>
      {assigned ? (
        <div className="flex flex-col gap-1.5">
          <p className="text-sm font-medium text-ink">Dr {assigned.username}</p>
          {visit.assignmentSource && <Pill variant={PillVariantEnum.INFO}>{SOURCE_LABEL[visit.assignmentSource]}</Pill>}
        </div>
      ) : (
        <p className="text-sm text-ink-muted">
          No doctor yet. The patient is assigned automatically once triage is done and a doctor is available.
        </p>
      )}
      {canReassign && (
        <div className="mt-4 flex flex-wrap gap-2">
          <Button type="button" variant={ButtonVariantEnum.SECONDARY} onClick={() => setOpen(true)}>
            {assigned ? 'Change doctor' : 'Pick doctor'}
          </Button>
          <Button type="button" variant={ButtonVariantEnum.GHOST} loading={busy} onClick={autoAssign}>
            Auto-assign
          </Button>
        </div>
      )}

      <Modal open={open} onClose={close} title="Move patient to a doctor">
        <form onSubmit={reassign} className="flex flex-col gap-4">
          <DoctorSearchSelect value={doctor} onChange={setDoctor} />
          <Input
            label="Reason"
            required
            maxLength={255}
            placeholder="e.g. patient asked for Dr Namutebi"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
          {error && (
            <p role="alert" className="rounded-lg bg-critical-soft px-3 py-2 text-sm text-critical">
              {error}
            </p>
          )}
          <div className="flex justify-end gap-2">
            <Button type="button" variant={ButtonVariantEnum.GHOST} onClick={close}>
              Cancel
            </Button>
            <Button type="submit" variant={ButtonVariantEnum.PRIMARY} loading={busy}>
              Move patient
            </Button>
          </div>
        </form>
      </Modal>
    </section>
  );
}
