'use client';

import useSWR, { useSWRConfig } from 'swr';
import { NotificationEndpointEnum } from '@/enum';
import notificationsService from '@/helpers/notifications.service';
import type {
  ICreateNotificationDto,
  INotification,
  INotificationFilters,
  IPagination,
  IUnreadCountResponse,
} from '@/interfaces';

const isNotificationKey = (key: unknown) => typeof key === 'string' && key.startsWith(NotificationEndpointEnum.BASE);

export function useNotifications(filters: INotificationFilters = {}) {
  const { mutate } = useSWRConfig();
  const url = notificationsService.buildListUrl(filters);

  const { data, error, isLoading } = useSWR<IPagination<INotification>>(url);

  const invalidate = () => mutate(isNotificationKey);

  const createNotification = async (dto: ICreateNotificationDto) => {
    const notification = await notificationsService.create(dto);
    await invalidate();
    return notification;
  };

  const removeNotification = async (id: string) => {
    await notificationsService.remove(id);
    await invalidate();
  };

  return {
    notifications: data?.items ?? [],
    total: data?.total ?? 0,
    isLoading,
    error,
    createNotification,
    removeNotification,
  };
}

export function useMyNotifications(filters: INotificationFilters = {}) {
  const { mutate } = useSWRConfig();
  const url = notificationsService.buildMineUrl(filters);

  const { data, error, isLoading } = useSWR<IPagination<INotification>>(url);

  const invalidate = () => mutate(isNotificationKey);

  const markAsRead = async (id: string) => {
    const n = await notificationsService.markAsRead(id);
    await invalidate();
    return n;
  };

  const markAllRead = async () => {
    const res = await notificationsService.markAllRead();
    await invalidate();
    return res;
  };

  const archive = async (id: string) => {
    const n = await notificationsService.archive(id);
    await invalidate();
    return n;
  };

  return {
    notifications: data?.items ?? [],
    total: data?.total ?? 0,
    isLoading,
    error,
    markAsRead,
    markAllRead,
    archive,
  };
}

export function useUnreadNotificationsCount() {
  const { data, error, isLoading, mutate } = useSWR<IUnreadCountResponse>(NotificationEndpointEnum.UNREAD_COUNT);
  return {
    unread: data?.unread ?? 0,
    isLoading,
    error,
    refresh: mutate,
  };
}
