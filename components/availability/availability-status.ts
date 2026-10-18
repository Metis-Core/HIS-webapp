import type { IconType } from 'react-icons';
import { FaCheckCircle, FaClock, FaPlaneDeparture, FaUmbrellaBeach } from 'react-icons/fa';
import { AvailabilityStatusEnum, PillVariantEnum } from '@/enum';

export const AVAILABILITY_LABEL: Record<AvailabilityStatusEnum, string> = {
  [AvailabilityStatusEnum.AVAILABLE]: 'Available',
  [AvailabilityStatusEnum.BUSY]: 'Busy',
  [AvailabilityStatusEnum.ON_LEAVE]: 'On leave',
  [AvailabilityStatusEnum.OUT_OF_OFFICE]: 'Out of office',
};

export const AVAILABILITY_VARIANT: Record<AvailabilityStatusEnum, PillVariantEnum> = {
  [AvailabilityStatusEnum.AVAILABLE]: PillVariantEnum.SUCCESS,
  [AvailabilityStatusEnum.BUSY]: PillVariantEnum.WARNING,
  [AvailabilityStatusEnum.ON_LEAVE]: PillVariantEnum.INFO,
  [AvailabilityStatusEnum.OUT_OF_OFFICE]: PillVariantEnum.DEFAULT,
};

export const AVAILABILITY_ICON: Record<AvailabilityStatusEnum, IconType> = {
  [AvailabilityStatusEnum.AVAILABLE]: FaCheckCircle,
  [AvailabilityStatusEnum.BUSY]: FaClock,
  [AvailabilityStatusEnum.ON_LEAVE]: FaUmbrellaBeach,
  [AvailabilityStatusEnum.OUT_OF_OFFICE]: FaPlaneDeparture,
};

export const formatWhen = (iso: string) =>
  new Date(iso).toLocaleString(undefined, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

export const formatUntil = (iso: string | null) => (iso ? `until ${formatWhen(iso)}` : 'until marked available');
