import { UserRoleEnum } from '@/enum';

export const RoleGroups = {
  ADMINS: [UserRoleEnum.SUPER_ADMIN, UserRoleEnum.ADMIN] as const,

  PROVIDERS: [UserRoleEnum.SUPER_ADMIN, UserRoleEnum.ADMIN, UserRoleEnum.DOCTOR] as const,

  CLINICAL_STAFF: [UserRoleEnum.SUPER_ADMIN, UserRoleEnum.ADMIN, UserRoleEnum.DOCTOR, UserRoleEnum.NURSE] as const,

  FRONT_DESK_CLINICAL: [
    UserRoleEnum.SUPER_ADMIN,
    UserRoleEnum.ADMIN,
    UserRoleEnum.DOCTOR,
    UserRoleEnum.NURSE,
    UserRoleEnum.RECEPTIONIST,
  ] as const,

  FLOOR_STAFF: [
    UserRoleEnum.SUPER_ADMIN,
    UserRoleEnum.ADMIN,
    UserRoleEnum.DOCTOR,
    UserRoleEnum.NURSE,
    UserRoleEnum.RECEPTIONIST,
    UserRoleEnum.LAB_TECH,
    UserRoleEnum.PHARMACIST,
    UserRoleEnum.ACCOUNTANT,
  ] as const,

  RECEPTION: [UserRoleEnum.SUPER_ADMIN, UserRoleEnum.ADMIN, UserRoleEnum.RECEPTIONIST] as const,

  CHECK_IN_STAFF: [
    UserRoleEnum.SUPER_ADMIN,
    UserRoleEnum.ADMIN,
    UserRoleEnum.RECEPTIONIST,
    UserRoleEnum.NURSE,
  ] as const,

  PRIORITY_MANAGERS: [UserRoleEnum.SUPER_ADMIN, UserRoleEnum.ADMIN, UserRoleEnum.NURSE, UserRoleEnum.DOCTOR] as const,

  NURSING_ADMIN: [UserRoleEnum.SUPER_ADMIN, UserRoleEnum.ADMIN, UserRoleEnum.NURSE] as const,
} as const;

export type RoleGroupName = keyof typeof RoleGroups;

export const roleInGroup = (role: UserRoleEnum | undefined | null, group: RoleGroupName) => {
  if (!role) return false;
  return (RoleGroups[group] as readonly UserRoleEnum[]).includes(role);
};

export const roleInAny = (role: UserRoleEnum | undefined | null, roles: readonly UserRoleEnum[]) => {
  if (!role) return false;
  return roles.includes(role);
};
