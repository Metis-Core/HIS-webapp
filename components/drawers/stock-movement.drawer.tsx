'use client';

import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Button, Drawer, Dropdown, Input } from '@/components';
import { ButtonVariantEnum, InventoryTransactionTypeEnum } from '@/enum';
import { extractErrorMessage } from '@/helpers/errors';
import { formatStockQuantity } from '@/helpers/inventory.format';
import { useActiveInventoryStores } from '@/hooks';
import type {
  ICreateInventoryTransactionDto,
  IInventoryItem,
  IInventoryStock,
  IOption,
  QuantityUnit,
} from '@/interfaces';

const ACTIONS: Array<{ type: InventoryTransactionTypeEnum; label: string; sign: 1 | -1 }> = [
  { type: InventoryTransactionTypeEnum.RECEIPT, label: 'Receive stock (add)', sign: 1 },
  { type: InventoryTransactionTypeEnum.ADJUSTMENT_IN, label: 'Count correction (add)', sign: 1 },
  { type: InventoryTransactionTypeEnum.ADJUSTMENT_OUT, label: 'Count correction (remove)', sign: -1 },
  { type: InventoryTransactionTypeEnum.DISPOSAL, label: 'Dispose (expired / damaged)', sign: -1 },
];

const actionOptions: IOption[] = ACTIONS.map((a) => ({ label: a.label, value: a.type }));

interface StockMovementDrawerProps {
  item: IInventoryItem | null;
  stock: IInventoryStock[];
  onClose: () => void;
  onSubmit: (dto: ICreateInventoryTransactionDto) => Promise<unknown>;
}

export default function StockMovementDrawer({ item, stock, onClose, onSubmit }: StockMovementDrawerProps) {
  return (
    <Drawer open={item !== null} onClose={onClose} title={item ? `Stock: ${item.name}` : 'Stock'} width="w-[520px]">
      {item && <StockMovementForm key={item.id} item={item} stock={stock} onClose={onClose} onSubmit={onSubmit} />}
    </Drawer>
  );
}

function StockMovementForm({
  item,
  stock,
  onClose,
  onSubmit,
}: Omit<StockMovementDrawerProps, 'item'> & { item: IInventoryItem }) {
  const { stores } = useActiveInventoryStores();
  const [chosenStoreId, setStoreId] = useState('');
  const [type, setType] = useState<InventoryTransactionTypeEnum>(InventoryTransactionTypeEnum.RECEIPT);
  const [quantity, setQuantity] = useState('');
  const packed = item.packSize > 1;
  const [unit, setUnit] = useState<QuantityUnit>(packed ? 'PACK' : 'UNIT');
  const [batchNumber, setBatchNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [notes, setNotes] = useState('');
  const [busy, setBusy] = useState(false);

  const storeId = chosenStoreId || stores[0]?.id || '';
  const action = ACTIONS.find((a) => a.type === type)!;

  const storeOptions: IOption[] = useMemo(() => stores.map((s) => ({ label: s.name, value: s.id })), [stores]);

  const onHand = useMemo(
    () => stock.find((s) => s.storeId === storeId && s.itemId === item?.id)?.quantity ?? 0,
    [stock, storeId, item],
  );

  const qty = Number(quantity);
  const validQty = Number.isInteger(qty) && qty > 0;
  const units = validQty ? qty * (unit === 'PACK' ? (item?.packSize ?? 1) : 1) : 0;
  const after = onHand + action.sign * units;

  const submit = async () => {
    if (!item) return;
    if (!storeId) return toast.error('Choose a store');
    if (!validQty) return toast.error('Enter a whole number greater than zero');
    if (after < 0) return toast.error(`Only ${formatStockQuantity(onHand, item)} on hand in this store`);

    setBusy(true);
    try {
      await onSubmit({
        storeId,
        itemId: item.id,
        type,
        quantity: qty,
        quantityUnit: unit,
        batchNumber: batchNumber.trim() || undefined,
        expiryDate: expiryDate || undefined,
        notes: notes.trim() || undefined,
      });
      toast.success('Stock updated');
      onClose();
    } catch (err) {
      toast.error(extractErrorMessage(err, "Couldn't update stock — retry"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
    >
      <div className="grid grid-cols-2 gap-3">
        <Dropdown
          label="Store"
          options={storeOptions}
          value={storeOptions.find((o) => o.value === storeId) ?? null}
          onChange={(o) => setStoreId((o as IOption).value as string)}
        />
        <Dropdown
          label="Action"
          options={actionOptions}
          value={actionOptions.find((o) => o.value === type) ?? null}
          onChange={(o) => setType((o as IOption).value as InventoryTransactionTypeEnum)}
        />
      </div>

      {stores.length === 0 && (
        <p className="text-xs text-critical">No active store yet — create one under the Stores tab first.</p>
      )}

      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Quantity"
          type="number"
          min={1}
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          required
        />
        <label className="flex flex-col gap-1 text-sm text-ink">
          <span className="text-xs font-medium text-ink-muted">Counted in</span>
          <select
            value={unit}
            onChange={(e) => setUnit(e.target.value as QuantityUnit)}
            className="rounded-lg border border-line bg-surface-raised px-3 py-2 text-sm outline-none focus:border-brand focus:ring-1 focus:ring-brand"
          >
            <option value="UNIT">{item.unitOfMeasure} (single units)</option>
            {packed && (
              <option value="PACK">
                {item.packUnit} ({item.packSize} {item.unitOfMeasure} each)
              </option>
            )}
          </select>
        </label>
      </div>

      <div className="rounded-lg border border-line bg-surface p-3 text-sm text-ink">
        <p>
          On hand now: <span className="font-medium">{formatStockQuantity(onHand, item)}</span>
        </p>
        {validQty && (
          <p className={after < 0 ? 'text-critical' : 'text-ink-muted'}>
            After this change: <span className="font-medium">{formatStockQuantity(Math.max(after, 0), item)}</span>
            {after < 0 && ' — not enough stock'}
          </p>
        )}
      </div>

      {action.sign === 1 && (
        <div className="grid grid-cols-2 gap-3">
          <Input label="Batch number" value={batchNumber} onChange={(e) => setBatchNumber(e.target.value)} />
          <Input label="Expiry date" type="date" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} />
        </div>
      )}

      <Input label="Notes" value={notes} onChange={(e) => setNotes(e.target.value)} />

      <div className="mt-2 flex justify-end gap-2">
        <Button type="button" variant={ButtonVariantEnum.GHOST} onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" variant={ButtonVariantEnum.PRIMARY} loading={busy}>
          Save
        </Button>
      </div>
    </form>
  );
}
