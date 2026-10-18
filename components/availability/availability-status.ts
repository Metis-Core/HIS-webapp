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

const sameDay = (a: Date, b: Date) => a.toDateString() === b.toDateString();

export const formatShortUntil = (iso: string | null) => {
  if (!iso) return null;
  const end = new Date(iso);
  return sameDay(end, new Date())
    ? end.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
    : end.toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
};

export function describeAvailability(status: AvailabilityStatusEnum, until: string | null): string {
  if (status === AvailabilityStatusEnum.AVAILABLE) return "You're available. New patients can be assigned to you.";
  const when = formatShortUntil(until);
  const label = AVAILABILITY_LABEL[status].toLowerCase();
  return when
    ? `You're ${label} until ${when}. You'll be available again automatically.`
    : `You're ${label} until you mark yourself available.`;
}

export const minutesLeftToday = (cap: number) => {
  const now = new Date();
  const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  return Math.max(1, Math.min(cap, Math.round((midnight.getTime() - now.getTime()) / 60_000)));
};
