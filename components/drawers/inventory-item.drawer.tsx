'use client';

import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Button, Drawer, Dropdown, Input } from '@/components';
import { ButtonVariantEnum, InventoryItemTypeEnum, ModalDrawerModeEnum, UnitOfMeasureEnum } from '@/enum';
import { useActiveInventoryStores } from '@/hooks';
import type {
  ICreateInventoryItemDto,
  IInventoryItem,
  IOption,
  IUpdateInventoryItemDto,
  QuantityUnit,
} from '@/interfaces';

const emptyValues = {
  sku: '',
  name: '',
  description: '',
  type: InventoryItemTypeEnum.CONSUMABLE,
  unitOfMeasure: UnitOfMeasureEnum.PCS,
  packSize: '1',
  packUnit: UnitOfMeasureEnum.BOX,
  openingStoreId: '',
  openingQuantity: '',
  openingUnit: 'UNIT' as QuantityUnit,
  openingBatch: '',
  openingExpiry: '',
  minStockLevel: '0',
  unitPrice: '0',
  manufacturer: '',
  strength: '',
  dosageForm: '',
  genericName: '',
  isControlled: false,
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
  const { stores } = useActiveInventoryStores();
  const storeOptions: IOption[] = useMemo(() => stores.map((s) => ({ label: s.name, value: s.id })), [stores]);
  const openingStoreId = values.openingStoreId || stores[0]?.id || '';

  useEffect(() => {
    if (!open) return;
    if (isEdit && item) {
      setValues({
        sku: item.sku,
        name: item.name,
        description: item.description ?? '',
        type: item.type,
        unitOfMeasure: item.unitOfMeasure,
        packSize: String(item.packSize ?? 1),
        packUnit: item.packUnit ?? UnitOfMeasureEnum.BOX,
        openingStoreId: '',
        openingQuantity: '',
        openingUnit: 'UNIT',
        openingBatch: '',
        openingExpiry: '',
        minStockLevel: String(item.minStockLevel),
        unitPrice: String(item.unitPrice),
        manufacturer: item.manufacturer ?? '',
        strength: item.strength ?? '',
        dosageForm: item.dosageForm ?? '',
        genericName: item.genericName ?? '',
        isControlled: item.isControlled ?? false,
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
      const packSize = Number(values.packSize);
      if (!Number.isInteger(packSize) || packSize < 1) {
        toast.error('Units per pack must be a whole number of at least 1');
        return;
      }
      const openingQty = Number(values.openingQuantity);
      const hasOpening = !isEdit && values.openingQuantity.trim() !== '' && openingQty > 0;
      if (hasOpening && (!Number.isInteger(openingQty) || !openingStoreId)) {
        toast.error('Opening stock needs a store and a whole-number quantity');
        return;
      }

      const payload: ICreateInventoryItemDto | IUpdateInventoryItemDto = {
        sku: values.sku.trim().toUpperCase(),
        name: values.name.trim(),
        description: values.description.trim() || undefined,
        type: values.type,
        unitOfMeasure: values.unitOfMeasure,
        packSize,
        packUnit: values.packUnit,
        minStockLevel: Number(values.minStockLevel),
        unitPrice: Number(values.unitPrice),
        manufacturer: values.manufacturer.trim() || undefined,
        strength: values.strength.trim() || undefined,
        dosageForm: values.dosageForm.trim() || undefined,
        genericName: values.genericName.trim() || undefined,
        isControlled: values.isControlled,
        isActive: values.isActive,
        ...(hasOpening
          ? {
              initialStock: {
                storeId: openingStoreId,
                quantity: openingQty,
                quantityUnit: values.openingUnit,
                batchNumber: values.openingBatch.trim() || undefined,
                expiryDate: values.openingExpiry || undefined,
              },
            }
          : {}),
      };
      await onSave(payload, item?.id);
      onClose();
    } catch {
      // The caller already toasted the error; keep the drawer open for a retry.
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
            label="Dispensing unit (what is counted, e.g. PCS = tablets)"
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
          <Dropdown
            label="Pack type (how it is bought)"
            options={unitOptions}
            value={unitOptions.find((o) => o.value === values.packUnit) ?? null}
            onChange={(o) => set('packUnit', (o as IOption).value as UnitOfMeasureEnum)}
          />
          <Input
            label={`${values.unitOfMeasure} per ${values.packUnit}`}
            type="number"
            min={1}
            value={values.packSize}
            onChange={(e) => set('packSize', e.target.value)}
          />
        </div>
        <p className="-mt-2 text-xs text-ink-muted">
          Stock is always counted in {values.unitOfMeasure}. A pack of {values.packSize || 1} {values.unitOfMeasure} is
          converted automatically when you receive stock by the {values.packUnit}.
        </p>
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Reorder / min level"
            type="number"
            value={values.minStockLevel}
            onChange={(e) => set('minStockLevel', e.target.value)}
          />
          <p className="self-end pb-2 text-xs text-ink-muted">
            A low-stock warning appears when available quantity drops to this level.
          </p>
        </div>
        <Input label="Manufacturer" value={values.manufacturer} onChange={(e) => set('manufacturer', e.target.value)} />

        {values.type === InventoryItemTypeEnum.MEDICATION && (
          <div className="flex flex-col gap-3 rounded-lg border border-line bg-surface p-3">
            <p className="text-xs font-medium uppercase tracking-wide text-ink-muted">Medication details</p>
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Generic name"
                value={values.genericName}
                onChange={(e) => set('genericName', e.target.value)}
                placeholder="e.g. Paracetamol"
              />
              <Input
                label="Strength"
                value={values.strength}
                onChange={(e) => set('strength', e.target.value)}
                placeholder="e.g. 500 mg"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Dosage form"
                value={values.dosageForm}
                onChange={(e) => set('dosageForm', e.target.value)}
                placeholder="tablet, syrup, injection…"
              />
              <label className="mt-6 flex items-center gap-2 text-sm text-ink">
                <input
                  type="checkbox"
                  checked={values.isControlled}
                  onChange={(e) => set('isControlled', e.target.checked)}
                />
                Controlled substance (extra dispensing safeguards)
              </label>
            </div>
          </div>
        )}

        <label className="flex items-center gap-2 text-sm text-ink">
          <input type="checkbox" checked={values.isActive} onChange={(e) => set('isActive', e.target.checked)} />
          Active
        </label>

        {!isEdit && (
          <div className="flex flex-col gap-3 rounded-lg border border-line bg-surface p-3">
            <p className="text-xs font-medium uppercase tracking-wide text-ink-muted">Opening stock (optional)</p>
            <div className="grid grid-cols-2 gap-3">
              <Dropdown
                label="Store"
                options={storeOptions}
                value={storeOptions.find((o) => o.value === openingStoreId) ?? null}
                onChange={(o) => set('openingStoreId', (o as IOption).value as string)}
              />
              <div className="grid grid-cols-2 gap-2">
                <Input
                  label="Quantity"
                  type="number"
                  min={0}
                  value={values.openingQuantity}
                  onChange={(e) => set('openingQuantity', e.target.value)}
                />
                <label className="flex flex-col gap-1 text-sm text-ink">
                  <span className="text-xs font-medium text-ink-muted">Counted in</span>
                  <select
                    value={values.openingUnit}
                    onChange={(e) => set('openingUnit', e.target.value as QuantityUnit)}
                    className="rounded-lg border border-line bg-surface-raised px-3 py-2 text-sm outline-none focus:border-brand focus:ring-1 focus:ring-brand"
                  >
                    <option value="UNIT">{values.unitOfMeasure}</option>
                    <option value="PACK">{values.packUnit}</option>
                  </select>
                </label>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Batch number"
                value={values.openingBatch}
                onChange={(e) => set('openingBatch', e.target.value)}
              />
              <Input
                label="Expiry date"
                type="date"
                value={values.openingExpiry}
                onChange={(e) => set('openingExpiry', e.target.value)}
              />
            </div>
            {stores.length === 0 && (
              <p className="text-xs text-ink-muted">
                No active store yet — create one under the Stores tab to add opening stock.
              </p>
            )}
          </div>
        )}

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
