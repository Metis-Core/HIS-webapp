'use client';

import Link from 'next/link';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components';
import { ButtonVariantEnum } from '@/enum';
import { extractErrorMessage } from '@/helpers/errors';
import type { IMessage } from '@/interfaces';

const MAX_LENGTH = 2000;

const clock = (iso: string | Date) =>
  new Date(iso).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });

interface MessageThreadProps {
  title: string;
  subtitle: string;
  messages: IMessage[];
  isMine: (message: IMessage) => boolean;
  /** Shown above a message from someone else, e.g. who wrote it in a team thread. */
  authorOf?: (message: IMessage) => ReactNode;
  onSend: (body: string, visitId?: string) => Promise<unknown>;
  onMarkRead: () => Promise<void>;
  unread: number;
  visitId?: string;
  emptyText: string;
  placeholder: string;
}

/** One conversation: messages oldest first and a box to write. Opening it marks the messages as read. */
export default function MessageThread({
  title,
  subtitle,
  messages,
  isMine,
  authorOf,
  onSend,
  onMarkRead,
  unread,
  visitId,
  emptyText,
  placeholder,
}: MessageThreadProps) {
  const [text, setText] = useState('');
  const [about, setAbout] = useState(visitId);
  const [busy, setBusy] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (unread > 0) void onMarkRead();
    // onMarkRead is recreated each render; the unread count is what should trigger it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unread]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end' });
  }, [messages.length]);

  const submit = async () => {
    const body = text.trim();
    if (!body || busy) return;
    setBusy(true);
    try {
      await onSend(body, about);
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
        <h2 className="text-sm font-semibold text-ink">{title}</h2>
        <p className="text-xs capitalize text-ink-muted">{subtitle}</p>
      </header>
      <div className="flex flex-1 flex-col gap-2 overflow-auto px-5 py-4">
        {messages.length === 0 && <p className="text-xs text-ink-muted">{emptyText}</p>}
        {messages.map((message) => {
          const mine = isMine(message);
          return (
            <div key={message.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[75%] rounded-lg px-3 py-2 text-sm ${
                  mine ? 'bg-brand text-white' : 'border border-line bg-surface text-ink'
                }`}
              >
                {!mine && authorOf && <p className="mb-0.5 text-xs font-semibold">{authorOf(message)}</p>}
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
          placeholder={placeholder}
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
