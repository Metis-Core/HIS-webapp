'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { FaEye, FaMoneyBillWave, FaPen, FaPlus, FaTrash, FaUsersCog } from 'react-icons/fa';
import { Button, Drawer, Dropdown, Input, Pill } from '@/components';
import { ButtonVariantEnum, ModalDrawerModeEnum } from '@/enum';
import { UserRoleEnum, UserStatusEnum } from '@/enum/user.enum';
import { serviceFees as initialServiceFees, stageLabel } from '@/data/services';
import { roleLabel, staffUsers, statusVariants, type IStaffUser } from '@/data/users';
import type { IOption } from '@/interfaces';

type SettingsTab = 'users' | 'services';

const tabs: { id: SettingsTab; label: string; icon: typeof FaUsersCog }[] = [
  { id: 'users', label: 'User Management', icon: FaUsersCog },
  { id: 'services', label: 'Services', icon: FaMoneyBillWave },
];

const roleOptions: IOption[] = Object.values(UserRoleEnum).map((role) => ({ label: roleLabel(role), value: role }));
const statusOptions: IOption[] = Object.values(UserStatusEnum).map((status) => ({
  label: roleLabel(status),
  value: status,
}));

interface UserFormState {
  name: string;
  email: string;
  department: string;
  role: IOption;
  status: IOption;
}

const emptyUserForm: UserFormState = {
  name: '',
  email: '',
  department: '',
  role: roleOptions[0],
  status: statusOptions[0],
};

interface FeeRow {
  id: string;
  label: string;
  fee: number;
}

export default function SettingsPage() {
  const [tab, setTab] = useState<SettingsTab>('users');

  const [users, setUsers] = useState<IStaffUser[]>(staffUsers);
  const [drawerMode, setDrawerMode] = useState<ModalDrawerModeEnum | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [userForm, setUserForm] = useState<UserFormState>(emptyUserForm);

  const [feeRows, setFeeRows] = useState<FeeRow[]>(() =>
    initialServiceFees.map((service) => ({ id: service.stage, label: stageLabel(service.stage), fee: service.fee })),
  );

  const openAddUser = () => {
    setEditingId(null);
    setUserForm(emptyUserForm);
    setDrawerMode(ModalDrawerModeEnum.ADD);
  };

  const openEditUser = (user: IStaffUser) => {
    setEditingId(user.id);
    setUserForm({
      name: user.name,
      email: user.email,
      department: user.department,
      role: roleOptions.find((option) => option.value === user.role) ?? roleOptions[0],
      status: statusOptions.find((option) => option.value === user.status) ?? statusOptions[0],
    });
    setDrawerMode(ModalDrawerModeEnum.EDIT);
  };

  const openViewUser = (user: IStaffUser) => {
    setEditingId(user.id);
    setUserForm({
      name: user.name,
      email: user.email,
      department: user.department,
      role: roleOptions.find((option) => option.value === user.role) ?? roleOptions[0],
      status: statusOptions.find((option) => option.value === user.status) ?? statusOptions[0],
    });
    setDrawerMode(ModalDrawerModeEnum.VIEW);
  };

  const deleteUser = (id: string) => {
    if (!window.confirm('Delete this user?')) return;
    setUsers((prev) => prev.filter((user) => user.id !== id));
  };

  const saveUser = () => {
    if (!userForm.name.trim() || !userForm.email.trim()) return;

    if (drawerMode === ModalDrawerModeEnum.EDIT && editingId) {
      setUsers((prev) =>
        prev.map((user) =>
          user.id === editingId
            ? {
                ...user,
                name: userForm.name,
                email: userForm.email,
                department: userForm.department,
                role: userForm.role.value as UserRoleEnum,
                status: userForm.status.value as UserStatusEnum,
              }
            : user,
        ),
      );
    } else {
      setUsers((prev) => [
        {
          id: crypto.randomUUID(),
          name: userForm.name,
          email: userForm.email,
          department: userForm.department,
          role: userForm.role.value as UserRoleEnum,
          status: userForm.status.value as UserStatusEnum,
          lastLogin: new Date(),
        },
        ...prev,
      ]);
    }
    setDrawerMode(null);
  };

  const addFeeRow = () => setFeeRows((prev) => [...prev, { id: crypto.randomUUID(), label: '', fee: 0 }]);

  const updateFeeRow = (id: string, field: 'label' | 'fee', value: string) =>
    setFeeRows((prev) =>
      prev.map((row) => (row.id === id ? { ...row, [field]: field === 'fee' ? Number(value) || 0 : value } : row)),
    );

  return (
    <div className="flex flex-col gap-6 py-4">
      <div className="flex items-center justify-between border-b border-zinc-200">
        <div className="flex gap-2">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={`flex items-center gap-2 border-b-2 px-4 py-3 text-md font-semibold transition ${
                tab === id ? 'border-green-800 text-green-800' : 'border-transparent text-zinc-500 hover:text-zinc-800'
              }`}
            >
              <Icon className="text-sm" />
              {label}
            </button>
          ))}
        </div>
        {tab === 'users' ? (
          <Button type="button" onClick={openAddUser}>
            <FaPlus className="text-sm" />
            Add user
          </Button>
        ) : (
          <Button type="button" variant={ButtonVariantEnum.SECONDARY} onClick={addFeeRow}>
            <FaPlus className="text-sm" />
            Add row
          </Button>
        )}
      </div>

      {tab === 'users' ? (
        <div className="flex flex-col gap-4">
          <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="border-b border-zinc-200 bg-green-50 text-green-900">
                  <tr>
                    <th className="px-6 py-3 text-md font-bold">Name</th>
                    <th className="px-6 py-3 text-md font-bold">Role</th>
                    <th className="px-6 py-3 text-md font-bold">Department</th>
                    <th className="px-6 py-3 text-md font-bold">Status</th>
                    <th className="px-6 py-3 text-md font-bold">Last login</th>
                    <th className="px-6 py-3 text-md font-bold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr
                      key={user.id}
                      className="border-b border-zinc-100 last:border-0 transition hover:bg-green-50/30"
                    >
                      <td className="px-6 py-4">
                        <p className="font-medium text-zinc-900">{user.name}</p>
                        <p className="text-xs text-zinc-500">{user.email}</p>
                      </td>
                      <td className="px-6 py-4 text-zinc-600">{roleLabel(user.role)}</td>
                      <td className="px-6 py-4 text-zinc-600">{user.department}</td>
                      <td className="px-6 py-4">
                        <Pill variant={statusVariants[user.status]}>{user.status}</Pill>
                      </td>
                      <td className="px-6 py-4 text-zinc-500">{format(user.lastLogin, 'dd MMM yyyy')}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => openViewUser(user)}
                            aria-label="View user"
                            className="cursor-pointer text-zinc-500 hover:text-green-800"
                          >
                            <FaEye className="text-sm" />
                          </button>
                          <button
                            type="button"
                            onClick={() => openEditUser(user)}
                            aria-label="Edit user"
                            className="cursor-pointer text-zinc-500 hover:text-green-800"
                          >
                            <FaPen className="text-sm" />
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteUser(user.id)}
                            aria-label="Delete user"
                            className="cursor-pointer text-red-500 hover:text-red-600"
                          >
                            <FaTrash className="text-sm" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="border-b border-zinc-200 bg-green-50 text-green-900">
                  <tr>
                    <th className="px-6 py-3 text-md font-bold">Service</th>
                    <th className="px-6 py-3 text-md font-bold">Fee (UGX)</th>
                  </tr>
                </thead>
                <tbody>
                  {feeRows.map((row) => (
                    <tr key={row.id} className="border-b border-zinc-100 last:border-0">
                      <td className="px-6 py-3">
                        <Input value={row.label} onChange={(e) => updateFeeRow(row.id, 'label', e.target.value)} />
                      </td>
                      <td className="px-6 py-3">
                        <div className="w-full inline-flex gap-4">
                          <Input
                            type="number"
                            min={0}
                            value={row.fee}
                            onChange={(e) => updateFeeRow(row.id, 'fee', e.target.value)}
                          />
                          <button
                            type="button"
                            onClick={() => {}}
                            aria-label="Delete user"
                            className="cursor-pointer text-red-500 hover:text-red-600"
                          >
                            <FaTrash className="text-md" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <Button type="button" variant={ButtonVariantEnum.PRIMARY} className="w-fit">
            Save changes
          </Button>
        </div>
      )}

      <Drawer
        open={drawerMode !== null}
        onClose={() => setDrawerMode(null)}
        title={
          drawerMode === ModalDrawerModeEnum.EDIT
            ? 'Edit user'
            : drawerMode === ModalDrawerModeEnum.VIEW
              ? 'View user'
              : 'Add user'
        }
        width="w-125"
      >
        <div className="flex flex-col gap-4">
          <Input
            label="Full name"
            value={userForm.name}
            disabled={drawerMode === ModalDrawerModeEnum.VIEW}
            onChange={(e) => setUserForm((prev) => ({ ...prev, name: e.target.value }))}
          />
          <Input
            label="Email"
            type="email"
            value={userForm.email}
            disabled={drawerMode === ModalDrawerModeEnum.VIEW}
            onChange={(e) => setUserForm((prev) => ({ ...prev, email: e.target.value }))}
          />
          <Input
            label="Department"
            value={userForm.department}
            disabled={drawerMode === ModalDrawerModeEnum.VIEW}
            onChange={(e) => setUserForm((prev) => ({ ...prev, department: e.target.value }))}
          />
          <Dropdown
            label="Role"
            options={roleOptions}
            value={userForm.role}
            isDisabled={drawerMode === ModalDrawerModeEnum.VIEW}
            onChange={(value) =>
              setUserForm((prev) => ({ ...prev, role: (Array.isArray(value) ? value[0] : value) ?? prev.role }))
            }
          />
          <Dropdown
            label="Status"
            options={statusOptions}
            value={userForm.status}
            isDisabled={drawerMode === ModalDrawerModeEnum.VIEW}
            onChange={(value) =>
              setUserForm((prev) => ({ ...prev, status: (Array.isArray(value) ? value[0] : value) ?? prev.status }))
            }
          />
          {drawerMode !== ModalDrawerModeEnum.VIEW && (
            <Button type="button" onClick={saveUser} className="w-full justify-center">
              {drawerMode === ModalDrawerModeEnum.EDIT ? 'Save changes' : 'Add user'}
            </Button>
          )}
        </div>
      </Drawer>
    </div>
  );
}
