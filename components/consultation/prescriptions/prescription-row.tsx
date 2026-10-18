'use client';

import { FaTrash } from 'react-icons/fa';
import { Input } from '@/components';
import RemoteSearchSelect from '@/components/inputs/remote-search-select';
import { InventoryItemTypeEnum } from '@/enum';
import { inventoryItemsService } from '@/helpers/inventory.service';
import { PICKER_PAGE_SIZE } from '@/helpers/pagination';
import type { IInventoryItem, IOption } from '@/interfaces';
import type { PrescriptionRowDraft } from './use-prescription-form';

const medicationOption = (i: IInventoryItem): IOption => ({
  label: `${i.name}${i.manufacturer ? ` (${i.manufacturer})` : ''} — ${i.sku}`,
  value: i.id,
});
const buildMedicationUrl = (search: string) =>
  inventoryItemsService.buildListUrl({
    search: search || undefined,
    isActive: true,
    type: InventoryItemTypeEnum.MEDICATION,
    limit: PICKER_PAGE_SIZE,
  });

interface PrescriptionRowProps {
  row: PrescriptionRowDraft;
  onChange: (patch: Partial<PrescriptionRowDraft>) => void;
  onRemove: () => void;
}

const TEXT_FIELDS: Array<[keyof Omit<PrescriptionRowDraft, 'item' | 'quantity'>, string, string]> = [
  ['dosage', 'Dosage', '500mg'],
  ['frequency', 'Frequency', 'TDS'],
  ['duration', 'Duration', '5 days'],
];

export default function PrescriptionRow({ row, onChange, onRemove }: PrescriptionRowProps) {
  return (
    <div className="grid grid-cols-12 items-end gap-2">
      <div className="col-span-4">
        <RemoteSearchSelect<IInventoryItem>
          label="Medication"
          placeholder="Search medication…"
          value={row.item}
          onChange={(item) => onChange({ item })}
          buildUrl={buildMedicationUrl}
          toOption={medicationOption}
          noun="medications"
        />
      </div>
      {TEXT_FIELDS.map(([key, label, placeholder]) => (
        <div key={key} className="col-span-2">
          <Input
            label={label}
            value={row[key]}
            onChange={(e) => onChange({ [key]: e.target.value })}
            placeholder={placeholder}
          />
        </div>
      ))}
      <div className="col-span-1">
        <Input
          label="Qty"
          type="number"
          value={row.quantity}
          onChange={(e) => onChange({ quantity: e.target.value })}
        />
      </div>
      <button
        type="button"
        onClick={onRemove}
        className="col-span-1 mb-1 text-critical hover:opacity-80"
        aria-label="Remove"
      >
        <FaTrash className="text-sm" />
      </button>
    </div>
  );
}
