'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components';
import { ButtonVariantEnum } from '@/enum';
import { extractErrorMessage } from '@/helpers/errors';
import { useThread } from '@/hooks';
import type { IStaffContact } from '@/interfaces';

const MAX_LENGTH = 2000;

const clock = (iso: string | Date) =>
  new Date(iso).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });

interface ThreadPanelProps {
  contact: IStaffContact;
  /** The visit a new message is about, e.g. when opened from a patient's page. */
  visitId?: string;
  unread: number;
}

/** One conversation: messages oldest first, and a box to reply. Opening it marks the messages as read. */
export default function ThreadPanel({ contact, visitId, unread }: ThreadPanelProps) {
  const { messages, send, markRead } = useThread(contact.id);
  const [text, setText] = useState('');
  const [about, setAbout] = useState(visitId);
  const [busy, setBusy] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (unread > 0) void markRead();
    // markRead is recreated each render; the unread count is what should trigger it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unread, contact.id]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end' });
  }, [messages.length]);

  const submit = async () => {
    const body = text.trim();
    if (!body || busy) return;
    setBusy(true);
    try {
      await send({ recipientId: contact.id, body, visitId: about });
      setText('');
      setAbout(undefined);
    } catch (err) {
      toast.error(extractErrorMessage(err, "Couldn't send — retry"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex h-full flex-col">
      <header className="border-b border-line px-5 py-3">
        <h2 className="text-sm font-semibold text-ink">{contact.username}</h2>
        <p className="text-xs capitalize text-ink-muted">{contact.role.replaceAll('_', ' ')}</p>
      </header>
      <div className="flex flex-1 flex-col gap-2 overflow-auto px-5 py-4">
        {messages.length === 0 && <p className="text-xs text-ink-muted">No messages yet. Say hello.</p>}
        {messages.map((message) => {
          const mine = message.senderId !== contact.id;
          return (
            <div key={message.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[75%] rounded-lg px-3 py-2 text-sm ${
                  mine ? 'bg-brand text-white' : 'border border-line bg-surface text-ink'
                }`}
              >
                <p className="whitespace-pre-wrap break-words">{message.body}</p>
                {message.visitId && (
                  <Link
                    href={`/queue/${message.visitId}`}
                    className={`mt-1 block text-xs underline ${mine ? 'text-white/90' : 'text-brand'}`}
                  >
                    About a patient visit
                  </Link>
                )}
                <p className={`mt-1 text-[10px] ${mine ? 'text-white/70' : 'text-ink-muted'}`}>
                  {clock(message.createdAt)}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={endRef} />
      </div>
      <form
        className="flex flex-col gap-2 border-t border-line p-3"
        onSubmit={(e) => {
          e.preventDefault();
          void submit();
        }}
      >
        {about && (
          <p className="flex items-center justify-between rounded-md bg-surface px-3 py-1.5 text-xs text-ink-muted">
            This message is about a patient visit.
            <button type="button" onClick={() => setAbout(undefined)} className="font-medium text-brand">
              Remove
            </button>
          </p>
        )}
        <textarea
          rows={2}
          maxLength={MAX_LENGTH}
          value={text}
          placeholder="Write a message"
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              void submit();
            }
          }}
          className="w-full resize-none rounded-lg border border-line bg-surface-raised px-3 py-2 text-sm text-ink outline-none focus:border-brand focus:ring-1 focus:ring-brand"
        />
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-ink-muted">Enter to send, Shift+Enter for a new line</span>
          <Button type="submit" variant={ButtonVariantEnum.PRIMARY} loading={busy} disabled={!text.trim()}>
            Send
          </Button>
        </div>
      </form>
    </div>
  );
}
