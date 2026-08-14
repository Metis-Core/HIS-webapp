'use client';

import useSWR, { useSWRConfig } from 'swr';
import { UserEndpointEnum } from '@/enum';
import usersService from '@/helpers/users.service';
import type { ICreateUserDto, IUpdateUserDto, IUserFilters } from '@/interfaces';

export function useUsers(filters: IUserFilters = {}) {
  const { mutate } = useSWRConfig();
  const { data, error, isLoading } = useSWR([UserEndpointEnum.BASE, filters], () => usersService.list(filters));

  const invalidate = () => mutate((key) => Array.isArray(key) && key[0] === UserEndpointEnum.BASE);

  return {
    users: data?.items ?? [],
    total: data?.total ?? 0,
    isLoading,
    error,
    refresh: invalidate,
    createUser: async (dto: ICreateUserDto) => {
      const created = await usersService.create(dto);
      await invalidate();
      return created;
    },
    updateUser: async (id: string, dto: IUpdateUserDto) => {
      const updated = await usersService.update(id, dto);
      await invalidate();
      return updated;
    },
    removeUser: async (id: string) => {
      await usersService.remove(id);
      await invalidate();
    },
  };
}
