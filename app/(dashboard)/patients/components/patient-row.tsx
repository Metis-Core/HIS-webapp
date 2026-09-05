import Link from 'next/link';
import { format } from 'date-fns';
import { FaEdit, FaEnvelope, FaEye, FaMapMarkerAlt, FaPhone, FaShieldAlt, FaTrash } from 'react-icons/fa';
import { patientFullName } from '@/data/patients';
import { PatientTypeEnum } from '@/enum/patient.enum';
import type { IPatient } from '@/interfaces/patient.interface';
import PatientAvatar from './patient-avatar';
import PatientTypePill from './patient-type-pill';

const actionBtn =
  'inline-flex h-8 w-8 items-center justify-center rounded-md text-ink-muted transition hover:bg-surface hover:text-ink';

export default function PatientRow({
  patient,
  onEdit,
  onDelete,
}: {
  patient: IPatient;
  onEdit: (patient: IPatient) => void;
  onDelete: (id: string) => void;
}) {
  const edgeColor = patient.type === PatientTypeEnum.INPATIENT ? 'bg-info' : 'bg-normal';
  return (
    <tr className="group border-b border-line last:border-0 transition hover:bg-surface">
      <td className="relative py-3 pl-6 pr-4">
        <span aria-hidden className={`absolute inset-y-0 left-0 w-0.5 ${edgeColor}`} />
        <Link href={`/patients/${patient.id}`} className="flex items-center gap-3">
          <PatientAvatar patient={patient} />
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-ink group-hover:text-brand">{patientFullName(patient)}</p>
            <p className="mt-0.5 font-mono text-xs text-ink-muted">MRN {patient.id.slice(0, 8).toUpperCase()}</p>
            {patient.dateOfBirth && (
              <p className="text-xs text-ink-muted">DOB {format(new Date(patient.dateOfBirth), 'dd MMM yyyy')}</p>
            )}
          </div>
        </Link>
      </td>
      <td className="px-4 py-3 text-sm text-ink">
        <div className="flex flex-col gap-1">
          {patient.phone && (
            <span className="inline-flex items-center gap-1.5">
              <FaPhone className="text-[10px] text-ink-muted" />
              {patient.phone}
            </span>
          )}
          {patient.email && (
            <span className="inline-flex items-center gap-1.5 text-ink-muted">
              <FaEnvelope className="text-[10px]" />
              {patient.email}
            </span>
          )}
          {!patient.phone && !patient.email && <span className="text-ink-muted">—</span>}
        </div>
      </td>
      <td className="px-4 py-3 text-sm text-ink">
        {patient.city ? (
          <span className="inline-flex items-center gap-1.5">
            <FaMapMarkerAlt className="text-[10px] text-ink-muted" />
            {patient.city}
          </span>
        ) : (
          <span className="text-ink-muted">—</span>
        )}
      </td>
      <td className="px-4 py-3 text-sm">
        {patient.insuranceProvider ? (
          <div className="flex flex-col">
            <span className="inline-flex items-center gap-1.5 text-ink">
              <FaShieldAlt className="text-[10px] text-brand" />
              {patient.insuranceProvider}
            </span>
            {patient.insurancePolicyNumber && (
              <span className="font-mono text-xs text-ink-muted">{patient.insurancePolicyNumber}</span>
            )}
          </div>
        ) : (
          <span className="text-ink-muted">Self-pay</span>
        )}
      </td>
      <td className="px-4 py-3">
        <PatientTypePill type={patient.type} />
      </td>
      <td className="px-4 py-3 text-sm text-ink-muted">{format(new Date(patient.createdAt), 'dd MMM yyyy')}</td>
      <td className="px-4 py-3">
        <div className="flex items-center justify-end gap-1">
          <Link href={`/patients/${patient.id}`} title="View" aria-label="View patient" className={actionBtn}>
            <FaEye />
          </Link>
          <button
            type="button"
            title="Edit"
            aria-label="Edit patient"
            className={actionBtn}
            onClick={() => onEdit(patient)}
          >
            <FaEdit />
          </button>
          <button
            type="button"
            title="Delete"
            aria-label="Delete patient"
            className={`${actionBtn} hover:bg-critical-soft hover:text-critical`}
            onClick={() => onDelete(patient.id)}
          >
            <FaTrash />
          </button>
        </div>
      </td>
    </tr>
  );
}
