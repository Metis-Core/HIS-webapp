import { LabOrderItemStatusEnum as S, LabOrderStatusEnum as O, PillVariantEnum as P } from '@/enum';

export const itemStatusVariant: Record<S, P> = {
  [S.PENDING]: P.WARNING,
  [S.COLLECTED]: P.INFO,
  [S.IN_PROCESS]: P.INFO,
  [S.RESULT_READY]: P.WARNING,
  [S.VERIFIED]: P.SUCCESS,
  [S.CANCELLED]: P.DEFAULT,
};

export const orderStatusVariant: Record<O, P> = {
  [O.PENDING]: P.WARNING,
  [O.IN_PROGRESS]: P.INFO,
  [O.COMPLETED]: P.SUCCESS,
  [O.CANCELLED]: P.DEFAULT,
};

/** L2: the orders list opens on work that still needs the lab. */
export const OPEN_ORDER_STATUSES: readonly O[] = [O.PENDING, O.IN_PROGRESS];

export const statusLabel = (s: string) => s.replaceAll('_', ' ');
