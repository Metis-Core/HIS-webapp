'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { Button, Input, Pagination } from '@/components';
import { ButtonVariantEnum } from '@/enum';
import consultationsService from '@/helpers/consultations.service';
import { extractErrorMessage } from '@/helpers/errors';
import { useConsultationAddenda } from '@/hooks';

interface AddendaSectionProps {
  consultationId: string;
  canAdd: boolean;
}

/** Dated notes added after signing; the signed record itself stays unchanged (M-10). */
export default function AddendaSection({ consultationId, canAdd }: AddendaSectionProps) {
  const [page, setPage] = useState(1);
  const { addenda, pagination, isLoading, mutate } = useConsultationAddenda(consultationId, { page });
  const [body, setBody] = useState('');
  const [busy, setBusy] = useState(false);

  const add = async () => {
    if (!body.trim()) return;
    setBusy(true);
    try {
      await toast
        .promise(consultationsService.addAddendum(consultationId, { body: body.trim() }), {
          loading: 'Adding addendum…',
          success: 'Addendum added',
          error: (err) => extractErrorMessage(err, "Couldn't add — retry"),
        })
        .unwrap();
      setBody('');
      setPage(1);
      await mutate();
    } catch {
      // The toast already reported the failure.
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="flex flex-col gap-3 rounded-lg border border-line bg-surface-raised p-5">
      <h2 className="text-sm font-semibold text-ink">Addenda</h2>
      {canAdd && (
        <div className="flex items-end gap-2">
          <div className="flex-1">
            <Input label="New addendum" value={body} onChange={(e) => setBody(e.target.value)} maxLength={5000} />
          </div>
          <Button
            type="button"
            variant={ButtonVariantEnum.PRIMARY}
            loading={busy}
            onClick={add}
            disabled={!body.trim()}
          >
            Add
          </Button>
        </div>
      )}
      {addenda.length === 0 ? (
        <p className="text-xs text-ink-muted">{isLoading ? 'Loading…' : 'No addenda.'}</p>
      ) : (
        <ul className="flex flex-col divide-y divide-line rounded-md border border-line">
          {addenda.map((a) => (
            <li key={a.id} className="flex flex-col gap-1 px-3 py-2 text-sm">
              <span className="text-xs text-ink-muted">
                {format(new Date(a.createdAt), 'dd MMM yyyy HH:mm')}
                {a.author ? ` · ${a.author.firstName ?? ''} ${a.author.lastName ?? a.author.username ?? ''}` : ''}
              </span>
              <p className="whitespace-pre-wrap text-ink">{a.body}</p>
            </li>
          ))}
        </ul>
      )}
      {pagination.total > pagination.limit && <Pagination {...pagination} onPageChange={setPage} label="Addenda" />}
    </section>
  );
}
