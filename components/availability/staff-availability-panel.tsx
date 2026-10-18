'use client';

import { useState } from 'react';
import { FaUserClock } from 'react-icons/fa';
import { Dropdown, EmptyState, Input, Pagination, Pill } from '@/components';
import { PillVariantEnum, UserRoleEnum } from '@/enum';
import { usePagedSearch, useStaffAvailability } from '@/hooks';
import type { IOption, IStaffAvailability } from '@/interfaces';
import AvailabilityDrawer from './availability.drawer';
import AvailabilityPill from './availability-pill';
import { formatUntil } from './availability-status';

const TH = 'px-4 py-2.5 text-xs font-medium uppercase tracking-wide';

const ALL_ROLES: IOption = { label: 'All roles', value: '' };
const roleOptions: IOption[] = [
  ALL_ROLES,
  ...Object.values(UserRoleEnum).map((role) => ({ label: role.replaceAll('_', ' '), value: role })),
];

/** Who is around, who is away and until when; administrators can change anyone's status. */
export default function StaffAvailabilityPanel({ canManage }: { canManage: boolean }) {
  const { page, setPage, search, setSearch, debouncedSearch } = usePagedSearch('staffPage');
  const [role, setRole] = useState<IOption>(ALL_ROLES);
  // Administrators see every account, including ones that have not signed in yet.
  const { staff, pagination } = useStaffAvailability({
    page,
    search: debouncedSearch,
    role: (role.value || undefined) as UserRoleEnum | undefined,
    includeInactive: canManage || undefined,
  });
  const [selected, setSelected] = useState<IStaffAvailability | null>(null);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end gap-3">
        <Input
          className="w-72"
          placeholder="Search username / email"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="w-56">
          <Dropdown
            label="Role"
            options={roleOptions}
            value={role}
            onChange={(value) => {
              setRole((Array.isArray(value) ? value[0] : value) ?? ALL_ROLES);
              if (page !== 1) setPage(1);
            }}
          />
        </div>
      </div>
      {staff.length === 0 ? (
        <EmptyState message="No staff match your search" icon={FaUserClock} />
      ) : (
        <div className="overflow-hidden rounded-lg border border-line bg-surface-raised">
          <table className="w-full text-left">
            <thead className="border-b border-line bg-surface text-ink-muted">
              <tr>
                <th className={TH}>Staff</th>
                <th className={TH}>Role</th>
                <th className={TH}>Availability</th>
                <th className={TH}>Back</th>
                {canManage && <th className={`${TH} text-right`}>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {staff.map((member) => (
                <tr key={member.id} className="border-b border-line last:border-0">
                  <td className="px-4 py-3 text-sm font-medium text-ink">{member.username}</td>
                  <td className="px-4 py-3 text-sm capitalize text-ink-muted">{member.role.replaceAll('_', ' ')}</td>
                  <td className="px-4 py-3">
                    <AvailabilityPill status={member.availability} />
                    {member.accountStatus !== 'active' && (
                      <Pill variant={PillVariantEnum.DEFAULT}>{member.accountStatus.replaceAll('_', ' ')}</Pill>
                    )}
                    {member.note && <p className="mt-1 text-xs text-ink-muted">{member.note}</p>}
                  </td>
                  <td className="px-4 py-3 text-xs text-ink-muted">
                    {member.availability === 'available' ? '—' : formatUntil(member.until)}
                  </td>
                  {canManage && (
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => setSelected(member)}
                        className="text-xs font-medium text-primary hover:text-primary-hover"
                      >
                        Change
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
          <Pagination {...pagination} onPageChange={setPage} label="Staff availability pages" />
        </div>
      )}
      {canManage && (
        <AvailabilityDrawer
          open={Boolean(selected)}
          onClose={() => setSelected(null)}
          userId={selected?.id}
          name={selected?.username}
        />
      )}
    </div>
  );
}
