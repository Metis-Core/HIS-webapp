'use client';

import { Button } from '@/components';
import { ButtonVariantEnum, LabOrderItemStatusEnum as S } from '@/enum';

interface LabItemActionsProps {
  status: S;
  busy: boolean;
  onMove: (status: S) => void;
  onVerify: () => void;
  onAmend: () => void;
}

/** Bench steps the API allows from the current status (C1 collect, H-10 verify/amend). */
export default function LabItemActions({ status, busy, onMove, onVerify, onAmend }: LabItemActionsProps) {
  const cancel = () => {
    if (confirm('Cancel this test? It cannot be resulted afterwards.')) onMove(S.CANCELLED);
  };
  const open = status !== S.VERIFIED && status !== S.CANCELLED;
  return (
    <div className="flex flex-wrap justify-end gap-2">
      {status === S.PENDING && (
        <Button type="button" variant={ButtonVariantEnum.SECONDARY} disabled={busy} onClick={() => onMove(S.COLLECTED)}>
          Mark sample collected
        </Button>
      )}
      {status === S.COLLECTED && (
        <Button
          type="button"
          variant={ButtonVariantEnum.SECONDARY}
          disabled={busy}
          onClick={() => onMove(S.IN_PROCESS)}
        >
          Start processing
        </Button>
      )}
      {status === S.RESULT_READY && (
        <Button type="button" variant={ButtonVariantEnum.PRIMARY} disabled={busy} onClick={onVerify}>
          Verify &amp; release
        </Button>
      )}
      {status === S.VERIFIED && (
        <Button type="button" variant={ButtonVariantEnum.SECONDARY} disabled={busy} onClick={onAmend}>
          Amend result
        </Button>
      )}
      {open && (
        <Button type="button" variant={ButtonVariantEnum.GHOST} disabled={busy} onClick={cancel}>
          Cancel test
        </Button>
      )}
    </div>
  );
}
