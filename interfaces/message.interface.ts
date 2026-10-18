import type { MessageTeamEnum } from '@/enum/message.enum';
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

export interface ITeamConversation {
  team: MessageTeamEnum;
  label: string;
  lastMessage: { body: string; createdAt: string; mine: boolean; senderName: string };
  unread: number;
}

export interface IMessage extends IBaseEntity {
  senderId: string;
  recipientId: string;
  body: string;
  visitId: string | null;
  readAt: string | null;
  teamRole?: MessageTeamEnum | null;
  sender?: { id: string; username: string };
}

/** Write to one person (`recipientId`) or to a whole team, never both. */
export interface ISendMessageDto {
  recipientId?: string;
  team?: MessageTeamEnum;
  body: string;
  visitId?: string;
}
