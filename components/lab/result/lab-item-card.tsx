'use client';

import { format } from 'date-fns';
import { useState } from 'react';
import { toast } from 'sonner';
import { Input, Pill } from '@/components';
import { LabOrderItemStatusEnum as S } from '@/enum';
import { extractErrorMessage } from '@/helpers/errors';
import { useLabItemActions } from '@/hooks';
import type { ILabOrder, ILabOrderItem, IUser } from '@/interfaces';
import LabResultTable from '../lab-result-table';
import { itemStatusVariant } from '../lab-status';
import LabAmendmentTrail from './lab-amendment-trail';
import LabAttachments from './lab-attachments';
import LabItemActions from './lab-item-actions';
import LabResultForm, { type LabResultSubmission } from './lab-result-form';

interface LabItemCardProps {
  order: ILabOrder;
  item: ILabOrderItem;
  onChanged: (order: ILabOrder) => void;
}

const who = (u?: IUser | null) => (u ? `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim() : '');
const stamp = (label: string, at?: Date | null, by?: IUser | null) =>
  at ? `${label} ${format(new Date(at), 'dd MMM HH:mm')}${by ? ` by ${who(by)}` : ''}` : null;

const ENTRY: readonly S[] = [S.PENDING, S.COLLECTED, S.IN_PROCESS];

/** One test on the bench: collect → process → enter → verify, then amend with a reason. */
export default function LabItemCard({ order, item, onChanged }: LabItemCardProps) {
  const actions = useLabItemActions();
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState(false);
  const [amending, setAmending] = useState(false);
  const [reason, setReason] = useState('');

  const run = async (work: () => Promise<ILabOrder>, success: string) => {
    setBusy(true);
    try {
      onChanged(await work());
      toast.success(success);
      setEditing(false);
      setAmending(false);
      setReason('');
    } catch (err) {
      toast.error(extractErrorMessage(err, "Couldn't save — retry"));
    } finally {
      setBusy(false);
    }
  };

  const move = (status: S) => run(() => actions.update(order.id, item.id, { status }), 'Status updated');
  const saveResult = (s: LabResultSubmission) =>
    run(() => actions.update(order.id, item.id, { ...s, status: S.RESULT_READY }), 'Result saved');
  const verify = () => run(() => actions.verify(order.id, item.id), 'Result verified and released');
  const amend = (s: LabResultSubmission) => {
    if (reason.trim().length < 5) return toast.error('Give a reason of at least 5 characters');
    return run(() => actions.amend(order.id, item.id, { ...s, reason: reason.trim() }), 'Result amended');
  };

  const showForm = ENTRY.includes(item.status) || (item.status === S.RESULT_READY && editing);
  const stamps = [
    stamp('Collected', item.collectedAt, item.collectedBy),
    stamp('Resulted', item.resultedAt, item.resultedBy),
    stamp('Verified', item.verifiedAt, item.verifiedBy),
  ].filter(Boolean);

  return (
    <section className="flex flex-col gap-3 rounded-lg border border-line bg-surface-raised p-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-ink">
            {item.test ? `${item.test.code} — ${item.test.name}` : 'Test'}
          </p>
          {stamps.length > 0 && <p className="text-[11px] text-ink-muted">{stamps.join(' · ')}</p>}
        </div>
        <Pill variant={itemStatusVariant[item.status]}>{item.status.replaceAll('_', ' ')}</Pill>
      </div>

      {showForm ? (
        <LabResultForm
          item={item}
          patient={order.patient}
          busy={busy}
          submitLabel={item.status === S.RESULT_READY ? 'Update result' : 'Save result'}
          onSubmit={saveResult}
          onCancel={editing ? () => setEditing(false) : undefined}
        />
      ) : amending ? (
        <LabResultForm
          item={item}
          patient={order.patient}
          busy={busy}
          submitLabel="Save amendment"
          onSubmit={amend}
          onCancel={() => setAmending(false)}
        >
          <Input
            label="Reason for amendment"
            required
            value={reason}
            maxLength={500}
            onChange={(e) => setReason(e.target.value)}
          />
        </LabResultForm>
      ) : (
        item.status !== S.CANCELLED && <LabResultTable item={item} patient={order.patient} />
      )}
      {item.status === S.RESULT_READY && !editing && (
        <button
          type="button"
          className="self-start text-xs text-brand hover:underline"
          onClick={() => setEditing(true)}
        >
          Edit result before verifying
        </button>
      )}

      <LabAttachments
        orderId={order.id}
        itemId={item.id}
        canUpload={item.status !== S.CANCELLED}
        canDelete={item.status !== S.VERIFIED && item.status !== S.CANCELLED}
      />
      {item.status === S.VERIFIED && <LabAmendmentTrail orderId={order.id} itemId={item.id} />}
      {!showForm && !amending && (
        <LabItemActions
          status={item.status}
          busy={busy}
          onMove={move}
          onVerify={verify}
          onAmend={() => setAmending(true)}
        />
      )}
    </section>
  );
}
