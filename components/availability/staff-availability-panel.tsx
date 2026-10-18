'use client';

import { useState } from 'react';
import { FaUserClock } from 'react-icons/fa';
import { EmptyState, Input, Pagination } from '@/components';
import { usePagedSearch, useStaffAvailability } from '@/hooks';
import type { IStaffAvailability } from '@/interfaces';
import AvailabilityDrawer from './availability.drawer';
import AvailabilityPill from './availability-pill';
import { formatUntil } from './availability-status';

const TH = 'px-4 py-2.5 text-xs font-medium uppercase tracking-wide';

/** Who is around, who is away and until when; administrators can change anyone's status. */
export default function StaffAvailabilityPanel({ canManage }: { canManage: boolean }) {
  const { page, setPage, search, setSearch, debouncedSearch } = usePagedSearch('staffPage');
  const { staff, pagination } = useStaffAvailability({ page, search: debouncedSearch });
  const [selected, setSelected] = useState<IStaffAvailability | null>(null);

  return (
    <div className="flex flex-col gap-4">
      <Input
        className="max-w-sm"
        placeholder="Search username / email"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
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
