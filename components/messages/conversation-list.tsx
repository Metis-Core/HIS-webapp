'use client';

import { useState } from 'react';
import { FaPlus } from 'react-icons/fa';
import { Input } from '@/components';
import { useContacts, useDebouncedValue } from '@/hooks';
import type { IConversation, IStaffContact } from '@/interfaces';

const ago = (iso: string) => {
  const minutes = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60_000));
  if (minutes < 1) return 'now';
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.round(minutes / 60);
  return hours < 24 ? `${hours} h` : `${Math.round(hours / 24)} d`;
};

interface ConversationListProps {
  conversations: IConversation[];
  activeId: string | null;
  onOpen: (contact: IStaffContact) => void;
}

/** Everyone the user has talked to, newest first, with a way to start a new conversation. */
export default function ConversationList({ conversations, activeId, onOpen }: ConversationListProps) {
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
        {conversations.length === 0 ? (
          <li className="px-4 py-6 text-xs text-ink-muted">No conversations yet. Use New to message a colleague.</li>
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
