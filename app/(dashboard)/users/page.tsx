'use client';

import { useMemo, useState } from 'react';
import { FaPlus, FaUsersCog } from 'react-icons/fa';
import { toast } from 'sonner';
import { Button, EmptyState, Input, PageHeader, Pill, Stats, UserDrawer } from '@/components';
import { ButtonVariantEnum, ModalDrawerModeEnum, PillVariantEnum, StatVariantEnum, UserStatusEnum } from '@/enum';
import { useUsers } from '@/hooks';
import type { ICreateUserDto, IUpdateUserDto, IUser, UserFormValues } from '@/interfaces';
import { DepartmentEnum, UserRoleEnum } from '@/enum/user.enum';

const statusVariant: Record<UserStatusEnum, PillVariantEnum> = {
  [UserStatusEnum.ACTIVE]: PillVariantEnum.SUCCESS,
  [UserStatusEnum.INACTIVE]: PillVariantEnum.DEFAULT,
  [UserStatusEnum.SUSPENDED]: PillVariantEnum.DANGER,
  [UserStatusEnum.PENDING_RESET]: PillVariantEnum.WARNING,
};

export default function UsersPage() {
  const [drawerMode, setDrawerMode] = useState<ModalDrawerModeEnum | null>(null);
  const [selected, setSelected] = useState<IUser | null>(null);
  const [search, setSearch] = useState('');

  const { users, createUser, updateUser, removeUser } = useUsers({ limit: 100 });

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (u) =>
        u.username.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.role.toLowerCase().includes(q) ||
        (u.department ?? '').toLowerCase().includes(q),
    );
  }, [users, search]);

  const stats = useMemo(
    () => [
      {
        label: 'Active',
        value: users.filter((u) => u.status === UserStatusEnum.ACTIVE).length,
        icon: FaUsersCog,
        variant: StatVariantEnum.Green,
      },
      {
        label: 'Inactive',
        value: users.filter((u) => u.status === UserStatusEnum.INACTIVE).length,
        icon: FaUsersCog,
        variant: StatVariantEnum.Amber,
      },
      {
        label: 'Suspended',
        value: users.filter((u) => u.status === UserStatusEnum.SUSPENDED).length,
        icon: FaUsersCog,
        variant: StatVariantEnum.Amber,
      },
      { label: 'Total', value: users.length, icon: FaUsersCog, variant: StatVariantEnum.Blue },
    ],
    [users],
  );

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
        title="Users"
        description="Staff accounts with roles and department assignment."
        action={
          <Button type="button" variant={ButtonVariantEnum.PRIMARY} onClick={openAdd}>
            <FaPlus className="text-xs" />
            New user
          </Button>
        }
      />

      <Stats items={stats} />

      <Input
        className="max-w-sm"
        placeholder="Search username / email / role"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {filtered.length === 0 ? (
        <EmptyState message="No users yet" icon={FaUsersCog} actionLabel="Add user" onAction={openAdd} />
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
              {filtered.map((u) => (
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
                        className="text-xs font-medium text-brand hover:text-brand-hover"
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
        </div>
      )}

      <UserDrawer mode={drawerMode} user={selected} onClose={closeDrawer} onSave={save} onEdit={openEdit} />
    </div>
  );
}
