import LabResultTable from '@/components/lab/lab-result-table';
import type { ILabOrderItem, IPatient } from '@/interfaces';

/** One verified test's result for the clinician. */
export default function LabResultView({
  item,
  patient,
}: {
  item: ILabOrderItem;
  patient?: Pick<IPatient, 'gender' | 'dateOfBirth'>;
}) {
  return <LabResultTable item={item} patient={patient} />;
}
