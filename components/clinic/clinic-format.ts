import { ClinicRecordKindEnum } from '@/enum/clinic.enum';
import type { IClinicRecord, ILabResultField, IVaccine } from '@/interfaces';

export const KIND_LABEL: Record<ClinicRecordKindEnum, string> = {
  [ClinicRecordKindEnum.ANTENATAL_VISIT]: 'Antenatal visit',
  [ClinicRecordKindEnum.DELIVERY]: 'Delivery',
  [ClinicRecordKindEnum.POSTNATAL_VISIT]: 'Postnatal visit',
  [ClinicRecordKindEnum.IMMUNIZATION]: 'Immunization',
};

/** The route and site usually used for a vaccine, and the doses that exist for it. */
export function vaccineDefaults(vaccine: IVaccine | undefined): { route?: string; site?: string; doses?: string[] } {
  return vaccine ? { route: vaccine.route, site: vaccine.site, doses: vaccine.doses } : {};
}

/** Narrows the dose choices to the chosen vaccine; other fields are untouched. */
export function fieldsFor(
  kind: ClinicRecordKindEnum,
  fields: ILabResultField[],
  vaccine: IVaccine | undefined,
): ILabResultField[] {
  if (kind !== ClinicRecordKindEnum.IMMUNIZATION || !vaccine) return fields;
  return fields.map((field) => (field.key === 'dose' ? { ...field, options: vaccine.doses } : field));
}

/** One line for the records list. */
export function recordSummary(record: Pick<IClinicRecord, 'kind' | 'data'>): string {
  const { data } = record;
  const parts: Array<string | undefined> = (() => {
    switch (record.kind) {
      case ClinicRecordKindEnum.IMMUNIZATION:
        return [
          String(data.vaccine ?? ''),
          String(data.dose ?? ''),
          data.batch_number ? `batch ${data.batch_number}` : undefined,
        ];
      case ClinicRecordKindEnum.ANTENATAL_VISIT:
        return [
          `Contact ${data.contact ?? '?'}`,
          data.gestation_weeks !== undefined ? `${data.gestation_weeks} weeks` : undefined,
          data.risk ? String(data.risk) : undefined,
        ];
      case ClinicRecordKindEnum.DELIVERY:
        return [
          String(data.outcome ?? ''),
          String(data.mode ?? ''),
          data.birth_weight_g !== undefined ? `${data.birth_weight_g} g` : undefined,
        ];
      case ClinicRecordKindEnum.POSTNATAL_VISIT:
        return [
          data.days_since_birth !== undefined ? `Day ${data.days_since_birth}` : undefined,
          data.feeding ? String(data.feeding) : undefined,
        ];
    }
  })();
  return parts.filter(Boolean).join(' · ');
}
