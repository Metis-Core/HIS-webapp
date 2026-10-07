'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useSWRConfig } from 'swr';
import { NotificationEndpointEnum, NotificationTypeEnum } from '@/enum';
import authService from '@/helpers/auth.service';
import { API_URL } from '@/helpers/axios';
import { showNotificationToast } from '@/helpers/notification-toast';
import tokenStore from '@/helpers/tokens';
import type { INotification } from '@/interfaces';
import { useAuth } from '@/providers';

const STREAM_URL = `${API_URL}${NotificationEndpointEnum.ME}/stream`;
const MIN_RETRY_MS = 1_000;
const MAX_RETRY_MS = 30_000;

// Cached data that goes stale when a notification of this type arrives.
const STALE_PREFIXES: Partial<Record<NotificationTypeEnum, string[]>> = {
  [NotificationTypeEnum.LAB_RESULT]: ['/lab', '/visits', '/consultations'],
  [NotificationTypeEnum.LAB_ORDER]: ['/lab', '/visits'],
  [NotificationTypeEnum.PRESCRIPTION]: ['/pharmacy', '/visits'],
  [NotificationTypeEnum.QUEUE]: ['/visits', '/triage'],
  [NotificationTypeEnum.VISIT]: ['/visits', '/triage'],
  [NotificationTypeEnum.INVENTORY]: ['/inventory'],
};

type SseHandler = (event: string, data: string) => void;

async function readEvents(response: Response, onEvent: SseHandler): Promise<void> {
  const reader = response.body!.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  for (;;) {
    const { value, done } = await reader.read();
    if (done) return;
    buffer += decoder.decode(value, { stream: true });

    const blocks = buffer.split(/\r?\n\r?\n/);
    buffer = blocks.pop() ?? '';
    for (const block of blocks) {
      let event = 'message';
      const data: string[] = [];
      for (const line of block.split(/\r?\n/)) {
        if (line.startsWith('event:')) event = line.slice(6).trim();
        else if (line.startsWith('data:')) data.push(line.slice(5).trimStart());
      }
      if (data.length > 0) onEvent(event, data.join('\n'));
    }
  }
}

/**
 * Live notification channel (Server-Sent Events over fetch, so the bearer token can be sent as a header).
 * Notifications are persisted server-side; on every (re)connect we refetch so nothing missed is lost.
 */
export default function NotificationStream() {
  const { isAuthenticated } = useAuth();
  const { mutate } = useSWRConfig();
  const router = useRouter();
  const routerRef = useRef(router);

  useEffect(() => {
    routerRef.current = router;
  }, [router]);

  useEffect(() => {
    if (!isAuthenticated) return;

    const controller = new AbortController();
    let retryMs = MIN_RETRY_MS;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const revalidate = (prefixes: string[]) =>
      mutate((key) => typeof key === 'string' && prefixes.some((p) => key.startsWith(p)));

    const onEvent: SseHandler = (event, raw) => {
      if (event !== 'notification') return;
      const notification = JSON.parse(raw) as INotification;
      showNotificationToast(notification, (url) => routerRef.current.push(url));
      revalidate([NotificationEndpointEnum.BASE, ...(STALE_PREFIXES[notification.type] ?? [])]);
    };

    const connect = async () => {
      try {
        if (!tokenStore.getAccessToken()) await authService.refresh();
        const response = await fetch(STREAM_URL, {
          headers: {
            Accept: 'text/event-stream',
            Authorization: `Bearer ${tokenStore.getAccessToken()}`,
          },
          cache: 'no-store',
          signal: controller.signal,
        });
        if (response.status === 401) {
          await authService.refresh();
          throw new Error('Stream unauthorized');
        }
        if (!response.ok || !response.body) throw new Error(`Stream failed (${response.status})`);

        retryMs = MIN_RETRY_MS;
        void revalidate([NotificationEndpointEnum.BASE, '/visits', '/lab', '/pharmacy', '/inventory']);
        await readEvents(response, onEvent);
      } catch {
        // fall through to reconnect
      }
      if (controller.signal.aborted) return;
      timer = setTimeout(connect, retryMs);
      retryMs = Math.min(retryMs * 2, MAX_RETRY_MS);
    };

    void connect();
    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [isAuthenticated, mutate]);

  return null;
}
