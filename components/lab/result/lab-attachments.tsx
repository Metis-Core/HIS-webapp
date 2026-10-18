'use client';

import { useRef, useState } from 'react';
import { FaPaperclip, FaTrash } from 'react-icons/fa';
import { toast } from 'sonner';
import { Button } from '@/components';
import { ButtonVariantEnum } from '@/enum';
import { extractErrorMessage } from '@/helpers/errors';
import { labWorkService } from '@/helpers/lab-work.service';
import { useLabAttachments } from '@/hooks';
import type { ILabAttachment } from '@/interfaces';

/** The server checks the real file type; this only narrows the picker. */
const ACCEPT = '.pdf,.docx,.jpg,.jpeg,application/pdf,image/jpeg';

interface LabAttachmentsProps {
  orderId: string;
  itemId: string;
  canUpload: boolean;
  /** Files stay once the result is verified (part of the signed record). */
  canDelete: boolean;
}

const sizeLabel = (bytes: number) =>
  bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.ceil(bytes / 1024)} KB`;

/** L8: analyser printouts and scanned slips (PDF, DOCX, JPEG). */
export default function LabAttachments({ orderId, itemId, canUpload, canDelete }: LabAttachmentsProps) {
  const { attachments, mutate } = useLabAttachments(orderId, itemId);
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  const upload = async (file: File | undefined) => {
    if (!file) return;
    setBusy(true);
    try {
      await labWorkService.uploadAttachment(orderId, itemId, file);
      toast.success(`${file.name} attached`);
      await mutate();
    } catch (err) {
      toast.error(extractErrorMessage(err, "Couldn't attach the file"));
    } finally {
      setBusy(false);
      if (input.current) input.current.value = '';
    }
  };

  const download = (a: ILabAttachment) =>
    labWorkService
      .downloadAttachment(orderId, itemId, a)
      .catch((err) => toast.error(extractErrorMessage(err, "Couldn't download")));

  const remove = async (a: ILabAttachment) => {
    if (!confirm(`Remove ${a.fileName}?`)) return;
    try {
      await labWorkService.removeAttachment(orderId, itemId, a.id);
      await mutate();
    } catch (err) {
      toast.error(extractErrorMessage(err, "Couldn't remove the file"));
    }
  };

  if (!canUpload && attachments.length === 0) return null;
  return (
    <div className="flex flex-col gap-1 text-xs">
      {attachments.map((a) => (
        <div key={a.id} className="flex items-center justify-between gap-2">
          <button type="button" className="truncate text-left text-brand hover:underline" onClick={() => download(a)}>
            <FaPaperclip className="mr-1 inline" />
            {a.fileName} <span className="text-ink-muted">({sizeLabel(a.sizeBytes)})</span>
          </button>
          {canDelete && (
            <button type="button" aria-label={`Remove ${a.fileName}`} onClick={() => remove(a)}>
              <FaTrash className="text-ink-muted hover:text-critical" />
            </button>
          )}
        </div>
      ))}
      {canUpload && (
        <div>
          <input
            ref={input}
            type="file"
            accept={ACCEPT}
            className="hidden"
            onChange={(e) => upload(e.target.files?.[0])}
          />
          <Button type="button" variant={ButtonVariantEnum.GHOST} loading={busy} onClick={() => input.current?.click()}>
            <FaPaperclip /> Attach file
          </Button>
        </div>
      )}
    </div>
  );
}
