'use client';

import { useThread } from '@/hooks';
import type { IStaffContact } from '@/interfaces';
import MessageThread from './message-thread';

interface ThreadPanelProps {
  contact: IStaffContact;
  /** The visit a new message is about, e.g. when opened from a patient's page. */
  visitId?: string;
  unread: number;
}

/** A conversation with one colleague. */
export default function ThreadPanel({ contact, visitId, unread }: ThreadPanelProps) {
  const { messages, send, markRead } = useThread(contact.id);
  return (
    <MessageThread
      title={contact.username}
      subtitle={contact.role.replaceAll('_', ' ')}
      messages={messages}
      isMine={(message) => message.senderId !== contact.id}
      onSend={(body, about) => send({ recipientId: contact.id, body, visitId: about })}
      onMarkRead={markRead}
      unread={unread}
      visitId={visitId}
      emptyText="No messages yet. Say hello."
      placeholder="Write a message"
    />
  );
}
