import type { AvailabilityStatusEnum, DepartmentEnum, UserRoleEnum } from '@/enum';
import type { IBaseEntity, IPageQuery } from './base.interface';

export interface IResolvedAvailability {
  status: AvailabilityStatusEnum;
  until: string | null;
  note: string | null;
  periodId: string | null;
}

export interface IAvailabilityPeriod extends IBaseEntity {
  userId: string;
  status: AvailabilityStatusEnum;
  startsAt: string;
  endsAt: string | null;
  note: string | null;
}

export interface IAvailabilityOverview {
  current: IResolvedAvailability;
  periods: IAvailabilityPeriod[];
}

export interface ISetAvailabilityDto {
  status: AvailabilityStatusEnum;
  startsAt?: string;
  endsAt?: string;
  durationMinutes?: number;
  note?: string;
}

export interface IStaffAvailability {
  id: string;
  username: string;
  role: UserRoleEnum;
  department: DepartmentEnum;
  accountStatus: string;
  availability: AvailabilityStatusEnum;
  until: string | null;
  note: string | null;
}

export interface IStaffAvailabilityFilters extends IPageQuery {
  role?: UserRoleEnum;
  search?: string;
  /** Administrators only: also accounts that are not active yet or are suspended. */
  includeInactive?: boolean;
}

export interface IDoctorSummary {
  id: string;
  username: string;
  email: string;
  department: DepartmentEnum;
  availability: AvailabilityStatusEnum;
  availabilityNote: string | null;
  availableAgainAt: string | null;
  assignable: boolean;
  waiting: number;
}

export interface IDoctorFilters extends IPageQuery {
  search?: string;
}

export interface IReassignVisitDto {
  doctorId: string;
  reason: string;
}
