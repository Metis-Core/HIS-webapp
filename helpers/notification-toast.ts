import { toast } from 'sonner';
import { NotificationPriorityEnum } from '@/enum';
import type { INotification } from '@/interfaces';

const shown = new Set<string>();

/** Shows a toast once per notification id, whichever channel (live stream or polling) sees it first. */
export function showNotificationToast(notification: INotification, open: (url: string) => void): void {
  if (shown.has(notification.id)) return;
  shown.add(notification.id);

  const urgent =
    notification.priority === NotificationPriorityEnum.CRITICAL ||
    notification.priority === NotificationPriorityEnum.HIGH;
  const show = urgent ? toast.warning : toast;

  show(notification.title, {
    description: notification.body,
    duration: notification.priority === NotificationPriorityEnum.CRITICAL ? 12_000 : 6_000,
    action: {
      label: 'Open',
      onClick: () => open(notification.actionUrl || '/notifications'),
    },
  });
}
