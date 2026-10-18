'use client';

import Link from 'next/link';
import { MESSAGE_TEAM_LABEL, type MessageTeamEnum } from '@/enum/message.enum';
import { useTeamThread } from '@/hooks';
import { useAuth } from '@/providers';
import MessageThread from './message-thread';

interface TeamThreadPanelProps {
  team: MessageTeamEnum;
  visitId?: string;
  unread: number;
}

/** Messages to and from a whole team; whoever is on duty reads them, and a reply goes to the team. */
export default function TeamThreadPanel({ team, visitId, unread }: TeamThreadPanelProps) {
  const { user } = useAuth();
  const { messages, send, markRead } = useTeamThread(team);
  return (
    <MessageThread
      title={MESSAGE_TEAM_LABEL[team]}
      subtitle="Team inbox: everyone on duty in this team sees these messages"
      messages={messages}
      isMine={(message) => message.senderId === user?.id}
      authorOf={(message) => (
        <span className="flex items-center justify-between gap-3">
          {message.sender?.username ?? 'Colleague'}
          <Link href={`/messages?with=${message.senderId}`} className="font-medium text-brand underline">
            Reply privately
          </Link>
        </span>
      )}
      onSend={(body, about) => send({ team, body, visitId: about })}
      onMarkRead={markRead}
      unread={unread}
      visitId={visitId}
      emptyText="Nothing here yet. Write to the whole team."
      placeholder={`Write to ${MESSAGE_TEAM_LABEL[team]}`}
    />
  );
}
