'use client';

import { useMemo } from 'react';
import { useAuth } from '@/providers';
import { UserRoleEnum } from '@/enum';
import { RoleGroups, roleInAny, roleInGroup, type RoleGroupName } from '@/helpers/role-groups';

export function useRoles() {
  const { user } = useAuth();
  const role = user?.role;

  return useMemo(
    () => ({
      role,
      is: (...roles: UserRoleEnum[]) => roleInAny(role, roles),
      inGroup: (group: RoleGroupName) => roleInGroup(role, group),
      groups: RoleGroups,
      isAdmin: roleInGroup(role, 'ADMINS'),
      isProvider: roleInGroup(role, 'PROVIDERS'),
      isClinical: roleInGroup(role, 'CLINICAL_STAFF'),
      isFrontDeskClinical: roleInGroup(role, 'FRONT_DESK_CLINICAL'),
      isFloorStaff: roleInGroup(role, 'FLOOR_STAFF'),
      isReception: roleInGroup(role, 'RECEPTION'),
    }),
    [role],
  );
}
