'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { FaArrowLeft, FaFlask, FaHandHoldingMedical, FaPills, FaStethoscope } from 'react-icons/fa';
import { Button, Tabs } from '@/components';
import CompleteStageDrawer from '@/components/drawers/complete-stage.drawer';
import PatientContextPanel from '@/components/consultation/patient-context.panel';
import VisitChargesPanel from '@/components/consultation/visit-charges.panel';
import ConsultationChecklist from '@/components/consultation/encounter/consultation-checklist';
import ConsultationHeader, { patientNameOf } from '@/components/consultation/encounter/consultation-header';
import EncounterActionBar from '@/components/consultation/encounter/encounter-action-bar';
import EncounterPanel from '@/components/consultation/encounter/encounter-panel';
import { hasAssessment, validateEncounter } from '@/components/consultation/encounter/encounter-values';
import { SignSummary, signWarnings } from '@/components/consultation/encounter/sign-summary';
import { useEncounter } from '@/components/consultation/encounter/use-encounter';
import { useEncounterActions } from '@/components/consultation/encounter/use-encounter-actions';
import { resultReadyCount } from '@/components/consultation/lab/lab-items';
import LabTab from '@/components/consultation/lab/lab-tab';
import PrescriptionsPanel from '@/components/consultation/prescriptions/prescriptions-panel';
import { ButtonVariantEnum } from '@/enum';
import { RoleGroups } from '@/helpers/role-groups';
import { useLabOrdersByConsultation, usePrescriptionsByConsultation } from '@/hooks';
import type { ICompleteConsultationDto } from '@/interfaces';
import { useAuth } from '@/providers';

type ConsultationTab = 'encounter' | 'lab' | 'prescriptions' | 'charges';

const labTabLabel = (ready: number, orders: number) =>
  ready > 0 ? `Lab · ${ready} ready` : orders > 0 ? `Lab (${orders})` : 'Lab orders';

export default function ConsultationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const encounter = useEncounter(id);
  const { consultation, form, values, isOpen } = encounter;
  const actions = useEncounterActions(encounter);
  const [tab, setTab] = useState<ConsultationTab>('encounter');
  const [signingOpen, setSigningOpen] = useState(false);
  const { orders: labOrders, mutate: mutateLabOrders } = useLabOrdersByConsultation(id);
  const { prescriptions } = usePrescriptionsByConsultation(id);
  const resultsReady = resultReadyCount(labOrders);

  if (encounter.isLoading) {
    return (
      <div className="flex flex-col gap-3">
        <div className="h-6 w-64 rounded bg-line/60" />
        <div className="h-40 rounded-lg border border-line bg-surface-raised" />
      </div>
    );
  }
  if (!consultation) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <p className="text-sm text-ink-muted">Consultation not found</p>
        <Button type="button" variant={ButtonVariantEnum.PRIMARY} onClick={() => router.push('/consultations')}>
          Back to consultations
        </Button>
      </div>
    );
  }

  const isAdmin = Boolean(user && (RoleGroups.ADMINS as readonly string[]).includes(user.role));
  const canAddAddendum = isAdmin || user?.id === consultation.doctorId;
  const counts = { labOrders: labOrders.length, resultsReady, prescriptions: prescriptions.length };
  const saveForm = async () => {
    if (await form.saveNow()) toast.success('Encounter saved');
    else toast.error(validateEncounter(values) ?? 'Encounter not saved — retry');
  };
  const sign = async (dto: ICompleteConsultationDto) => {
    if (await actions.sign(dto)) setSigningOpen(false);
  };

  return (
    <div className="flex flex-col gap-5 pb-24">
      <Link
        href="/consultations"
        className="inline-flex w-fit items-center gap-2 text-xs font-medium text-ink-muted hover:text-ink"
      >
        <FaArrowLeft className="text-[10px]" />
        Back to consultations
      </Link>
      <ConsultationHeader consultation={consultation} />
      <Tabs<ConsultationTab>
        tabs={[
          { id: 'encounter', label: 'Encounter', icon: FaStethoscope },
          { id: 'lab', label: labTabLabel(resultsReady, labOrders.length), icon: FaFlask },
          { id: 'prescriptions', label: 'Prescriptions', icon: FaPills },
          { id: 'charges', label: 'Services & charges', icon: FaHandHoldingMedical },
        ]}
        active={tab}
        onChange={setTab}
      />
      <div className="grid gap-5 lg:grid-cols-12">
        <div className="flex flex-col gap-4 lg:col-span-8 xl:col-span-9">
          {tab === 'encounter' && (
            <EncounterPanel
              encounter={encounter}
              consultation={consultation}
              canAddAddendum={canAddAddendum}
              onSave={saveForm}
            />
          )}
          {tab === 'lab' && (
            <LabTab
              consultationId={consultation.id}
              orders={labOrders}
              onChanged={mutateLabOrders}
              readOnly={!isOpen}
            />
          )}
          {tab === 'prescriptions' && <PrescriptionsPanel consultation={consultation} readOnly={!isOpen} />}
          {tab === 'charges' && <VisitChargesPanel visitId={consultation.visitId ?? null} readOnly={!isOpen} />}
        </div>
        <aside className="flex flex-col gap-4 lg:col-span-4 xl:col-span-3">
          <PatientContextPanel
            patient={consultation.patient ?? null}
            visitId={consultation.visitId ?? null}
            consultationId={consultation.id}
          />
          <ConsultationChecklist drafted={hasAssessment(values)} {...counts} />
        </aside>
      </div>
      {isOpen && (
        <EncounterActionBar
          form={form}
          onSave={saveForm}
          onCancel={actions.cancel}
          onSign={() => setSigningOpen(true)}
        />
      )}
      <CompleteStageDrawer
        open={signingOpen}
        title="Sign encounter"
        patientName={patientNameOf(consultation)}
        onClose={() => setSigningOpen(false)}
        onConfirm={sign}
        submitting={actions.signing}
        warnings={signWarnings({ values, ...counts })}
        summary={<SignSummary values={values} {...counts} />}
      />
    </div>
  );
}
