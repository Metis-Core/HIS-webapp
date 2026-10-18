import { LabOrderItemStatusEnum, LabOrderStatusEnum, PillVariantEnum } from '@/enum';
import type { ILabOrder, ILabOrderItem } from '@/interfaces';

export interface OrderItem {
  order: ILabOrder;
  item: ILabOrderItem;
}

export const hasResult = (i: ILabOrderItem) =>
  i.status === LabOrderItemStatusEnum.RESULT_READY || Boolean(i.resultValue);

const resultedTime = (i: ILabOrderItem) => (i.resultedAt ? new Date(i.resultedAt).getTime() : 0);

/** Resulted tests across all orders, newest result first. */
export const readyItems = (orders: ILabOrder[]): OrderItem[] =>
  orders
    .flatMap((order) => order.items.filter(hasResult).map((item) => ({ order, item })))
    .sort((a, b) => resultedTime(b.item) - resultedTime(a.item));

export const pendingCount = (orders: ILabOrder[]) =>
  orders.reduce((n, o) => n + o.items.filter((i) => !hasResult(i)).length, 0);

export const resultReadyCount = (orders: ILabOrder[]) =>
  orders.reduce((n, o) => n + o.items.filter((i) => i.status === LabOrderItemStatusEnum.RESULT_READY).length, 0);

export const orderStatusVariant: Record<LabOrderStatusEnum, PillVariantEnum> = {
  [LabOrderStatusEnum.PENDING]: PillVariantEnum.WARNING,
  [LabOrderStatusEnum.IN_PROGRESS]: PillVariantEnum.INFO,
  [LabOrderStatusEnum.COMPLETED]: PillVariantEnum.SUCCESS,
  [LabOrderStatusEnum.CANCELLED]: PillVariantEnum.DEFAULT,
};
