import { api } from './axios';
import { buildQuery } from './crud.service';
import { unwrapData } from './envelope';
import { MessageEndpointEnum } from '@/enum/message.enum';
import type { IMessage, ISendMessageDto } from '@/interfaces';

type Envelope<T> = { status: 'success'; data: T } | T;
const unwrap = <T>(body: Envelope<T>): T => unwrapData(body as { status: 'success'; data: T });

export const messagesService = {
  conversationsUrl: () => MessageEndpointEnum.CONVERSATIONS,
  unreadUrl: () => MessageEndpointEnum.UNREAD,
  contactUrl: (userId: string) => `${MessageEndpointEnum.CONTACTS}/${userId}`,
  contactsUrl: (search = '') => `${MessageEndpointEnum.CONTACTS}${buildQuery({ search })}`,
  threadUrl: (userId: string, page = 1) => `${MessageEndpointEnum.WITH}/${userId}${buildQuery({ page, limit: 50 })}`,

  send: async (dto: ISendMessageDto) => unwrap<IMessage>((await api.post(MessageEndpointEnum.BASE, dto)).data),

  markRead: async (userId: string) => {
    await api.post(`${MessageEndpointEnum.WITH}/${userId}/read`);
  },
};
