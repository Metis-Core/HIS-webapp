'use client';

import { useCallback, useMemo } from 'react';
import { useSWRConfig } from 'swr';
import { ConsultationEndpointEnum, ConsultationStatusEnum } from '@/enum';
import consultationsService from '@/helpers/consultations.service';
import { extractErrorMessage } from '@/helpers/errors';
import { useAutosaveForm, useConsultation } from '@/hooks';
import {
  EMPTY_ENCOUNTER,
  toEncounterPayload,
  toEncounterValues,
  validateEncounter,
  type EncounterValues,
} from './encounter-values';

const isConsultationKey = (key: unknown) => typeof key === 'string' && key.startsWith(ConsultationEndpointEnum.BASE);

/** The consultation plus its autosaving encounter form (D1). */
export function useEncounter(id: string) {
  const { mutate: globalMutate } = useSWRConfig();
  const { consultation, isLoading, mutate } = useConsultation(id);
  const source = useMemo(() => (consultation ? toEncounterValues(consultation) : null), [consultation]);
  const sourceDiagnoses = JSON.stringify(source?.diagnoses ?? []);

  const persist = useCallback(
    async (next: EncounterValues) => {
      try {
        const diagnosesChanged = JSON.stringify(next.diagnoses) !== sourceDiagnoses;
        await consultationsService.update(id, toEncounterPayload(next, diagnosesChanged));
        await globalMutate(isConsultationKey);
      } catch (err) {
        throw new Error(extractErrorMessage(err, "Couldn't save — retry"));
      }
    },
    [id, sourceDiagnoses, globalMutate],
  );

  const form = useAutosaveForm<EncounterValues>({
    recordId: consultation?.id,
    source,
    enabled: consultation?.status === ConsultationStatusEnum.IN_PROGRESS,
    save: persist,
    validate: validateEncounter,
  });

  return {
    consultation,
    isLoading,
    mutate,
    form,
    values: form.values ?? EMPTY_ENCOUNTER,
    isOpen: consultation?.status === ConsultationStatusEnum.IN_PROGRESS,
  };
}

export type Encounter = ReturnType<typeof useEncounter>;
