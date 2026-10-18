import { LabOrderItemStatusEnum, LabOrderStatusEnum, PillVariantEnum } from '@/enum';
import type { ILabOrder, ILabOrderItem } from '@/interfaces';

export interface OrderItem {
  order: ILabOrder;
  item: ILabOrderItem;
}

/** H-10: clinicians act only on verified results; the API withholds anything earlier. */
export const hasResult = (i: ILabOrderItem) => i.status === LabOrderItemStatusEnum.VERIFIED;

const isOpen = (i: ILabOrderItem) => !hasResult(i) && i.status !== LabOrderItemStatusEnum.CANCELLED;

const resultedTime = (i: ILabOrderItem) => {
  const at = i.verifiedAt ?? i.resultedAt;
  return at ? new Date(at).getTime() : 0;
};

/** Verified tests across all orders, newest first. */
export const readyItems = (orders: ILabOrder[]): OrderItem[] =>
  orders
    .flatMap((order) => order.items.filter(hasResult).map((item) => ({ order, item })))
    .sort((a, b) => resultedTime(b.item) - resultedTime(a.item));

export const pendingCount = (orders: ILabOrder[]) => orders.reduce((n, o) => n + o.items.filter(isOpen).length, 0);

export const resultReadyCount = (orders: ILabOrder[]) =>
  orders.reduce((n, o) => n + o.items.filter(hasResult).length, 0);

export const orderStatusVariant: Record<LabOrderStatusEnum, PillVariantEnum> = {
  [LabOrderStatusEnum.PENDING]: PillVariantEnum.WARNING,
  [LabOrderStatusEnum.IN_PROGRESS]: PillVariantEnum.INFO,
  [LabOrderStatusEnum.COMPLETED]: PillVariantEnum.SUCCESS,
  [LabOrderStatusEnum.CANCELLED]: PillVariantEnum.DEFAULT,
};
