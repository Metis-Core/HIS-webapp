'use client';

import RemoteSearchSelect from '@/components/inputs/remote-search-select';
import { UserRoleEnum, UserStatusEnum } from '@/enum';
import { PICKER_PAGE_SIZE } from '@/helpers/pagination';
import usersService from '@/helpers/users.service';
import type { IOption, IUser } from '@/interfaces';

const nameOf = (u: IUser) => `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim() || u.username;
const toOption = (u: IUser): IOption => ({ label: `Dr ${nameOf(u)}`, value: u.id });
const buildUrl = (search: string) =>
  usersService.buildListUrl({
    role: UserRoleEnum.DOCTOR,
    status: UserStatusEnum.ACTIVE,
    search: search || undefined,
    limit: PICKER_PAGE_SIZE,
  });

/** Administrators open consultations on a doctor's behalf; only doctors can be assigned (M-11). */
export default function DoctorSearchSelect({
  value,
  onChange,
}: {
  value: IUser | null;
  onChange: (u: IUser | null) => void;
}) {
  return (
    <RemoteSearchSelect<IUser>
      label="Doctor"
      placeholder="Search doctors"
      value={value}
      onChange={onChange}
      buildUrl={buildUrl}
      toOption={toOption}
      noun="doctors"
    />
  );
}
