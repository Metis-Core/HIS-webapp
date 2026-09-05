import type { IBaseEntity } from './base.interface';
import type {
  NotificationChannelEnum,
  NotificationPriorityEnum,
  NotificationStatusEnum,
  NotificationTypeEnum,
} from '@/enum';

export interface INotification extends IBaseEntity {
  userId: string;
  type: NotificationTypeEnum;
  channel: NotificationChannelEnum;
  priority: NotificationPriorityEnum;
  status: NotificationStatusEnum;
  title: string;
  body: string;
  actionUrl?: string | null;
  resourceType?: string | null;
  resourceId?: string | null;
  readAt?: Date | null;
}

export interface ICreateNotificationDto {
  userId: string;
  type?: NotificationTypeEnum;
  channel?: NotificationChannelEnum;
  priority?: NotificationPriorityEnum;
  title: string;
  body: string;
  actionUrl?: string;
  resourceType?: string;
  resourceId?: string;
}

export type IUpdateNotificationDto = Partial<ICreateNotificationDto>;

export interface INotificationFilters {
  page?: number;
  limit?: number;
  userId?: string;
  status?: NotificationStatusEnum;
  type?: NotificationTypeEnum;
}

export interface IUnreadCountResponse {
  unread: number;
}

export interface IMarkAllReadResponse {
  updated: number;
}
