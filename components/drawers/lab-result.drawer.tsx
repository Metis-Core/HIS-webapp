'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Button, Drawer, Dropdown, Input, Pill } from '@/components';
import { ButtonVariantEnum, LabOrderItemStatusEnum, PillVariantEnum } from '@/enum';
import { labOrdersService } from '@/helpers/lab.service';
import type { ILabOrder, ILabOrderItem, IOption } from '@/interfaces';

interface LabResultDrawerProps {
  open: boolean;
  order: ILabOrder | null;
  onClose: () => void;
  onSaved: () => void | Promise<void>;
}

const statusOptions: IOption[] = Object.values(LabOrderItemStatusEnum).map((v) => ({
  label: v.replaceAll('_', ' '),
  value: v,
}));

interface Draft {
  status: LabOrderItemStatusEnum;
  resultValue: string;
  resultNotes: string;
  isAbnormal: boolean;
}

const draftFromItem = (item: ILabOrderItem): Draft => ({
  status: item.status,
  resultValue: item.resultValue ?? '',
  resultNotes: item.resultNotes ?? '',
  isAbnormal: item.isAbnormal ?? false,
});

export default function LabResultDrawer({ open, order, onClose, onSaved }: LabResultDrawerProps) {
  const [drafts, setDrafts] = useState<Record<string, Draft>>({});
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !order) {
      setDrafts({});
      return;
    }
    const next: Record<string, Draft> = {};
    order.items.forEach((it) => {
      next[it.id] = draftFromItem(it);
    });
    setDrafts(next);
  }, [open, order]);

  if (!open || !order) return null;

  const setField = <K extends keyof Draft>(itemId: string, key: K, value: Draft[K]) =>
    setDrafts((s) => ({ ...s, [itemId]: { ...s[itemId], [key]: value } }));

  const submit = async (item: ILabOrderItem) => {
    const draft = drafts[item.id];
    if (!draft) return;
    setBusy(item.id);
    try {
      await toast.promise(
        labOrdersService.updateItem(order.id, item.id, {
          status: draft.status,
          resultValue: draft.resultValue.trim() || undefined,
          resultNotes: draft.resultNotes.trim() || undefined,
          isAbnormal: draft.isAbnormal,
        }),
        {
          loading: 'Saving result…',
          success: 'Result saved',
          error: "Couldn't save — retry",
        },
      );
      await onSaved();
    } finally {
      setBusy(null);
    }
  };

  return (
    <Drawer open={open} onClose={onClose} title="Lab results" width="w-[780px]">
      <div className="flex flex-col gap-4">
        <header className="rounded-md border border-line bg-surface p-3 text-sm">
          <p className="font-semibold text-ink">
            {order.patient ? `${order.patient.firstName} ${order.patient.lastName}` : 'Patient'}
          </p>
          <p className="text-xs text-ink-muted">
            MRN {order.patient?.mrn ?? '—'} · Priority {order.priority} · {order.status.replaceAll('_', ' ')}
          </p>
        </header>

        {order.items.map((item) => {
          const draft = drafts[item.id];
          if (!draft) return null;
          return (
            <section key={item.id} className="flex flex-col gap-3 rounded-md border border-line bg-surface-raised p-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-ink">
                    {item.test ? `${item.test.code} — ${item.test.name}` : 'Test'}
                  </p>
                  {item.test?.referenceRange && (
                    <p className="text-xs text-ink-muted">
                      Reference: {item.test.referenceRange} {item.test.unit ?? ''}
                    </p>
                  )}
                </div>
                <Pill
                  variant={
                    draft.status === LabOrderItemStatusEnum.RESULT_READY
                      ? PillVariantEnum.SUCCESS
                      : draft.status === LabOrderItemStatusEnum.CANCELLED
                        ? PillVariantEnum.DEFAULT
                        : PillVariantEnum.INFO
                  }
                >
                  {draft.status.replaceAll('_', ' ')}
                </Pill>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Dropdown
                  label="Status"
                  options={statusOptions}
                  value={statusOptions.find((o) => o.value === draft.status) ?? null}
                  onChange={(o) => setField(item.id, 'status', (o as IOption).value as LabOrderItemStatusEnum)}
                />
                <Input
                  label={`Result value${item.test?.unit ? ` (${item.test.unit})` : ''}`}
                  value={draft.resultValue}
                  onChange={(e) => setField(item.id, 'resultValue', e.target.value)}
                />
              </div>

              <Input
                label="Notes"
                value={draft.resultNotes}
                onChange={(e) => setField(item.id, 'resultNotes', e.target.value)}
              />

              <label className="flex items-center gap-2 text-sm text-ink">
                <input
                  type="checkbox"
                  checked={draft.isAbnormal}
                  onChange={(e) => setField(item.id, 'isAbnormal', e.target.checked)}
                />
                Flag as abnormal
              </label>

              <div className="flex justify-end">
                <Button
                  type="button"
                  variant={ButtonVariantEnum.PRIMARY}
                  loading={busy === item.id}
                  onClick={() => submit(item)}
                >
                  Save
                </Button>
              </div>
            </section>
          );
        })}
      </div>
    </Drawer>
  );
}
