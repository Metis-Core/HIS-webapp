'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { PageHeader } from '@/components';
import ConversationList from '@/components/messages/conversation-list';
import ThreadPanel from '@/components/messages/thread-panel';
import TeamThreadPanel from '@/components/messages/team-thread-panel';
import { isMessageTeam } from '@/enum/message.enum';
import { useContact, useConversations, useTeamConversations } from '@/hooks';
import type { IStaffContact } from '@/interfaces';

function MessagesView() {
  const router = useRouter();
  const params = useSearchParams();
  const withId = params.get('with');
  const visitId = params.get('visit') ?? undefined;
  const teamParam = params.get('team');
  const team = isMessageTeam(teamParam) ? teamParam : null;
  const { conversations } = useConversations();
  const teams = useTeamConversations();
  // A person with no conversation yet is held here until the first message is sent.
  const [fresh, setFresh] = useState<IStaffContact | null>(null);

  const existing = conversations.find((c) => c.user.id === withId);
  const held = fresh && fresh.id === withId ? fresh : null;
  const looked = useContact(withId && !existing && !held ? withId : null);
  const active = team ? null : (existing?.user ?? held ?? looked);

  const open = (contact: IStaffContact) => {
    setFresh(contact);
    router.replace(`/messages?with=${contact.id}`);
  };

  const openTeam = (next: typeof team) => router.replace(`/messages?team=${next}`);

  return (
    <div className="flex flex-col gap-4">
      <PageHeader description="Talk to a colleague or write to a whole team such as Pharmacy. A new message also shows as a notification." />
      <div className="grid h-[70vh] overflow-hidden rounded-lg border border-line bg-surface-raised md:grid-cols-[320px_1fr]">
        <div className="border-b border-line md:border-b-0 md:border-r">
          <ConversationList
            conversations={conversations}
            teams={teams}
            activeId={active?.id ?? null}
            activeTeam={team}
            onOpen={open}
            onOpenTeam={openTeam}
          />
        </div>
        {team ? (
          <TeamThreadPanel
            key={team}
            team={team}
            visitId={visitId}
            unread={teams.find((t) => t.team === team)?.unread ?? 0}
          />
        ) : active ? (
          <ThreadPanel key={active.id} contact={active} visitId={visitId} unread={existing?.unread ?? 0} />
        ) : (
          <div className="flex items-center justify-center p-6 text-sm text-ink-muted">
            Pick a conversation, or start a new one.
          </div>
        )}
      </div>
    </div>
  );
}

export default function MessagesPage() {
  return (
    <Suspense>
      <MessagesView />
    </Suspense>
  );
}
