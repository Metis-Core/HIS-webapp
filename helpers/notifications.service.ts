import { api } from './axios';
import { CrudService, buildQuery } from './crud.service';
import { NotificationEndpointEnum } from '@/enum';
import type {
  ICreateNotificationDto,
  IMarkAllReadResponse,
  INotification,
  INotificationFilters,
  IPagination,
  IUnreadCountResponse,
  IUpdateNotificationDto,
} from '@/interfaces';

class NotificationsService extends CrudService<
  INotification,
  ICreateNotificationDto,
  IUpdateNotificationDto,
  INotificationFilters
> {
  constructor() {
    super(NotificationEndpointEnum.BASE);
  }

  buildMineUrl(filters?: INotificationFilters): string {
    return `${NotificationEndpointEnum.ME}${buildQuery(filters as Record<string, unknown>)}`;
  }

  async findMine(filters?: INotificationFilters): Promise<IPagination<INotification>> {
    const { data } = await api.get<IPagination<INotification>>(this.buildMineUrl(filters));
    return data;
  }

  async unreadCount(): Promise<IUnreadCountResponse> {
    const { data } = await api.get<IUnreadCountResponse>(NotificationEndpointEnum.UNREAD_COUNT);
    return data;
  }

  async markAsRead(id: string): Promise<INotification> {
    const { data } = await api.post<INotification>(`${NotificationEndpointEnum.BASE}/${id}/read`);
    return data;
  }

  async archive(id: string): Promise<INotification> {
    const { data } = await api.post<INotification>(`${NotificationEndpointEnum.BASE}/${id}/archive`);
    return data;
  }

  async markAllRead(): Promise<IMarkAllReadResponse> {
    const { data } = await api.post<IMarkAllReadResponse>(NotificationEndpointEnum.READ_ALL);
    return data;
  }
}

const notificationsService = new NotificationsService();
export default notificationsService;
