'use client';

import { useState } from 'react';
import { FaPlus, FaUserClock, FaUsersCog } from 'react-icons/fa';
import { toast } from 'sonner';
import { Button, EmptyState, Input, PageHeader, Pagination, Pill, Stats, Tabs, UserDrawer } from '@/components';
import StaffAvailabilityPanel from '@/components/availability/staff-availability-panel';
import { ButtonVariantEnum, ModalDrawerModeEnum, PillVariantEnum, StatVariantEnum, UserStatusEnum } from '@/enum';
import { useListTotal, usePagedSearch, useUsers } from '@/hooks';
import usersService from '@/helpers/users.service';
import type { ICreateUserDto, IUpdateUserDto, IUser, UserFormValues } from '@/interfaces';
import { DepartmentEnum, UserRoleEnum } from '@/enum/user.enum';

const statusVariant: Record<UserStatusEnum, PillVariantEnum> = {
  [UserStatusEnum.ACTIVE]: PillVariantEnum.SUCCESS,
  [UserStatusEnum.INACTIVE]: PillVariantEnum.DEFAULT,
  [UserStatusEnum.SUSPENDED]: PillVariantEnum.DANGER,
  [UserStatusEnum.PENDING_RESET]: PillVariantEnum.WARNING,
};

type TabId = 'accounts' | 'availability';

export default function UsersPage() {
  const [tab, setTab] = useState<TabId>('accounts');
  const [drawerMode, setDrawerMode] = useState<ModalDrawerModeEnum | null>(null);
  const [selected, setSelected] = useState<IUser | null>(null);
  const { page, setPage, search, setSearch, debouncedSearch } = usePagedSearch();

  const { users, pagination, createUser, updateUser, removeUser } = useUsers({ page, search: debouncedSearch });
  // Counts come from the server so they cover every account, not just this page.
  const activeCount = useListTotal(usersService.buildListUrl({ status: UserStatusEnum.ACTIVE, limit: 1 }));
  const inactiveCount = useListTotal(usersService.buildListUrl({ status: UserStatusEnum.INACTIVE, limit: 1 }));
  const suspendedCount = useListTotal(usersService.buildListUrl({ status: UserStatusEnum.SUSPENDED, limit: 1 }));
  const allCount = useListTotal(usersService.buildListUrl({ limit: 1 }));

  const stats = [
    { label: 'Active', value: activeCount, icon: FaUsersCog, variant: StatVariantEnum.Green },
    { label: 'Inactive', value: inactiveCount, icon: FaUsersCog, variant: StatVariantEnum.Amber },
    { label: 'Suspended', value: suspendedCount, icon: FaUsersCog, variant: StatVariantEnum.Amber },
    { label: 'Total', value: allCount, icon: FaUsersCog, variant: StatVariantEnum.Blue },
  ];

  const openAdd = () => {
    setSelected(null);
    setDrawerMode(ModalDrawerModeEnum.ADD);
  };
  const openEdit = (u: IUser) => {
    setSelected(u);
    setDrawerMode(ModalDrawerModeEnum.EDIT);
  };
  const closeDrawer = () => {
    setDrawerMode(null);
    setSelected(null);
  };

  const save = async (values: UserFormValues) => {
    const payload: ICreateUserDto | IUpdateUserDto = {
      username: values.username,
      email: values.email,
      password: values.password || (undefined as unknown as string),
      role: values.role as UserRoleEnum,
      department: values.department as DepartmentEnum,
      status: values.status as UserStatusEnum,
    };
    if (selected) {
      const { password, ...rest } = payload;
      await toast.promise(updateUser(selected.id, password ? payload : rest), {
        loading: 'Saving user…',
        success: 'User updated',
        error: "Couldn't save — retry",
      });
    } else {
      await toast.promise(createUser(payload as ICreateUserDto), {
        loading: 'Creating user…',
        success: 'User created',
        error: "Couldn't create — retry",
      });
    }
    closeDrawer();
  };

  const remove = async (u: IUser) => {
    if (!confirm(`Remove ${u.username}?`)) return;
    await toast.promise(removeUser(u.id), {
      loading: 'Removing…',
      success: 'User removed',
      error: "Couldn't remove — retry",
    });
  };

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        description="Staff accounts with roles and department assignment."
        action={
          <Button type="button" variant={ButtonVariantEnum.PRIMARY} onClick={openAdd}>
            <FaPlus className="text-xs" />
            New user
          </Button>
        }
      />

      <Stats items={stats} />

      <Tabs<TabId>
        tabs={[
          { id: 'accounts', label: 'Accounts', icon: FaUsersCog },
          { id: 'availability', label: 'Availability', icon: FaUserClock },
        ]}
        active={tab}
        onChange={setTab}
      />

      {tab === 'availability' && <StaffAvailabilityPanel canManage />}

      {tab === 'accounts' && (
        <>
          <Input
            className="max-w-sm"
            placeholder="Search username / email"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          {users.length === 0 ? (
            search.trim() ? (
              <EmptyState message="No users match your search" icon={FaUsersCog} />
            ) : (
              <EmptyState message="No users yet" icon={FaUsersCog} actionLabel="Add user" onAction={openAdd} />
            )
          ) : (
            <div className="overflow-hidden rounded-lg border border-line bg-surface-raised">
              <table className="w-full text-left">
                <thead className="border-b border-line bg-surface text-ink-muted">
                  <tr>
                    <th className="px-4 py-2.5 text-xs font-medium uppercase tracking-wide">Username</th>
                    <th className="px-4 py-2.5 text-xs font-medium uppercase tracking-wide">Email</th>
                    <th className="px-4 py-2.5 text-xs font-medium uppercase tracking-wide">Role</th>
                    <th className="px-4 py-2.5 text-xs font-medium uppercase tracking-wide">Department</th>
                    <th className="px-4 py-2.5 text-xs font-medium uppercase tracking-wide">Status</th>
                    <th className="px-4 py-2.5 text-right text-xs font-medium uppercase tracking-wide">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} className="border-b border-line last:border-0">
                      <td className="px-4 py-3 text-sm font-medium text-ink">{u.username}</td>
                      <td className="px-4 py-3 text-sm text-ink-muted">{u.email}</td>
                      <td className="px-4 py-3 text-sm capitalize text-ink">{u.role.replaceAll('_', ' ')}</td>
                      <td className="px-4 py-3 text-sm capitalize text-ink-muted">
                        {u.department?.replaceAll('_', ' ') ?? '—'}
                      </td>
                      <td className="px-4 py-3">
                        <Pill variant={statusVariant[u.status] ?? PillVariantEnum.DEFAULT}>
                          {u.status.replaceAll('_', ' ')}
                        </Pill>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-3">
                          <button
                            type="button"
                            onClick={() => openEdit(u)}
                            className="text-xs font-medium text-primary hover:text-primary-hover"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => remove(u)}
                            className="text-xs font-medium text-critical hover:opacity-80"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <Pagination {...pagination} onPageChange={setPage} label="Users pages" />
            </div>
          )}
        </>
      )}

      <UserDrawer mode={drawerMode} user={selected} onClose={closeDrawer} onSave={save} onEdit={openEdit} />
    </div>
  );
}
