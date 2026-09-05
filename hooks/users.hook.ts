'use client';

import useSWR, { useSWRConfig } from 'swr';
import { UserEndpointEnum } from '@/enum';
import usersService from '@/helpers/users.service';
import type { ICreateUserDto, IPagination, IUpdateUserDto, IUser, IUserFilters } from '@/interfaces';

export function useUsers(filters: IUserFilters = {}) {
  const { mutate } = useSWRConfig();
  const url = usersService.buildListUrl(filters);

  const { data, error, isLoading } = useSWR<IPagination<IUser>>(url);

  const invalidate = () => mutate((key) => typeof key === 'string' && key.startsWith(UserEndpointEnum.BASE));

  const createUser = async (dto: ICreateUserDto) => {
    const user = await usersService.create(dto);
    await invalidate();
    return user;
  };

  const updateUser = async (id: string, dto: IUpdateUserDto) => {
    const user = await usersService.update(id, dto);
    await invalidate();
    return user;
  };

  const removeUser = async (id: string) => {
    await usersService.remove(id);
    await invalidate();
  };

  return {
    users: data?.items ?? [],
    total: data?.total ?? 0,
    page: data?.page ?? 1,
    limit: data?.limit ?? 20,
    isLoading,
    error,
    createUser,
    updateUser,
    removeUser,
  };
}

export function useUserById(id: string | null | undefined) {
  const key = id ? `${UserEndpointEnum.BASE}/${id}` : null;
  const { data, error, isLoading, mutate } = useSWR<IUser>(key);
  return { user: data, isLoading, error, mutate };
}
