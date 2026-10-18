'use client';

import Link from 'next/link';
import { toast } from 'sonner';
import { FaBaby } from 'react-icons/fa';
import { Button, EmptyState, Pill } from '@/components';
import PriorityBadge from '@/components/queue/priority-badge';
import { ButtonVariantEnum, DepartmentEnum, PillVariantEnum, QueueEntryStatusEnum } from '@/enum';
import { extractErrorMessage } from '@/helpers/errors';
import { useDepartmentQueue } from '@/hooks';

const minutesSince = (iso: string | Date) => Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));

const TH = 'px-4 py-2.5 text-xs font-medium uppercase tracking-wide';

/** Mothers and babies waiting for antenatal, birth, postnatal or immunization care; records are entered on the visit. */
export default function MaternityWaiting() {
  const { entries, call, skip } = useDepartmentQueue(DepartmentEnum.ANTENATAL);

  const run = async (action: () => Promise<unknown>, done: string) => {
    try {
      await action();
      toast.success(done);
    } catch (err) {
      toast.error(extractErrorMessage(err, 'Something went wrong — retry'));
    }
  };

  if (entries.length === 0) return <EmptyState message="Nobody waiting for this clinic" icon={FaBaby} />;

  return (
    <div className="overflow-hidden rounded-lg border border-line bg-surface-raised">
      <table className="w-full text-left">
        <thead className="border-b border-line bg-surface text-ink-muted">
          <tr>
            <th className={TH}>Patient</th>
            <th className={TH}>Status</th>
            <th className={TH}>Waiting</th>
            <th className={`${TH} text-right`}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => {
            const patient = entry.visit?.patient;
            const minutes = minutesSince(entry.createdAt);
            return (
              <tr key={entry.id} className="border-b border-line last:border-0">
                <td className="px-4 py-3">
                  <div className="text-sm font-medium text-ink">
                    {patient ? `${patient.firstName} ${patient.lastName}` : '—'}
                  </div>
                  <div className="text-xs text-ink-muted">{patient?.mrn}</div>
                  <PriorityBadge visit={entry.visit} />
                </td>
                <td className="px-4 py-3">
                  <Pill
                    variant={
                      entry.status === QueueEntryStatusEnum.WAITING ? PillVariantEnum.WARNING : PillVariantEnum.INFO
                    }
                  >
                    {entry.status.replaceAll('_', ' ')}
                  </Pill>
                </td>
                <td className="px-4 py-3 text-xs tabular-nums text-ink-muted">{minutes} min</td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    {entry.status === QueueEntryStatusEnum.WAITING && (
                      <Button
                        type="button"
                        variant={ButtonVariantEnum.SECONDARY}
                        onClick={() => void run(() => call(entry.id), 'Patient called')}
                      >
                        Call
                      </Button>
                    )}
                    <Link
                      href={`/queue/${entry.visitId}`}
                      className="inline-flex items-center rounded-lg bg-brand px-3 py-2 text-xs font-medium text-white"
                    >
                      Open visit
                    </Link>
                    <Button
                      type="button"
                      variant={ButtonVariantEnum.SECONDARY}
                      onClick={() => void run(() => skip(entry.id), 'Skipped')}
                    >
                      Skip
                    </Button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
