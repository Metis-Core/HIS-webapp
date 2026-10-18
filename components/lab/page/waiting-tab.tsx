'use client';

import { FaClipboardList } from 'react-icons/fa';
import { toast } from 'sonner';
import { EmptyState } from '@/components';
import { QueueEntryStatusEnum } from '@/enum';
import { extractErrorMessage } from '@/helpers/errors';
import type { IQueueEntryRecord } from '@/interfaces';
import { TH } from './lab-filters';
import WaitingRow, { type WaitingActions } from './waiting-row';

interface QueueControls {
  call: (id: string) => Promise<unknown>;
  start: (id: string) => Promise<unknown>;
  complete: (id: string) => Promise<unknown>;
  skip: (id: string) => Promise<unknown>;
}

interface WaitingTabProps {
  entries: IQueueEntryRecord[];
  queue: QueueControls;
  onOpen: WaitingActions['onOpen'];
  onOrder: WaitingActions['onOrder'];
}

const attempt = async (work: () => Promise<unknown>, success: string, failure: string) => {
  try {
    await work();
    toast.success(success);
  } catch (err) {
    toast.error(extractErrorMessage(err, failure));
  }
};

/** Patients sent to the main laboratory, including lab-only walk-ins. */
export default function WaitingTab({ entries, queue, onOpen, onOrder }: WaitingTabProps) {
  const actions: WaitingActions = {
    onOpen,
    onOrder,
    onCall: (e) => attempt(() => queue.call(e.id), 'Patient called', "Couldn't call — retry"),
    onStart: (e) =>
      attempt(
        async () => {
          if (e.status === QueueEntryStatusEnum.WAITING) await queue.call(e.id);
          await queue.start(e.id);
        },
        'Service started',
        "Couldn't start — retry",
      ),
    onComplete: (e) => attempt(() => queue.complete(e.id), 'Completed — next stage advanced', "Couldn't complete"),
    onSkip: (e) => {
      if (confirm('Skip this patient?')) void attempt(() => queue.skip(e.id), 'Skipped', "Couldn't skip — retry");
    },
  };

  if (entries.length === 0) return <EmptyState message="Nobody waiting for lab" icon={FaClipboardList} />;
  return (
    <div className="overflow-hidden rounded-lg border border-line bg-surface-raised">
      <table className="w-full text-left">
        <thead className="border-b border-line bg-surface text-ink-muted">
          <tr>
            <th className={TH}>Patient</th>
            <th className={TH}>Orders</th>
            <th className={TH}>Sequence</th>
            <th className={TH}>Status</th>
            <th className={`${TH} text-right`}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((e) => (
            <WaitingRow key={e.id} entry={e} actions={actions} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
