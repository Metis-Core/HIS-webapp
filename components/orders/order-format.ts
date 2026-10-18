import type { IconType } from 'react-icons';
import { FaBan, FaCalendarAlt, FaCheckCircle, FaClock, FaPlayCircle } from 'react-icons/fa';
import { OrderKindEnum, OrderPriorityEnum, OrderStatusEnum, PillVariantEnum } from '@/enum';

export const KIND_LABEL: Record<OrderKindEnum, string> = {
  [OrderKindEnum.RADIOLOGY]: 'Radiology',
  [OrderKindEnum.SURGERY]: 'Surgery and procedures',
};

export const STATUS_LABEL: Record<OrderStatusEnum, string> = {
  [OrderStatusEnum.REQUESTED]: 'Requested',
  [OrderStatusEnum.SCHEDULED]: 'Scheduled',
  [OrderStatusEnum.IN_PROGRESS]: 'In progress',
  [OrderStatusEnum.COMPLETED]: 'Completed',
  [OrderStatusEnum.CANCELLED]: 'Cancelled',
};

export const STATUS_VARIANT: Record<OrderStatusEnum, PillVariantEnum> = {
  [OrderStatusEnum.REQUESTED]: PillVariantEnum.WARNING,
  [OrderStatusEnum.SCHEDULED]: PillVariantEnum.INFO,
  [OrderStatusEnum.IN_PROGRESS]: PillVariantEnum.INFO,
  [OrderStatusEnum.COMPLETED]: PillVariantEnum.SUCCESS,
  [OrderStatusEnum.CANCELLED]: PillVariantEnum.DEFAULT,
};

export const STATUS_ICON: Record<OrderStatusEnum, IconType> = {
  [OrderStatusEnum.REQUESTED]: FaClock,
  [OrderStatusEnum.SCHEDULED]: FaCalendarAlt,
  [OrderStatusEnum.IN_PROGRESS]: FaPlayCircle,
  [OrderStatusEnum.COMPLETED]: FaCheckCircle,
  [OrderStatusEnum.CANCELLED]: FaBan,
};

export const PRIORITY_LABEL: Record<OrderPriorityEnum, string> = {
  [OrderPriorityEnum.ROUTINE]: 'Routine',
  [OrderPriorityEnum.URGENT]: 'Urgent',
  [OrderPriorityEnum.EMERGENCY]: 'Emergency',
};

export const OPEN_ORDER_STATUSES = [OrderStatusEnum.REQUESTED, OrderStatusEnum.SCHEDULED, OrderStatusEnum.IN_PROGRESS];

export const isOpenOrder = (status: OrderStatusEnum) => OPEN_ORDER_STATUSES.includes(status);
