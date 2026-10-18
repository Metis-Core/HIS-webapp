'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { FaPlus } from 'react-icons/fa';
import { Button, Dropdown, Input } from '@/components';
import LabTestPicker from '@/components/consultation/lab-test-picker';
import { ButtonVariantEnum, LabPriorityEnum } from '@/enum';
import consultationsService from '@/helpers/consultations.service';
import { extractErrorMessage } from '@/helpers/errors';
import type { ILabTest, IOption } from '@/interfaces';

const priorityOptions: IOption[] = Object.values(LabPriorityEnum).map((v) => ({ label: v, value: v }));

interface LabOrderFormProps {
  consultationId: string;
  onOrdered: () => Promise<unknown>;
}

export default function LabOrderForm({ consultationId, onOrdered }: LabOrderFormProps) {
  const [selected, setSelected] = useState<ILabTest[]>([]);
  const [priority, setPriority] = useState<LabPriorityEnum>(LabPriorityEnum.ROUTINE);
  const [notes, setNotes] = useState('');
  const [busy, setBusy] = useState(false);
  const total = selected.reduce((sum, t) => sum + t.price, 0);

  const submit = async () => {
    if (selected.length === 0) {
      toast.error('Select at least one test');
      return;
    }
    setBusy(true);
    try {
      const dto = {
        priority,
        clinicalNotes: notes.trim() || undefined,
        items: selected.map((t) => ({ testId: t.id })),
      };
      await toast
        .promise(consultationsService.orderLabs(consultationId, dto), {
          loading: 'Sending order to lab…',
          success: 'Order sent to laboratory',
          error: (err) => extractErrorMessage(err, "Couldn't send — retry"),
        })
        .unwrap();
      setSelected([]);
      setNotes('');
      await onOrdered();
    } catch {
      // The toast already reported the failure.
    } finally {
      setBusy(false);
    }
  };

  const count = selected.length;
  return (
    <section className="flex flex-col gap-3 rounded-lg border border-line bg-surface-raised p-5">
      <div className="flex items-center gap-2">
        <FaPlus className="text-brand" />
        <h3 className="text-sm font-semibold text-ink">Order new tests</h3>
        <span className="ml-auto text-xs text-ink-muted">Sent to the laboratory queue on order.</span>
      </div>
      <LabTestPicker selected={selected} onChange={setSelected} />
      <div className="grid grid-cols-2 gap-2">
        <Dropdown
          label="Priority"
          options={priorityOptions}
          value={priorityOptions.find((o) => o.value === priority) ?? null}
          onChange={(o) => setPriority((o as IOption).value as LabPriorityEnum)}
        />
        <Input label="Clinical notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
      </div>
      <div className="flex items-center justify-end gap-4">
        {count > 0 && (
          <span className="text-sm text-ink-muted">
            Total <span className="font-semibold tabular-nums text-ink">UGX {total.toLocaleString()}</span>
          </span>
        )}
        <Button type="button" variant={ButtonVariantEnum.PRIMARY} loading={busy} onClick={submit}>
          <FaPlus className="text-xs" />
          Order {count > 0 ? `${count} test${count === 1 ? '' : 's'}` : 'tests'}
        </Button>
      </div>
    </section>
  );
}
