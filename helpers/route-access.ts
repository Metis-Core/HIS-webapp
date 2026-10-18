import { UserRoleEnum } from '@/enum/user.enum';
import { RoleGroups } from './role-groups';

const { SUPER_ADMIN, ADMIN, DOCTOR, NURSE, RECEPTIONIST, LAB_TECH, PHARMACIST, ACCOUNTANT } = UserRoleEnum;

/** Page-level access (H-22). The API still enforces every call; this only stops dead-end pages. */
const ROUTE_ACCESS: { prefix: string; roles: readonly UserRoleEnum[] }[] = [
  { prefix: '/users', roles: RoleGroups.ADMINS },
  { prefix: '/queue', roles: [SUPER_ADMIN, ADMIN, DOCTOR, NURSE, RECEPTIONIST] },
  { prefix: '/consultations', roles: RoleGroups.CLINICAL_STAFF },
  { prefix: '/lab', roles: [SUPER_ADMIN, ADMIN, DOCTOR, NURSE, LAB_TECH] },
  { prefix: '/pharmacy', roles: [SUPER_ADMIN, ADMIN, DOCTOR, NURSE, PHARMACIST] },
  { prefix: '/inventory', roles: [SUPER_ADMIN, ADMIN, LAB_TECH, PHARMACIST] },
  { prefix: '/billing', roles: RoleGroups.BILLING },
  { prefix: '/orders', roles: [SUPER_ADMIN, ADMIN, DOCTOR, NURSE, LAB_TECH] },
  { prefix: '/services', roles: [SUPER_ADMIN, ADMIN, RECEPTIONIST, ACCOUNTANT] },
];

export function canOpenRoute(role: UserRoleEnum | null | undefined, pathname: string): boolean {
  const rule = ROUTE_ACCESS.find(({ prefix }) => pathname === prefix || pathname.startsWith(`${prefix}/`));
  if (!rule || !role) return true;
  return role === SUPER_ADMIN || rule.roles.includes(role);
}
