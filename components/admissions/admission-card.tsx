'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { Button, Input, Pill } from '@/components';
import { ButtonVariantEnum, PillVariantEnum } from '@/enum';
import { extractErrorMessage } from '@/helpers/errors';
import { useAdmissions } from '@/hooks';

type Props = { visitId: string; canDischarge: boolean };

/** The ward stay for this visit; a doctor ends it, which lets the patient start a new visit. */
export default function AdmissionCard({ visitId, canDischarge }: Props) {
  const { admissions, discharge } = useAdmissions({ visitId, limit: 1 });
  const [confirming, setConfirming] = useState(false);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const admission = admissions[0];
  if (!admission) return null;

  const end = async () => {
    setSaving(true);
    try {
      await discharge(admission.id, notes.trim());
      toast.success('Patient discharged');
      setConfirming(false);
    } catch (err) {
      toast.error(extractErrorMessage(err, "Couldn't discharge — retry"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="flex flex-col gap-3 rounded-lg border border-line bg-surface-raised p-5">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-ink">Admission</h3>
        <Pill variant={admission.dischargedAt ? PillVariantEnum.DEFAULT : PillVariantEnum.WARNING}>
          {admission.dischargedAt ? 'Discharged' : 'Admitted'}
        </Pill>
      </div>
      <dl className="flex flex-col gap-1 text-xs text-ink-muted">
        <div>
          <dt className="inline font-medium text-ink">Ward: </dt>
          <dd className="inline">{admission.ward}</dd>
        </div>
        <div>
          <dt className="inline font-medium text-ink">Reason: </dt>
          <dd className="inline">{admission.reason}</dd>
        </div>
        <div>
          <dt className="inline font-medium text-ink">Admitted: </dt>
          <dd className="inline">{format(new Date(admission.admittedAt), 'd MMM yyyy, HH:mm')}</dd>
        </div>
        {admission.dischargedAt && (
          <div>
            <dt className="inline font-medium text-ink">Discharged: </dt>
            <dd className="inline">
              {format(new Date(admission.dischargedAt), 'd MMM yyyy, HH:mm')}
              {admission.dischargedBy ? ` by ${admission.dischargedBy.username}` : ''}
              {admission.dischargeNotes ? ` — ${admission.dischargeNotes}` : ''}
            </dd>
          </div>
        )}
      </dl>
      {!admission.dischargedAt && canDischarge && (
        <>
          {confirming ? (
            <>
              <Input
                label="Discharge note (optional)"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Recovered, review in 1 week"
              />
              <div className="flex gap-2">
                <Button type="button" variant={ButtonVariantEnum.PRIMARY} onClick={() => void end()} disabled={saving}>
                  {saving ? 'Discharging…' : 'Confirm discharge'}
                </Button>
                <Button type="button" variant={ButtonVariantEnum.SECONDARY} onClick={() => setConfirming(false)}>
                  Cancel
                </Button>
              </div>
            </>
          ) : (
            <Button type="button" variant={ButtonVariantEnum.SECONDARY} onClick={() => setConfirming(true)}>
              Discharge patient
            </Button>
          )}
        </>
      )}
    </section>
  );
}
