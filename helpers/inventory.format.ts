import type { IInventoryItem } from '@/interfaces';

type PackInfo = Pick<IInventoryItem, 'unitOfMeasure' | 'packSize' | 'packUnit'>;

/** e.g. "250 PCS (2 BOX + 50 PCS)" when the item is packed, otherwise "250 PCS". */
export function formatStockQuantity(quantity: number, item?: PackInfo | null): string {
  if (!item) return quantity.toLocaleString();
  const base = `${quantity.toLocaleString()} ${item.unitOfMeasure}`;
  if (!item.packSize || item.packSize <= 1) return base;

  const packs = Math.floor(quantity / item.packSize);
  const rest = quantity % item.packSize;
  const parts = [`${packs} ${item.packUnit}`];
  if (rest > 0) parts.push(`${rest} ${item.unitOfMeasure}`);
  return `${base} (${parts.join(' + ')})`;
}
