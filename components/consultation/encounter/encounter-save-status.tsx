'use client';

import { format } from 'date-fns';

interface EncounterSaveStatusProps {
  isDirty: boolean;
  isSaving: boolean;
  error: string | null;
  lastSavedAt: Date | null;
}

/** Small live indicator so the doctor always knows whether their notes are stored. */
export default function EncounterSaveStatus({ isDirty, isSaving, error, lastSavedAt }: EncounterSaveStatusProps) {
  const [text, tone] = isSaving
    ? ['Saving…', 'text-ink-muted']
    : error
      ? [`Not saved — ${error}`, 'text-critical']
      : isDirty
        ? ['Unsaved changes', 'text-watch']
        : lastSavedAt
          ? [`Saved at ${format(lastSavedAt, 'HH:mm')}`, 'text-normal']
          : ['All changes saved', 'text-ink-muted'];

  return (
    <span role="status" aria-live="polite" className={`text-xs font-medium ${tone}`}>
      {text}
    </span>
  );
}
