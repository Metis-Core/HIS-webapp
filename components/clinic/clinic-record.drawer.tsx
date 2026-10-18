'use client';

import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Button, Drawer } from '@/components';
import LabResultField from '@/components/lab/result/lab-result-field';
import { ButtonVariantEnum } from '@/enum';
import { ClinicRecordKindEnum } from '@/enum/clinic.enum';
import { extractErrorMessage } from '@/helpers/errors';
import { groupFields } from '@/helpers/lab-results';
import { useClinicRecords, useClinicTemplates } from '@/hooks';
import type { ILabResultData, IPatient, LabResultValue } from '@/interfaces';
import { fieldsFor, KIND_LABEL, vaccineDefaults } from './clinic-format';

interface ClinicRecordDrawerProps {
  kind: ClinicRecordKindEnum | null;
  patient: IPatient;
  visitId?: string;
  onClose: () => void;
}

/** Antenatal, delivery, postnatal and immunization details, taken from the form the API serves. */
export default function ClinicRecordDrawer({ kind, patient, visitId, onClose }: ClinicRecordDrawerProps) {
  return (
    <Drawer open={kind !== null} onClose={onClose} title={kind ? KIND_LABEL[kind] : 'Record'} width="w-[640px]">
      {kind && <ClinicRecordForm key={kind} kind={kind} patient={patient} visitId={visitId} onClose={onClose} />}
    </Drawer>
  );
}

function ClinicRecordForm({
  kind,
  patient,
  visitId,
  onClose,
}: Omit<ClinicRecordDrawerProps, 'kind'> & { kind: ClinicRecordKindEnum }) {
  const templates = useClinicTemplates();
  const { record } = useClinicRecords({}, false);
  const [values, setValues] = useState<ILabResultData>({});
  const [busy, setBusy] = useState(false);

  const vaccine = useMemo(
    () => templates?.vaccines.find((v) => v.name === values.vaccine),
    [templates, values.vaccine],
  );
  const fields = useMemo(
    () => fieldsFor(kind, templates?.templates[kind]?.fields ?? [], vaccine),
    [kind, templates, vaccine],
  );

  const setValue = (key: string, value: LabResultValue | undefined) =>
    setValues((current) => {
      const next = { ...current };
      if (value === undefined) delete next[key];
      else next[key] = value;
      if (kind === ClinicRecordKindEnum.IMMUNIZATION && key === 'vaccine') {
        const picked = templates?.vaccines.find((v) => v.name === value);
        const defaults = vaccineDefaults(picked);
        if (defaults.route) next.route = defaults.route;
        if (defaults.site) next.site = defaults.site;
        if (defaults.doses && !defaults.doses.includes(String(next.dose))) delete next.dose;
        if (defaults.doses?.length === 1) next.dose = defaults.doses[0];
      }
      return next;
    });

  const submit = async () => {
    const missing = fields.filter((f) => f.required && values[f.key] === undefined);
    if (missing.length > 0) return toast.error(`Missing required: ${missing.map((f) => f.label).join(', ')}`);
    setBusy(true);
    try {
      await record({ patientId: patient.id, visitId, kind, data: values });
      toast.success(`${KIND_LABEL[kind]} saved`);
      onClose();
    } catch (err) {
      toast.error(extractErrorMessage(err, "Couldn't save — retry"));
    } finally {
      setBusy(false);
    }
  };

  if (!templates) return <p className="text-sm text-ink-muted">Loading the form…</p>;

  const free = vaccine ? templates.national.includes(vaccine.name) : null;

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-ink">
        {patient.firstName} {patient.lastName}
        {patient.mrn && <span className="ml-2 text-xs text-ink-muted">{patient.mrn}</span>}
      </p>
      {vaccine && (
        <p className="rounded-lg bg-surface px-3 py-2 text-xs text-ink-muted">
          Schedule: {vaccine.schedule}.{' '}
          {free ? 'Free: national programme vaccine.' : 'Private vaccine: billed from Services.'}
        </p>
      )}
      {groupFields(fields).map(({ group, fields: groupList }) => (
        <fieldset key={group ?? 'fields'} className="flex flex-col gap-2">
          {group && <legend className="text-xs font-semibold uppercase text-ink-muted">{group}</legend>}
          <div className="grid grid-cols-2 gap-3">
            {groupList.map((field) => (
              <LabResultField
                key={field.key}
                field={field}
                value={values[field.key]}
                patient={patient}
                onChange={(value) => setValue(field.key, value)}
              />
            ))}
          </div>
        </fieldset>
      ))}
      <div className="flex justify-end gap-2">
        <Button type="button" variant={ButtonVariantEnum.GHOST} onClick={onClose}>
          Cancel
        </Button>
        <Button type="button" variant={ButtonVariantEnum.PRIMARY} loading={busy} onClick={() => void submit()}>
          Save
        </Button>
      </div>
    </div>
  );
}
