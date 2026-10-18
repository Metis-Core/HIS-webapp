'use client';

import { useState } from 'react';
import { FaSignature } from 'react-icons/fa';
import { Button, Drawer, Input } from '@/components';
import AdmitSection, { isAdmissionComplete } from '@/components/consultation/sign/admit-section';
import Attestation from '@/components/consultation/sign/attestation';
import RoutePicker from '@/components/consultation/sign/route-picker';
import SignWarnings, { type SignEncounterWarning } from '@/components/consultation/sign/sign-warnings';
import { ButtonVariantEnum, VisitIntentEnum } from '@/enum';
import { UserRoleEnum } from '@/enum/user.enum';
import type { IAdmitPatientDto, ICompleteConsultationDto } from '@/interfaces';
import { useAuth } from '@/providers';

export type { SignEncounterWarning };

interface CompleteStageDrawerProps {
  open: boolean;
  title: string;
  patientName?: string;
  summary?: React.ReactNode;
  warnings?: SignEncounterWarning[];
  onClose: () => void;
  onConfirm: (payload: ICompleteConsultationDto) => Promise<void> | void;
  submitting?: boolean;
}

const signLabel = (admitting: boolean, routes: number) =>
  admitting ? 'Sign & admit' : routes === 0 ? 'Sign & send to billing' : `Sign & route (${routes})`;

export default function CompleteStageDrawer({ open, ...props }: CompleteStageDrawerProps) {
  // Mounting the form only while open resets it every time the drawer opens.
  return (
    <Drawer open={open} onClose={props.onClose} title={props.title} width="w-[600px]">
      {open && <SignForm {...props} />}
    </Drawer>
  );
}

function SignForm({
  patientName,
  summary,
  warnings = [],
  onClose,
  onConfirm,
  submitting,
}: Omit<CompleteStageDrawerProps, 'open' | 'title'>) {
  const { user, effectiveRole } = useAuth();
  // Only doctors route or admit patients (R6, D6); the API enforces the same rule.
  const canRoute = effectiveRole === UserRoleEnum.DOCTOR;
  const [intents, setIntents] = useState<VisitIntentEnum[]>([]);
  const [admission, setAdmission] = useState<IAdmitPatientDto | null>(null);
  const [notes, setNotes] = useState('');
  const [attested, setAttested] = useState(false);

  const hasCritical = warnings.some((w) => w.severity === 'critical');
  const canSign = attested && !hasCritical && isAdmissionComplete(admission);
  const signerName = user ? `${user.firstName ?? ''} ${user.lastName ?? user.username ?? ''}`.trim() : 'Provider';

  const confirm = async () => {
    if (!canSign) return;
    await onConfirm({
      nextIntents: intents,
      notes: notes.trim() || undefined,
      admission: admission ? { ward: admission.ward.trim(), reason: admission.reason.trim() } : undefined,
    });
  };

  return (
    <div className="flex flex-col gap-5">
      {patientName && (
        <p className="text-sm text-ink-muted">
          Patient: <span className="font-medium text-ink">{patientName}</span>
        </p>
      )}
      {summary && (
        <section className="rounded-lg border border-line bg-surface p-3">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-ink-muted">Encounter summary</p>
          {summary}
        </section>
      )}
      <SignWarnings warnings={warnings} />
      {canRoute ? (
        <>
          <RoutePicker intents={intents} onChange={setIntents} />
          <AdmitSection admission={admission} onChange={setAdmission} />
        </>
      ) : (
        <p className="rounded-lg border border-line bg-surface p-3 text-xs text-ink-muted">
          Only a doctor can send the patient to lab, radiology, pharmacy or other departments, or admit them. Signing
          here sends the patient on to billing.
        </p>
      )}
      <Input
        label="Handoff notes"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Optional context for the next handler"
      />
      <Attestation signerName={signerName} checked={attested} disabled={hasCritical} onChange={setAttested} />
      <div className="flex justify-end gap-2">
        <Button type="button" variant={ButtonVariantEnum.GHOST} onClick={onClose}>
          Cancel
        </Button>
        <Button
          type="button"
          variant={ButtonVariantEnum.PRIMARY}
          onClick={confirm}
          loading={submitting}
          disabled={!canSign}
        >
          <FaSignature className="text-xs" />
          {signLabel(Boolean(admission), intents.length)}
        </Button>
      </div>
    </div>
  );
}
