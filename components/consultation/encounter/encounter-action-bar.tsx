'use client';

import { FaBan, FaCheckCircle } from 'react-icons/fa';
import { Button } from '@/components';
import { ButtonVariantEnum } from '@/enum';
import type { AutosaveFormState } from '@/hooks/use-autosave-form';
import EncounterSaveStatus from './encounter-save-status';
import type { EncounterValues } from './encounter-values';

interface EncounterActionBarProps {
  form: AutosaveFormState<EncounterValues>;
  onSave: () => void;
  onCancel: () => void;
  onSign: () => void;
}

export default function EncounterActionBar({ form, onSave, onCancel, onSign }: EncounterActionBarProps) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface-raised/95 backdrop-blur">
      <div className="flex w-full items-center justify-between gap-3 px-6 py-3">
        <div className="flex items-center gap-3 text-xs text-ink-muted">
          <EncounterSaveStatus {...form} />
          <span className="hidden md:inline">
            Document encounter, order labs and prescriptions from the tabs above before signing.
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant={ButtonVariantEnum.SECONDARY}
            onClick={onSave}
            loading={form.isSaving}
            disabled={!form.isDirty}
          >
            Save
          </Button>
          <Button type="button" variant={ButtonVariantEnum.SECONDARY} onClick={onCancel}>
            <FaBan className="text-xs" />
            Cancel visit
          </Button>
          <Button type="button" variant={ButtonVariantEnum.PRIMARY} onClick={onSign}>
            <FaCheckCircle className="text-xs" />
            Sign encounter
          </Button>
        </div>
      </div>
    </div>
  );
}
