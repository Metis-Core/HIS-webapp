'use client';

import useSWR, { useSWRConfig } from 'swr';
import { MessageEndpointEnum } from '@/enum/message.enum';
import { messagesService } from '@/helpers/messages.service';
import type { IStaffContact, IConversation, IMessage, IPagination, ISendMessageDto } from '@/interfaces';

const POLL_MS = 30_000;

const isMessageKey = (key: unknown) => typeof key === 'string' && key.startsWith(MessageEndpointEnum.BASE);

/** Unread count for the sidebar badge; a live notification refreshes it, polling repairs a missed one. */
export function useUnreadMessages(enabled = true) {
  const { data } = useSWR<{ unread: number }>(enabled ? messagesService.unreadUrl() : null, {
    refreshInterval: POLL_MS,
  });
  return data?.unread ?? 0;
}

export function useConversations() {
  const { data, isLoading } = useSWR<IConversation[]>(messagesService.conversationsUrl(), {
    refreshInterval: POLL_MS,
  });
  return { conversations: data ?? [], isLoading };
}

export function useThread(userId: string | null) {
  const { mutate } = useSWRConfig();
  const { data, isLoading } = useSWR<IPagination<IMessage>>(userId ? messagesService.threadUrl(userId) : null, {
    refreshInterval: POLL_MS,
  });

  const markRead = async () => {
    if (!userId) return;
    await messagesService.markRead(userId);
    await mutate(isMessageKey);
  };

  const send = async (dto: ISendMessageDto) => {
    const message = await messagesService.send(dto);
    await mutate(isMessageKey);
    return message;
  };

  // Newest first from the API; shown oldest first.
  return { messages: [...(data?.items ?? [])].reverse(), isLoading, markRead, send };
}

/** One person by id, for a link that opens a conversation with someone not messaged before. */
export function useContact(userId: string | null) {
  const { data } = useSWR<IStaffContact>(userId ? messagesService.contactUrl(userId) : null);
  return data ?? null;
}

export function useContacts(search: string, enabled = true) {
  const { data } = useSWR<IStaffContact[]>(enabled ? messagesService.contactsUrl(search) : null, {
    keepPreviousData: true,
  });
  return data ?? [];
}
