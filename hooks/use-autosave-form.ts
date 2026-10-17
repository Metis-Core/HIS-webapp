'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

const DEFAULT_AUTOSAVE_DELAY_MS = 2000;

export interface AutosaveFormOptions<T> {
  /** Record being edited. The form is (re)initialised from `source` only when this changes. */
  recordId: string | undefined;
  /** Latest server values. Later refetches of the same record never overwrite what the user typed. */
  source: T | null;
  /** Disable autosave (e.g. once the record is signed and read-only). */
  enabled: boolean;
  /** Persists the values; throw to report failure. */
  save: (values: T) => Promise<void>;
  /** Returns a message when the values cannot be saved yet (skips the request). */
  validate?: (values: T) => string | null;
  delayMs?: number;
}

export interface AutosaveFormState<T> {
  values: T | null;
  setField: <K extends keyof T>(key: K, value: T[K]) => void;
  isDirty: boolean;
  isSaving: boolean;
  error: string | null;
  lastSavedAt: Date | null;
  /** Saves immediately. Resolves true when everything typed so far is persisted. */
  saveNow: () => Promise<boolean>;
}

const snapshot = (value: unknown): string => JSON.stringify(value);

/**
 * Local form state with debounced autosave, an explicit save, and an unload warning while
 * changes are unsaved. Built for long clinical notes, where losing typed text is unacceptable.
 */
export function useAutosaveForm<T extends object>({
  recordId,
  source,
  enabled,
  save,
  validate,
  delayMs = DEFAULT_AUTOSAVE_DELAY_MS,
}: AutosaveFormOptions<T>): AutosaveFormState<T> {
  const [initialisedFor, setInitialisedFor] = useState<string | undefined>(undefined);
  const [values, setValues] = useState<T | null>(null);
  const [savedSnapshot, setSavedSnapshot] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  // Values that last failed to save; autosave waits for a new edit instead of retrying in a loop.
  const [failedSnapshot, setFailedSnapshot] = useState<string | null>(null);
  const inFlight = useRef(false);

  // Initialise once per record (React's "adjust state while rendering" pattern, no effect needed).
  if (source && recordId && initialisedFor !== recordId) {
    setInitialisedFor(recordId);
    setValues(source);
    setSavedSnapshot(snapshot(source));
    setError(null);
    setLastSavedAt(null);
    setFailedSnapshot(null);
  }

  const currentSnapshot = values === null ? '' : snapshot(values);
  const isDirty = values !== null && currentSnapshot !== savedSnapshot;

  const setField = useCallback(<K extends keyof T>(key: K, value: T[K]) => {
    setValues((current) => (current ? { ...current, [key]: value } : current));
  }, []);

  const saveNow = useCallback(async (): Promise<boolean> => {
    if (!values) return false;
    if (snapshot(values) === savedSnapshot) return true;
    const invalid = validate?.(values) ?? null;
    if (invalid) {
      setError(invalid);
      setFailedSnapshot(snapshot(values));
      return false;
    }
    if (inFlight.current) return false;
    inFlight.current = true;
    setIsSaving(true);
    try {
      await save(values);
      setSavedSnapshot(snapshot(values));
      setLastSavedAt(new Date());
      setError(null);
      setFailedSnapshot(null);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
      setFailedSnapshot(snapshot(values));
      return false;
    } finally {
      inFlight.current = false;
      setIsSaving(false);
    }
  }, [values, savedSnapshot, save, validate]);

  // Debounced autosave: restarts on every change, so it fires once the user pauses typing.
  useEffect(() => {
    if (!enabled || !isDirty || isSaving || currentSnapshot === failedSnapshot) return;
    const timer = window.setTimeout(() => void saveNow(), delayMs);
    return () => window.clearTimeout(timer);
  }, [enabled, isDirty, isSaving, currentSnapshot, failedSnapshot, saveNow, delayMs]);

  // Warn before closing or reloading the tab with unsaved notes.
  useEffect(() => {
    if (!isDirty) return;
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [isDirty]);

  return { values, setField, isDirty, isSaving, error, lastSavedAt, saveNow };
}
