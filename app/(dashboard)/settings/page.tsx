'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import useSWR from 'swr';
import { FaEye, FaMoneyBillWave, FaPen, FaPlus, FaTrash, FaUsersCog } from 'react-icons/fa';
import { Button, Pill, ServiceDrawer, UserDrawer } from '@/components';
import { publicApi } from '@/helpers/axios';
import { ModalDrawerModeEnum, PillVariantEnum } from '@/enum';
import { roleLabel, statusVariants } from '@/data/users';
import type { IPagination, IService, IUser, ServiceFormValues, UserFormValues } from '@/interfaces';

type SettingsTab = 'users' | 'services';

const tabs: { id: SettingsTab; label: string; icon: typeof FaUsersCog }[] = [
  { id: 'users', label: 'User Management', icon: FaUsersCog },
  { id: 'services', label: 'Services', icon: FaMoneyBillWave },
];

export default function SettingsPage() {
  const [tab, setTab] = useState<SettingsTab>('users');

  const { data: usersData, mutate: mutateUsers } = useSWR<{ data: { data: IPagination<IUser> } }>('/users', publicApi);
  const users = usersData?.data.data.items ?? [];

  const { data: servicesData, mutate: mutateServices } = useSWR<IPagination<IService>>('/services', publicApi);
  const services = servicesData?.items ?? [];

  const [userDrawerMode, setUserDrawerMode] = useState<ModalDrawerModeEnum | null>(null);
  const [selectedUser, setSelectedUser] = useState<IUser | null>(null);

  const [serviceDrawerMode, setServiceDrawerMode] = useState<ModalDrawerModeEnum | null>(null);
  const [selectedService, setSelectedService] = useState<IService | null>(null);

  const openAddUser = () => {
    setSelectedUser(null);
    setUserDrawerMode(ModalDrawerModeEnum.ADD);
  };

  const openEditUser = (user: IUser) => {
    setSelectedUser(user);
    setUserDrawerMode(ModalDrawerModeEnum.EDIT);
  };

  const openViewUser = (user: IUser) => {
    setSelectedUser(user);
    setUserDrawerMode(ModalDrawerModeEnum.VIEW);
  };

  const closeUserDrawer = () => {
    setUserDrawerMode(null);
    setSelectedUser(null);
  };

  const deleteUser = async (id: string) => {
    if (!window.confirm('Delete this user?')) return;
    try {
      await publicApi.delete(`/users/${id}`);
      await mutateUsers();
    } catch (error) {
      console.log('Error');
      console.log(error);
    }
  };

  const saveUser = async (values: UserFormValues) => {
    try {
      const payload: Record<string, unknown> = { ...values };
      if (values.password) payload.password = values.password;

      if (userDrawerMode === ModalDrawerModeEnum.EDIT && selectedUser) {
        await publicApi.patch(`/users/${selectedUser.id}`, payload);
      } else {
        await publicApi.post('/users', payload);
      }
      await mutateUsers();
      closeUserDrawer();
    } catch (error) {
      console.log('Error');
      console.log(error);
    }
  };

  const openAddService = () => {
    setSelectedService(null);
    setServiceDrawerMode(ModalDrawerModeEnum.ADD);
  };

  const openEditService = (service: IService) => {
    setSelectedService(service);
    setServiceDrawerMode(ModalDrawerModeEnum.EDIT);
  };

  const openViewService = (service: IService) => {
    setSelectedService(service);
    setServiceDrawerMode(ModalDrawerModeEnum.VIEW);
  };

  const closeServiceDrawer = () => {
    setServiceDrawerMode(null);
    setSelectedService(null);
  };

  const deleteService = async (id: string) => {
    if (!window.confirm('Delete this service?')) return;
    try {
      await publicApi.delete(`/services/${id}`);
      await mutateServices();
    } catch (error) {
      console.log('Error');
      console.log(error);
    }
  };

  const saveService = async (values: ServiceFormValues) => {
    try {
      const payload = { ...values };

      if (serviceDrawerMode === ModalDrawerModeEnum.EDIT && selectedService) {
        await publicApi.patch(`/services/${selectedService.id}`, payload);
      } else {
        await publicApi.post('/services', payload);
      }
      await mutateServices();
      closeServiceDrawer();
    } catch (error) {
      console.log('Error');
      console.log(error);
    }
  };

  return (
    <div className="flex flex-col gap-6 py-4">
      <div className="flex items-center justify-between border-b border-zinc-200">
        <div className="flex gap-2">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => {
                setTab(id);
              }}
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
          <Button type="button" onClick={openAddService}>
            <FaPlus className="text-sm" />
            Add service
          </Button>
        )}
      </div>

      {tab === 'users' ? (
        <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="border-b border-zinc-200 bg-green-50 text-green-900">
                <tr>
                  <th className="px-6 py-3 text-md font-bold">Username</th>
                  <th className="px-6 py-3 text-md font-bold">Role</th>
                  <th className="px-6 py-3 text-md font-bold">Department</th>
                  <th className="px-6 py-3 text-md font-bold">Status</th>
                  <th className="px-6 py-3 text-md font-bold">Password changed</th>
                  <th className="px-6 py-3 text-md font-bold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-zinc-500">
                      No users found.
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr
                      key={user.id}
                      className="border-b border-zinc-100 last:border-0 transition hover:bg-green-50/30"
                    >
                      <td className="px-6 py-4">
                        <p className="font-medium text-zinc-900">{user.username}</p>
                        <p className="text-xs text-zinc-500">{user.email}</p>
                      </td>
                      <td className="px-6 py-4 text-zinc-600">{roleLabel(user.role)}</td>
                      <td className="px-6 py-4 text-zinc-600">{roleLabel(user.department)}</td>
                      <td className="px-6 py-4">
                        <Pill variant={statusVariants[user.status]}>{user.status}</Pill>
                      </td>
                      <td className="px-6 py-4 text-zinc-500">
                        {user.passwordLastChangedAt
                          ? format(new Date(user.passwordLastChangedAt), 'dd MMM yyyy')
                          : 'Never'}
                      </td>
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
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="border-b border-zinc-200 bg-green-50 text-green-900">
                <tr>
                  <th className="px-6 py-3 text-md font-bold">Service</th>
                  <th className="px-6 py-3 text-md font-bold">Fee (UGX)</th>
                  <th className="px-6 py-3 text-md font-bold">Status</th>
                  <th className="px-6 py-3 text-md font-bold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {services.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-10 text-center text-zinc-500">
                      No services found.
                    </td>
                  </tr>
                ) : (
                  services.map((service) => (
                    <tr
                      key={service.id}
                      className="border-b border-zinc-100 last:border-0 transition hover:bg-green-50/30"
                    >
                      <td className="px-6 py-4">
                        <p className="font-medium text-zinc-900">{service.name}</p>
                        {service.description && <p className="text-xs text-zinc-500">{service.description}</p>}
                      </td>
                      <td className="px-6 py-4 text-zinc-600">{service.fee.toLocaleString()}</td>
                      <td className="px-6 py-4">
                        <Pill variant={service.isActive ? PillVariantEnum.SUCCESS : PillVariantEnum.DEFAULT}>
                          {service.isActive ? 'Active' : 'Inactive'}
                        </Pill>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => openViewService(service)}
                            aria-label="View service"
                            className="cursor-pointer text-zinc-500 hover:text-green-800"
                          >
                            <FaEye className="text-sm" />
                          </button>
                          <button
                            type="button"
                            onClick={() => openEditService(service)}
                            aria-label="Edit service"
                            className="cursor-pointer text-zinc-500 hover:text-green-800"
                          >
                            <FaPen className="text-sm" />
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteService(service.id)}
                            aria-label="Delete service"
                            className="cursor-pointer text-red-500 hover:text-red-600"
                          >
                            <FaTrash className="text-sm" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <UserDrawer
        mode={userDrawerMode}
        user={selectedUser}
        onClose={closeUserDrawer}
        onSave={saveUser}
        onEdit={openEditUser}
      />
      <ServiceDrawer
        mode={serviceDrawerMode}
        service={selectedService}
        onClose={closeServiceDrawer}
        onSave={saveService}
        onEdit={openEditService}
      />
    </div>
  );
}
