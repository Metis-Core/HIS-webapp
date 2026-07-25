'use client';

import { format } from 'date-fns';
import Drawer from './drawer';
import Button from '../buttons/button';
import { ButtonVariantEnum } from '@/enum';
import type { IPatientHistoryEvent } from '@/data/patient-history';

type VisitDrawerProps = {
  visit: IPatientHistoryEvent | null;
  onClose: () => void;
};

function DetailRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-zinc-400">{label}</dt>
      <dd className="mt-1 text-zinc-900">{value?.trim() ? value : '—'}</dd>
    </div>
  );
}

export default function VisitDrawer({ visit, onClose }: VisitDrawerProps) {
  return (
    <Drawer open={visit !== null} onClose={onClose} title={visit?.title ?? 'Visit details'}>
      {visit && (
        <div className="flex flex-col gap-6">
          <div className="rounded-lg bg-green-50 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-green-800">
              {visit.type.replace('-', ' ')}
            </p>
            <p className="mt-1 text-sm text-green-900">{format(visit.date, 'EEEE, dd MMM yyyy · HH:mm')}</p>
          </div>

          <dl className="grid gap-4 sm:grid-cols-2">
            <DetailRow label="Handled by" value={visit.handledBy} />
            <DetailRow label="Department" value={visit.department} />
            <div className="sm:col-span-2">
              <DetailRow label="Summary" value={visit.description} />
            </div>
            {visit.notes && (
              <div className="sm:col-span-2">
                <DetailRow label="Clinical / visit notes" value={visit.notes} />
              </div>
            )}
            {visit.outcome && (
              <div className="sm:col-span-2">
                <DetailRow label="Outcome" value={visit.outcome} />
              </div>
            )}
          </dl>

          <div className="flex justify-end border-t border-zinc-100 pt-5">
            <Button type="button" variant={ButtonVariantEnum.GHOST} onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      )}
    </Drawer>
  );
}
