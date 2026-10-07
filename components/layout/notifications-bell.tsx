'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { FaBell } from 'react-icons/fa';
import { useMyNotifications, useUnreadNotificationsCount } from '@/hooks';
import { showNotificationToast } from '@/helpers/notification-toast';
import { NotificationStatusEnum } from '@/enum';

// Fallback only: the live stream normally delivers changes instantly.
const REFRESH_MS = 60_000;

export default function NotificationsBell() {
  const router = useRouter();
  const { unread, refresh } = useUnreadNotificationsCount();
  const { notifications } = useMyNotifications({ limit: 5, status: NotificationStatusEnum.UNREAD });
  const previousUnread = useRef<number | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      refresh();
    }, REFRESH_MS);
    return () => clearInterval(timer);
  }, [refresh]);

  useEffect(() => {
    if (previousUnread.current === null) {
      previousUnread.current = unread;
      return;
    }
    if (unread > previousUnread.current) {
      notifications.slice(0, 3).forEach((n) => showNotificationToast(n, (url) => router.push(url)));
    }
    previousUnread.current = unread;
  }, [unread, notifications, router]);

  const badge = unread > 99 ? '99+' : unread > 0 ? String(unread) : null;

  return (
    <button
      type="button"
      aria-label={`Notifications${badge ? ` (${badge})` : ''}`}
      onClick={() => router.push('/notifications')}
      className="relative flex h-9 w-9 items-center justify-center rounded-lg text-ink-muted transition hover:bg-surface hover:text-ink"
    >
      <FaBell className="h-4 w-4" />
      {badge && (
        <span
          aria-hidden
          className="absolute -right-0.5 -top-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-critical px-1 text-[9px] font-semibold tabular-nums text-white"
        >
          {badge}
        </span>
      )}
    </button>
  );
}
