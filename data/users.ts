import { subDays } from 'date-fns';
import { PillVariantEnum } from '@/enum';
import { UserRoleEnum, UserStatusEnum } from '@/enum/user.enum';

export interface IStaffUser {
  id: string;
  name: string;
  email: string;
  role: UserRoleEnum;
  department: string;
  status: UserStatusEnum;
  lastLogin: Date;
}

export const staffUsers: IStaffUser[] = [
  {
    id: 'u1',
    name: 'Grace Namuli',
    email: 'grace.namuli@metis.health',
    role: UserRoleEnum.RECEPTIONIST,
    department: 'Reception',
    status: UserStatusEnum.ACTIVE,
    lastLogin: subDays(new Date(), 0),
  },
  {
    id: 'u2',
    name: 'Dr. Kiwanuka',
    email: 'kiwanuka@metis.health',
    role: UserRoleEnum.DOCTOR,
    department: 'General Medicine',
    status: UserStatusEnum.ACTIVE,
    lastLogin: subDays(new Date(), 0),
  },
  {
    id: 'u3',
    name: 'Dr. Namutebi',
    email: 'namutebi@metis.health',
    role: UserRoleEnum.DOCTOR,
    department: 'Internal Medicine',
    status: UserStatusEnum.ACTIVE,
    lastLogin: subDays(new Date(), 1),
  },
  {
    id: 'u4',
    name: 'Dr. Byaruhanga',
    email: 'byaruhanga@metis.health',
    role: UserRoleEnum.DOCTOR,
    department: 'Surgical Theatre 2',
    status: UserStatusEnum.INACTIVE,
    lastLogin: subDays(new Date(), 12),
  },
  {
    id: 'u5',
    name: 'Achen',
    email: 'achen@metis.health',
    role: UserRoleEnum.LAB_TECH,
    department: 'Laboratory',
    status: UserStatusEnum.ACTIVE,
    lastLogin: subDays(new Date(), 0),
  },
  {
    id: 'u6',
    name: 'Nassuna',
    email: 'nassuna@metis.health',
    role: UserRoleEnum.PHARMACIST,
    department: 'Pharmacy',
    status: UserStatusEnum.ACTIVE,
    lastLogin: subDays(new Date(), 2),
  },
  {
    id: 'u7',
    name: 'Okot',
    email: 'okot@metis.health',
    role: UserRoleEnum.NURSE,
    department: 'Radiology',
    status: UserStatusEnum.PENDING,
    lastLogin: subDays(new Date(), 30),
  },
  {
    id: 'u8',
    name: 'Ivan Ssempijja',
    email: 'ivan.ssempijja@metis.health',
    role: UserRoleEnum.ACCOUNTANT,
    department: 'Finance',
    status: UserStatusEnum.BLOCKED,
    lastLogin: subDays(new Date(), 60),
  },
];

export const statusVariants: Record<UserStatusEnum, PillVariantEnum> = {
  [UserStatusEnum.ACTIVE]: PillVariantEnum.SUCCESS,
  [UserStatusEnum.INACTIVE]: PillVariantEnum.DEFAULT,
  [UserStatusEnum.PENDING]: PillVariantEnum.WARNING,
  [UserStatusEnum.BLOCKED]: PillVariantEnum.DANGER,
};

export function roleLabel(value: string) {
  return value
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
