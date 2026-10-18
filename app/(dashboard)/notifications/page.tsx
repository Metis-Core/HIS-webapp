'use client';

import { useRouter } from 'next/navigation';
import { FaBell } from 'react-icons/fa';
import { toast } from 'sonner';
import { Button, EmptyState, PageHeader, Pagination, Pill, Stats } from '@/components';
import {
  ButtonVariantEnum,
  NotificationPriorityEnum,
  NotificationStatusEnum,
  PillVariantEnum,
  StatVariantEnum,
} from '@/enum';
import { useListTotal, useMyNotifications, useUrlPage } from '@/hooks';
import notificationsService from '@/helpers/notifications.service';
import type { INotification } from '@/interfaces';

const priorityVariant: Record<NotificationPriorityEnum, PillVariantEnum> = {
  [NotificationPriorityEnum.LOW]: PillVariantEnum.DEFAULT,
  [NotificationPriorityEnum.NORMAL]: PillVariantEnum.INFO,
  [NotificationPriorityEnum.HIGH]: PillVariantEnum.WARNING,
  [NotificationPriorityEnum.CRITICAL]: PillVariantEnum.DANGER,
};

const statusVariant: Record<NotificationStatusEnum, PillVariantEnum> = {
  [NotificationStatusEnum.UNREAD]: PillVariantEnum.WARNING,
  [NotificationStatusEnum.READ]: PillVariantEnum.SUCCESS,
  [NotificationStatusEnum.ARCHIVED]: PillVariantEnum.DEFAULT,
};

export default function NotificationsPage() {
  const router = useRouter();
  const [page, setPage] = useUrlPage();
  const { notifications, pagination, markAsRead, markAllRead, archive } = useMyNotifications({ page });
  // Counts span all of my notifications, not only the page on screen.
  const unreadCount = useListTotal(
    notificationsService.buildMineUrl({ status: NotificationStatusEnum.UNREAD, limit: 1 }),
  );
  const criticalCount = useListTotal(
    notificationsService.buildMineUrl({ priority: NotificationPriorityEnum.CRITICAL, limit: 1 }),
  );
  const highCount = useListTotal(
    notificationsService.buildMineUrl({ priority: NotificationPriorityEnum.HIGH, limit: 1 }),
  );

  const stats = [
    { label: 'Unread', value: unreadCount, icon: FaBell, variant: StatVariantEnum.Amber },
    { label: 'Critical', value: criticalCount, icon: FaBell, variant: StatVariantEnum.Amber },
    { label: 'High priority', value: highCount, icon: FaBell, variant: StatVariantEnum.Blue },
    { label: 'Total', value: pagination.total, icon: FaBell, variant: StatVariantEnum.Emerald },
  ];

  const readAll = async () => {
    await toast.promise(markAllRead(), {
      loading: 'Marking all as read…',
      success: 'All caught up',
      error: "Couldn't update — retry",
    });
  };

  const readOne = async (n: INotification) => {
    if (n.actionUrl) router.push(n.actionUrl);
    if (n.status !== NotificationStatusEnum.UNREAD) return;
    await markAsRead(n.id);
  };

  const archiveOne = async (n: INotification) => {
    await toast.promise(archive(n.id), {
      loading: 'Archiving…',
      success: 'Archived',
      error: "Couldn't archive — retry",
    });
  };

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        description="New patients in your queue, lab results, prescriptions, and stock alerts for you."
        action={
          <Button type="button" variant={ButtonVariantEnum.SECONDARY} onClick={readAll}>
            Mark all read
          </Button>
        }
      />

      <Stats items={stats} />

      {notifications.length === 0 ? (
        <EmptyState message="You're all caught up" icon={FaBell} />
      ) : (
        <div className="flex flex-col divide-y divide-line rounded-lg border border-line bg-surface-raised">
          {notifications.map((n) => (
            <button
              key={n.id}
              type="button"
              onClick={() => readOne(n)}
              className="flex items-start gap-3 px-4 py-3 text-left hover:bg-surface"
            >
              <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface text-ink-muted">
                <FaBell className="h-3.5 w-3.5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3
                    className={`text-sm ${n.status === NotificationStatusEnum.UNREAD ? 'font-semibold text-ink' : 'font-medium text-ink-muted'}`}
                  >
                    {n.title}
                  </h3>
                  <Pill variant={priorityVariant[n.priority] ?? PillVariantEnum.DEFAULT}>{n.priority}</Pill>
                  <Pill variant={statusVariant[n.status] ?? PillVariantEnum.DEFAULT}>{n.status}</Pill>
                </div>
                <p className="mt-0.5 line-clamp-2 text-sm text-ink-muted">{n.body}</p>
                <p className="mt-0.5 text-xs text-ink-muted tabular-nums">{new Date(n.createdAt).toLocaleString()}</p>
              </div>
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  archiveOne(n);
                }}
                className="text-xs font-medium text-ink-muted hover:text-ink"
              >
                Archive
              </span>
            </button>
          ))}
          <Pagination {...pagination} onPageChange={setPage} label="Notification pages" />
        </div>
      )}
    </div>
  );
}
