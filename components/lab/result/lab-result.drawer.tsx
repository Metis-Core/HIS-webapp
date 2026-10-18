'use client';

import { useState } from 'react';
import { DocumentButton, Drawer } from '@/components';
import { DocumentEndpointEnum } from '@/enum';
import type { ILabOrder } from '@/interfaces';
import LabItemCard from './lab-item-card';

interface LabResultDrawerProps {
  open: boolean;
  order: ILabOrder | null;
  onClose: () => void;
  onSaved: () => void | Promise<void>;
}

/** The bench view of one order: every test with its own step, plus printing (L1, L7). */
export default function LabResultDrawer({ open, order, onClose, onSaved }: LabResultDrawerProps) {
  // The latest copy the API returned for this order, until the parent hands over a different order.
  const [saved, setSaved] = useState<ILabOrder | null>(null);
  const current = saved && saved.id === order?.id ? saved : order;
  if (!open || !current) return null;

  const changed = (next: ILabOrder) => {
    setSaved({ ...next, patient: next.patient ?? current.patient });
    void onSaved();
  };

  return (
    <Drawer open={open} onClose={onClose} title="Lab results" width="w-[820px]">
      <div className="flex flex-col gap-4">
        <header className="rounded-lg border border-line bg-surface p-3 text-sm">
          <p className="font-semibold text-ink">
            {current.patient ? `${current.patient.firstName} ${current.patient.lastName}` : 'Patient'}
          </p>
          <p className="text-xs capitalize text-ink-muted">
            MRN {current.patient?.mrn ?? '—'} · Priority {current.priority} · {current.status.replaceAll('_', ' ')}
            {current.referringClinician ? ` · Referred by ${current.referringClinician}` : ''}
          </p>
          {current.clinicalNotes && <p className="mt-1 text-xs text-ink-muted">Notes: {current.clinicalNotes}</p>}
        </header>
        {current.items.map((item) => (
          <LabItemCard key={item.id} order={current} item={item} onChanged={changed} />
        ))}
        <div className="flex justify-end gap-2">
          <DocumentButton endpoint={DocumentEndpointEnum.LAB_ORDER} id={current.id}>
            Print order report
          </DocumentButton>
          {current.visitId && (
            <DocumentButton endpoint={DocumentEndpointEnum.LAB_REPORT_VISIT} id={current.visitId}>
              Print visit report
            </DocumentButton>
          )}
        </div>
      </div>
    </Drawer>
  );
}
