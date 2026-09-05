import { patientInitials } from '@/data/patients';
import type { IPatient } from '@/interfaces/patient.interface';

export default function PatientAvatar({
  patient,
  className = 'h-10 w-10 text-sm',
}: {
  patient: IPatient;
  className?: string;
}) {
  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full bg-brand font-semibold text-white ${className}`}
    >
      {patientInitials(patient)}
    </div>
  );
}
