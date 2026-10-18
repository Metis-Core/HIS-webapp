'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Button, Dropdown, Input } from '@/components';
import { ButtonVariantEnum, TriageCategoryEnum } from '@/enum';
import { extractErrorMessage } from '@/helpers/errors';
import visitsService from '@/helpers/visits.service';
import type { IOption } from '@/interfaces';

const options: IOption[] = [
  { label: 'Red — immediate', value: TriageCategoryEnum.RED },
  { label: 'Yellow — urgent', value: TriageCategoryEnum.YELLOW },
  { label: 'Green — can wait', value: TriageCategoryEnum.GREEN },
];

type Props = {
  visitId: string;
  current: TriageCategoryEnum | null;
  onChanged: () => Promise<unknown> | void;
};

/** Staff override of a visit's triage colour; the reason is required and kept in the audit log (R9). */
export default function PriorityControl({ visitId, current, onChanged }: Props) {
  const [category, setCategory] = useState<IOption | null>(options.find((o) => o.value === current) ?? null);
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);
  const canSave = Boolean(category) && category?.value !== current && reason.trim().length >= 3 && !saving;

  const save = async () => {
    if (!category || !canSave) return;
    setSaving(true);
    try {
      await toast
        .promise(
          visitsService.changePriority(visitId, {
            triageCategory: category.value as TriageCategoryEnum,
            reason: reason.trim(),
          }),
          {
            loading: 'Updating priority…',
            success: 'Priority updated in every queue',
            error: (err: unknown) => extractErrorMessage(err, "Couldn't update priority — retry"),
          },
        )
        .unwrap();
      setReason('');
      await onChanged();
    } catch {
      // The toast already shows the reason.
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="flex flex-col gap-3 rounded-lg border border-line bg-surface-raised p-5">
      <div>
        <h3 className="text-sm font-semibold text-ink">Triage colour</h3>
        <p className="text-xs text-ink-muted">Changes apply to every open stage of this visit.</p>
      </div>
      <Dropdown
        label="Colour"
        placeholder="Not set"
        options={options}
        value={category}
        onChange={(value) => setCategory(Array.isArray(value) ? (value[0] ?? null) : value)}
      />
      <Input
        label="Reason"
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder="e.g. Deteriorating vitals"
      />
      <Button type="button" variant={ButtonVariantEnum.SECONDARY} onClick={save} disabled={!canSave}>
        Update priority
      </Button>
    </section>
  );
}
