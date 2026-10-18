'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { useSWRConfig } from 'swr';
import consultationsService from '@/helpers/consultations.service';
import { extractErrorMessage } from '@/helpers/errors';
import type { ICompleteConsultationDto } from '@/interfaces';
import type { Encounter } from './use-encounter';

const isClinicalKey = (key: unknown) =>
  typeof key === 'string' &&
  ['/consultations', '/lab', '/pharmacy', '/queue', '/admissions'].some((p) => key.startsWith(p));

const signedMessage = (dto: ICompleteConsultationDto) => {
  if (dto.admission) return `Signed — admitted to ${dto.admission.ward}`;
  if (dto.nextIntents?.length) return `Signed — routed to ${dto.nextIntents.join(', ')}`;
  return 'Encounter signed — sent to billing';
};

/** Sign (complete) and cancel, each refreshing every list the encounter affects. */
export function useEncounterActions({ consultation, form, mutate }: Encounter) {
  const { mutate: globalMutate } = useSWRConfig();
  const [signing, setSigning] = useState(false);
  const refresh = async () => {
    await mutate();
    await globalMutate(isClinicalKey);
  };

  const sign = async (dto: ICompleteConsultationDto): Promise<boolean> => {
    if (!consultation) return false;
    setSigning(true);
    try {
      // Never sign over unsaved notes.
      if (form.isDirty && !(await form.saveNow())) {
        toast.error('Save the encounter before signing');
        return false;
      }
      await toast
        .promise(consultationsService.complete(consultation.id, dto), {
          loading: 'Signing…',
          success: signedMessage(dto),
          error: (err) => extractErrorMessage(err, "Couldn't sign — retry"),
        })
        .unwrap();
      await refresh();
      return true;
    } catch {
      return false;
    } finally {
      setSigning(false);
    }
  };

  const cancel = async () => {
    if (!consultation) return;
    const reason = window.prompt('Cancel this consultation? Give a reason (optional):');
    if (reason === null) return;
    try {
      await toast
        .promise(consultationsService.cancel(consultation.id, { reason: reason.trim() || undefined }), {
          loading: 'Cancelling…',
          success: 'Consultation cancelled',
          error: (err) => extractErrorMessage(err, "Couldn't cancel — retry"),
        })
        .unwrap();
      await refresh();
    } catch {
      // The toast already reported the failure.
    }
  };

  return { sign, cancel, signing };
}
