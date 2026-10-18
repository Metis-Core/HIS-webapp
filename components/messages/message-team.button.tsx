'use client';

import { useState } from 'react';
import { FaUsers } from 'react-icons/fa';
import { toast } from 'sonner';
import { Button, Dropdown, Modal } from '@/components';
import { ButtonVariantEnum } from '@/enum';
import { MESSAGE_TEAM_LABEL, MessageTeamEnum } from '@/enum/message.enum';
import { extractErrorMessage } from '@/helpers/errors';
import { useSendMessage } from '@/hooks';
import type { IOption } from '@/interfaces';

const teamOptions: IOption[] = Object.values(MessageTeamEnum).map((team) => ({
  label: MESSAGE_TEAM_LABEL[team],
  value: team,
}));

interface Props {
  /** Fixed team for a context such as a lab order; leave out to let the sender choose. */
  team?: MessageTeamEnum;
  visitId?: string | null;
  label?: string;
}

/** Sends one message to a whole team, so whoever is on duty there sees it, linked to the visit it is about. */
export default function MessageTeamButton({ team, visitId, label }: Props) {
  const [open, setOpen] = useState(false);
  const send = useSendMessage();
  const [chosen, setChosen] = useState<IOption | null>(null);
  const [body, setBody] = useState('');
  const [busy, setBusy] = useState(false);
  const target = team ?? (chosen?.value as MessageTeamEnum | undefined);

  const close = () => {
    setOpen(false);
    setBody('');
    setChosen(null);
  };

  const submit = async () => {
    if (!target || !body.trim() || busy) return;
    setBusy(true);
    try {
      await send({ team: target, body: body.trim(), visitId: visitId ?? undefined });
      toast.success(`Sent to ${MESSAGE_TEAM_LABEL[target]}`);
      close();
    } catch (err) {
      toast.error(extractErrorMessage(err, "Couldn't send — retry"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <Button type="button" variant={ButtonVariantEnum.SECONDARY} onClick={() => setOpen(true)}>
        <FaUsers className="text-xs" aria-hidden />{' '}
        {label ?? (team ? `Message ${MESSAGE_TEAM_LABEL[team]}` : 'Message a team')}
      </Button>
      <Modal open={open} onClose={close} title={team ? `Message ${MESSAGE_TEAM_LABEL[team]}` : 'Message a team'}>
        <div className="flex flex-col gap-3">
          {!team && (
            <Dropdown
              label="Team"
              options={teamOptions}
              value={chosen}
              onChange={(value) => setChosen(Array.isArray(value) ? (value[0] ?? null) : value)}
            />
          )}
          <p className="text-xs text-ink-muted">
            Everyone on duty in the team sees this
            {visitId ? ', with a link to this patient visit' : ''}.
          </p>
          <textarea
            rows={4}
            maxLength={2000}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Write your message"
            className="w-full resize-none rounded-lg border border-line bg-surface-raised px-3 py-2 text-sm text-ink outline-none focus:border-brand focus:ring-1 focus:ring-brand"
          />
          <Button
            type="button"
            variant={ButtonVariantEnum.PRIMARY}
            onClick={() => void submit()}
            loading={busy}
            disabled={!target || !body.trim()}
            className="w-full justify-center"
          >
            Send
          </Button>
        </div>
      </Modal>
    </>
  );
}
