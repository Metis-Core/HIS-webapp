import { patientInitials } from '@/data/patients';
import type { IPatient } from '@/interfaces/patient.interface';

export default function PatientAvatar({
  patient,
  className = 'h-11 w-11 text-base',
}: {
  patient: IPatient;
  className?: string;
}) {
  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full bg-slate-800 font-bold text-white shadow ${className}`}
    >
      {patientInitials(patient)}
    </div>
  );
}
