'use client';

import { useState } from 'react';
import { FaPlus, FaUsers } from 'react-icons/fa';
import { Input } from '@/components';
import { MESSAGE_TEAM_LABEL, MessageTeamEnum } from '@/enum/message.enum';
import { useContacts, useDebouncedValue } from '@/hooks';
import type { IConversation, IStaffContact, ITeamConversation } from '@/interfaces';

const ago = (iso: string) => {
  const minutes = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60_000));
  if (minutes < 1) return 'now';
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.round(minutes / 60);
  return hours < 24 ? `${hours} h` : `${Math.round(hours / 24)} d`;
};

interface ConversationListProps {
  conversations: IConversation[];
  teams: ITeamConversation[];
  activeId: string | null;
  activeTeam: MessageTeamEnum | null;
  onOpen: (contact: IStaffContact) => void;
  onOpenTeam: (team: MessageTeamEnum) => void;
}

/** Everyone the user has talked to, newest first, with a way to start a new conversation. */
export default function ConversationList({
  conversations,
  teams,
  activeId,
  activeTeam,
  onOpen,
  onOpenTeam,
}: ConversationListProps) {
  const [adding, setAdding] = useState(false);
  const [text, setText] = useState('');
  const search = useDebouncedValue(text.trim(), 250);
  const contacts = useContacts(search, adding);

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-line px-4 py-3">
        <h2 className="text-sm font-semibold text-ink">Messages</h2>
        <button
          type="button"
          onClick={() => setAdding((v) => !v)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-brand px-2.5 py-1.5 text-xs font-medium text-white"
        >
          <FaPlus className="text-[10px]" aria-hidden /> New
        </button>
      </div>
      {adding && (
        <div className="flex flex-col gap-2 border-b border-line p-3">
          <Input placeholder="Search a colleague" value={text} onChange={(e) => setText(e.target.value)} />
          <ul className="max-h-48 overflow-auto">
            {Object.values(MessageTeamEnum)
              .filter((team) => MESSAGE_TEAM_LABEL[team].toLowerCase().includes(text.trim().toLowerCase()))
              .map((team) => (
                <li key={team}>
                  <button
                    type="button"
                    onClick={() => {
                      setAdding(false);
                      setText('');
                      onOpenTeam(team);
                    }}
                    className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-sm hover:bg-surface"
                  >
                    <span className="flex items-center gap-2 text-ink">
                      <FaUsers className="text-brand" aria-hidden /> {MESSAGE_TEAM_LABEL[team]}
                    </span>
                    <span className="text-xs text-ink-muted">Whole team</span>
                  </button>
                </li>
              ))}
            {contacts.length === 0 ? (
              <li className="px-1 py-2 text-xs text-ink-muted">Nobody found</li>
            ) : (
              contacts.map((contact) => (
                <li key={contact.id}>
                  <button
                    type="button"
                    onClick={() => {
                      setAdding(false);
                      setText('');
                      onOpen(contact);
                    }}
                    className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-sm hover:bg-surface"
                  >
                    <span className="text-ink">{contact.username}</span>
                    <span className="text-xs capitalize text-ink-muted">{contact.role.replaceAll('_', ' ')}</span>
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
      <ul className="flex-1 divide-y divide-line overflow-auto">
        {teams.map((t) => (
          <li key={t.team}>
            <button
              type="button"
              onClick={() => onOpenTeam(t.team)}
              className={`flex w-full flex-col gap-0.5 px-4 py-3 text-left hover:bg-surface ${
                activeTeam === t.team ? 'bg-brand-soft/40' : ''
              }`}
            >
              <span className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-2 text-sm font-medium text-ink">
                  <FaUsers className="text-brand" aria-hidden /> {t.label}
                </span>
                <span className="text-[11px] text-ink-muted">{ago(t.lastMessage.createdAt)}</span>
              </span>
              <span className="flex items-center justify-between gap-2">
                <span className="truncate text-xs text-ink-muted">
                  {t.lastMessage.mine ? 'You' : t.lastMessage.senderName}: {t.lastMessage.body}
                </span>
                {t.unread > 0 && (
                  <span className="rounded-full bg-critical px-1.5 text-[10px] font-semibold text-white">
                    {t.unread}
                  </span>
                )}
              </span>
            </button>
          </li>
        ))}
        {conversations.length === 0 && teams.length === 0 ? (
          <li className="px-4 py-6 text-xs text-ink-muted">
            No conversations yet. Use New to message a colleague or a whole team.
          </li>
        ) : (
          conversations.map((c) => (
            <li key={c.user.id}>
              <button
                type="button"
                onClick={() => onOpen(c.user)}
                className={`flex w-full flex-col gap-0.5 px-4 py-3 text-left hover:bg-surface ${
                  activeId === c.user.id ? 'bg-brand-soft/40' : ''
                }`}
              >
                <span className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium text-ink">{c.user.username}</span>
                  <span className="text-[11px] text-ink-muted">{ago(c.lastMessage.createdAt)}</span>
                </span>
                <span className="flex items-center justify-between gap-2">
                  <span className="truncate text-xs text-ink-muted">
                    {c.lastMessage.mine ? 'You: ' : ''}
                    {c.lastMessage.body}
                  </span>
                  {c.unread > 0 && (
                    <span className="rounded-full bg-critical px-1.5 text-[10px] font-semibold text-white">
                      {c.unread}
                    </span>
                  )}
                </span>
              </button>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
