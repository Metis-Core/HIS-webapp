'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { useSWRConfig } from 'swr';
import consultationsService from '@/helpers/consultations.service';
import { extractErrorCode, extractErrorMessage } from '@/helpers/errors';
import type { IConsultationPrescriptionDto, IInventoryItem } from '@/interfaces';

export interface PrescriptionRowDraft {
  item: IInventoryItem | null;
  dosage: string;
  frequency: string;
  duration: string;
  quantity: string;
}

const EMPTY_ROW: PrescriptionRowDraft = { item: null, dosage: '', frequency: '', duration: '', quantity: '1' };
const isComplete = (r: PrescriptionRowDraft) =>
  Boolean(r.item && r.dosage.trim() && r.frequency.trim() && Number(r.quantity) >= 1);

const toDto = (rows: PrescriptionRowDraft[], notes: string): IConsultationPrescriptionDto => ({
  notes: notes.trim() || undefined,
  items: rows.map((r) => ({
    itemId: r.item?.id ?? '',
    dosage: r.dosage.trim(),
    frequency: r.frequency.trim(),
    duration: r.duration.trim() || undefined,
    quantity: Number(r.quantity),
  })),
});

/** New-prescription form state; the API's allergy warning (422) is surfaced for the doctor to confirm (M-12). */
export function usePrescriptionForm(consultationId: string) {
  const { mutate } = useSWRConfig();
  const [rows, setRows] = useState<PrescriptionRowDraft[]>([]);
  const [notes, setNotes] = useState('');
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState('');
  const [allergyWarning, setAllergyWarning] = useState<string | null>(null);

  const addRow = () => setRows((s) => [...s, EMPTY_ROW]);
  const removeRow = (idx: number) => setRows((s) => s.filter((_, i) => i !== idx));
  const setRow = (idx: number, patch: Partial<PrescriptionRowDraft>) =>
    setRows((s) => s.map((r, i) => (i === idx ? { ...r, ...patch } : r)));

  const send = async (allergyAcknowledged: boolean) => {
    setBusy(true);
    try {
      await consultationsService.prescribe(consultationId, { ...toDto(rows, notes), allergyAcknowledged });
      toast.success('Prescription sent to pharmacy');
      setRows([]);
      setNotes('');
      setAllergyWarning(null);
      await mutate((key) => typeof key === 'string' && key.startsWith('/pharmacy'));
    } catch (err) {
      if (extractErrorCode(err) === 'UNPROCESSABLE_ENTITY') setAllergyWarning(extractErrorMessage(err));
      else toast.error(extractErrorMessage(err, "Couldn't send — retry"));
    } finally {
      setBusy(false);
    }
  };

  const submit = async () => {
    if (rows.length === 0) return setFormError('Add at least one prescription item');
    if (!rows.every(isComplete)) {
      return setFormError('Complete medication, dosage, frequency and quantity on every row, or remove the empty rows');
    }
    setFormError('');
    await send(false);
  };

  return {
    rows,
    notes,
    setNotes,
    busy,
    formError,
    allergyWarning,
    addRow,
    removeRow,
    setRow,
    submit,
    confirmAllergy: () => send(true),
    dismissAllergy: () => setAllergyWarning(null),
  };
}
