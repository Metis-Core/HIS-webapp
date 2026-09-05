'use client';

import { useMemo } from 'react';
import { FaBell } from 'react-icons/fa';
import { toast } from 'sonner';
import { Button, EmptyState, PageHeader, Pill, Stats } from '@/components';
import {
  ButtonVariantEnum,
  NotificationPriorityEnum,
  NotificationStatusEnum,
  PillVariantEnum,
  StatVariantEnum,
} from '@/enum';
import { useMyNotifications } from '@/hooks';
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
  const { notifications, markAsRead, markAllRead, archive } = useMyNotifications({ limit: 50 });

  const stats = useMemo(
    () => [
      {
        label: 'Unread',
        value: notifications.filter((n) => n.status === NotificationStatusEnum.UNREAD).length,
        icon: FaBell,
        variant: StatVariantEnum.Amber,
      },
      {
        label: 'Critical',
        value: notifications.filter((n) => n.priority === NotificationPriorityEnum.CRITICAL).length,
        icon: FaBell,
        variant: StatVariantEnum.Amber,
      },
      {
        label: 'High priority',
        value: notifications.filter((n) => n.priority === NotificationPriorityEnum.HIGH).length,
        icon: FaBell,
        variant: StatVariantEnum.Blue,
      },
      { label: 'Total', value: notifications.length, icon: FaBell, variant: StatVariantEnum.Emerald },
    ],
    [notifications],
  );

  const readAll = async () => {
    await toast.promise(markAllRead(), {
      loading: 'Marking all as read…',
      success: 'All caught up',
      error: "Couldn't update — retry",
    });
  };

  const readOne = async (n: INotification) => {
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
        title="Notifications"
        description="Recent lab results, prescriptions, and system alerts for you."
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
        </div>
      )}
    </div>
  );
}
