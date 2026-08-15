import { Pill } from '@/components';
import { PillVariantEnum } from '@/enum';
import { PatientTypeEnum } from '@/enum/patient.enum';
import type { IPatient } from '@/interfaces/patient.interface';

export default function PatientTypePill({ type }: { type: IPatient['type'] }) {
  return (
    <Pill variant={type === PatientTypeEnum.INPATIENT ? PillVariantEnum.INFO : PillVariantEnum.SUCCESS}>{type}</Pill>
  );
}
