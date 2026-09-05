'use client';

import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Button, Drawer, Dropdown, Input } from '@/components';
import { ButtonVariantEnum, InventoryItemTypeEnum, ModalDrawerModeEnum, UnitOfMeasureEnum } from '@/enum';
import type { ICreateInventoryItemDto, IInventoryItem, IOption, IUpdateInventoryItemDto } from '@/interfaces';

const emptyValues = {
  sku: '',
  name: '',
  description: '',
  type: InventoryItemTypeEnum.CONSUMABLE,
  unitOfMeasure: UnitOfMeasureEnum.PCS,
  minStockLevel: '0',
  reorderLevel: '0',
  unitPrice: '0',
  manufacturer: '',
  isActive: true,
};

type FormState = typeof emptyValues;

interface InventoryItemDrawerProps {
  mode: ModalDrawerModeEnum | null;
  item: IInventoryItem | null;
  onClose: () => void;
  onSave: (payload: ICreateInventoryItemDto | IUpdateInventoryItemDto, id?: string) => Promise<void>;
}

const typeOptions: IOption[] = Object.values(InventoryItemTypeEnum).map((v) => ({
  label: v,
  value: v,
}));
const unitOptions: IOption[] = Object.values(UnitOfMeasureEnum).map((v) => ({
  label: v,
  value: v,
}));

export default function InventoryItemDrawer({ mode, item, onClose, onSave }: InventoryItemDrawerProps) {
  const open = mode !== null;
  const isEdit = mode === ModalDrawerModeEnum.EDIT;
  const [values, setValues] = useState<FormState>(emptyValues);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (isEdit && item) {
      setValues({
        sku: item.sku,
        name: item.name,
        description: item.description ?? '',
        type: item.type,
        unitOfMeasure: item.unitOfMeasure,
        minStockLevel: String(item.minStockLevel),
        reorderLevel: String(item.reorderLevel),
        unitPrice: String(item.unitPrice),
        manufacturer: item.manufacturer ?? '',
        isActive: item.isActive,
      });
    } else {
      setValues(emptyValues);
    }
  }, [item, isEdit, open]);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => setValues((s) => ({ ...s, [key]: value }));

  const submit = async () => {
    if (!values.sku.trim() || !values.name.trim()) {
      toast.error('SKU and name are required');
      return;
    }
    setBusy(true);
    try {
      const payload: ICreateInventoryItemDto | IUpdateInventoryItemDto = {
        sku: values.sku.trim().toUpperCase(),
        name: values.name.trim(),
        description: values.description.trim() || undefined,
        type: values.type,
        unitOfMeasure: values.unitOfMeasure,
        minStockLevel: Number(values.minStockLevel),
        reorderLevel: Number(values.reorderLevel),
        unitPrice: Number(values.unitPrice),
        manufacturer: values.manufacturer.trim() || undefined,
        isActive: values.isActive,
      };
      await onSave(payload, item?.id);
      onClose();
    } finally {
      setBusy(false);
    }
  };

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={isEdit ? `Edit ${item?.name ?? 'item'}` : 'New inventory item'}
      width="w-[640px]"
    >
      <form
        className="flex flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="SKU"
            required
            value={values.sku}
            onChange={(e) => set('sku', e.target.value)}
            placeholder="MED-001"
          />
          <Dropdown
            label="Type"
            options={typeOptions}
            value={typeOptions.find((o) => o.value === values.type) ?? null}
            onChange={(o) => set('type', (o as IOption).value as InventoryItemTypeEnum)}
          />
        </div>
        <Input label="Name" required value={values.name} onChange={(e) => set('name', e.target.value)} />
        <Input label="Description" value={values.description} onChange={(e) => set('description', e.target.value)} />
        <div className="grid grid-cols-2 gap-3">
          <Dropdown
            label="Unit of measure"
            options={unitOptions}
            value={unitOptions.find((o) => o.value === values.unitOfMeasure) ?? null}
            onChange={(o) => set('unitOfMeasure', (o as IOption).value as UnitOfMeasureEnum)}
          />
          <Input
            label="Unit price"
            type="number"
            value={values.unitPrice}
            onChange={(e) => set('unitPrice', e.target.value)}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Min stock level"
            type="number"
            value={values.minStockLevel}
            onChange={(e) => set('minStockLevel', e.target.value)}
          />
          <Input
            label="Reorder level"
            type="number"
            value={values.reorderLevel}
            onChange={(e) => set('reorderLevel', e.target.value)}
          />
        </div>
        <Input label="Manufacturer" value={values.manufacturer} onChange={(e) => set('manufacturer', e.target.value)} />
        <label className="flex items-center gap-2 text-sm text-ink">
          <input type="checkbox" checked={values.isActive} onChange={(e) => set('isActive', e.target.checked)} />
          Active
        </label>

        <div className="mt-2 flex justify-end gap-2">
          <Button type="button" variant={ButtonVariantEnum.GHOST} onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant={ButtonVariantEnum.PRIMARY} loading={busy}>
            {isEdit ? 'Save changes' : 'Create item'}
          </Button>
        </div>
      </form>
    </Drawer>
  );
}
