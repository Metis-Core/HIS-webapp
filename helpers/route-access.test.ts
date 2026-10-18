import { describe, expect, it } from 'vitest';
import { canOpenRoute } from './route-access';
import { roleInGroup } from './role-groups';
import { UserRoleEnum } from '@/enum';

describe('canOpenRoute', () => {
  it('lets finance and reception into billing but not clinical roles', () => {
    expect(canOpenRoute(UserRoleEnum.ACCOUNTANT, '/billing')).toBe(true);
    expect(canOpenRoute(UserRoleEnum.RECEPTIONIST, '/billing')).toBe(true);
    expect(canOpenRoute(UserRoleEnum.DOCTOR, '/billing')).toBe(false);
  });

  it('keeps the lab technician out of surgery-only screens they cannot use', () => {
    expect(canOpenRoute(UserRoleEnum.LAB_TECH, '/orders')).toBe(true);
    expect(canOpenRoute(UserRoleEnum.PHARMACIST, '/orders')).toBe(false);
  });

  it('keeps the mother and child page to clinical staff', () => {
    expect(canOpenRoute(UserRoleEnum.NURSE, '/maternity')).toBe(true);
    expect(canOpenRoute(UserRoleEnum.DOCTOR, '/maternity')).toBe(true);
    expect(canOpenRoute(UserRoleEnum.PHARMACIST, '/maternity')).toBe(false);
  });

  it('allows super admins everywhere and unknown routes for anyone', () => {
    expect(canOpenRoute(UserRoleEnum.SUPER_ADMIN, '/billing')).toBe(true);
    expect(canOpenRoute(UserRoleEnum.NURSE, '/profile')).toBe(true);
  });
});

describe('roleInGroup', () => {
  it('limits voiding payments and day close-out to finance managers', () => {
    expect(roleInGroup(UserRoleEnum.ACCOUNTANT, 'FINANCE_MANAGERS')).toBe(true);
    expect(roleInGroup(UserRoleEnum.RECEPTIONIST, 'FINANCE_MANAGERS')).toBe(false);
  });
});
