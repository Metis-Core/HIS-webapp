'use client';

import { FaExclamationTriangle } from 'react-icons/fa';
import { Button, Modal } from '@/components';
import { ButtonVariantEnum } from '@/enum';

interface AllergyConfirmModalProps {
  message: string | null;
  busy: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export default function AllergyConfirmModal({ message, busy, onConfirm, onClose }: AllergyConfirmModalProps) {
  return (
    <Modal open={Boolean(message)} onClose={onClose} title="Allergy warning">
      <div className="flex flex-col gap-4">
        <p className="flex items-start gap-2 text-sm text-critical">
          <FaExclamationTriangle className="mt-0.5 shrink-0" />
          <span>{message}</span>
        </p>
        <p className="text-xs text-ink-muted">
          Prescribing anyway records that you saw this warning on the prescription.
        </p>
        <div className="flex justify-end gap-2">
          <Button type="button" variant={ButtonVariantEnum.GHOST} onClick={onClose}>
            Change prescription
          </Button>
          <Button type="button" variant={ButtonVariantEnum.PRIMARY} loading={busy} onClick={onConfirm}>
            Prescribe anyway
          </Button>
        </div>
      </div>
    </Modal>
  );
}
