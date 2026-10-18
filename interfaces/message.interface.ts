import type { UserRoleEnum } from '@/enum/user.enum';
import type { IBaseEntity } from './base.interface';

export interface IStaffContact {
  id: string;
  username: string;
  role: UserRoleEnum;
}

export interface IConversation {
  user: IStaffContact;
  lastMessage: { body: string; createdAt: string; mine: boolean };
  unread: number;
}

export interface IMessage extends IBaseEntity {
  senderId: string;
  recipientId: string;
  body: string;
  visitId: string | null;
  readAt: string | null;
}

export interface ISendMessageDto {
  recipientId: string;
  body: string;
  visitId?: string;
}
