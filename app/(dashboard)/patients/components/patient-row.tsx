import Link from 'next/link';
import { format } from 'date-fns';
import { FaEdit, FaEnvelope, FaEye, FaMapMarkerAlt, FaPhone, FaShieldAlt, FaTrash } from 'react-icons/fa';
import { patientFullName } from '@/data/patients';
import type { IPatient } from '@/interfaces/patient.interface';
import PatientAvatar from './patient-avatar';
import PatientTypePill from './patient-type-pill';

const actionBtn = 'inline-flex h-8 w-8 items-center justify-center rounded-md transition hover:bg-zinc-100';

export default function PatientRow({
  patient,
  onEdit,
  onDelete,
}: {
  patient: IPatient;
  onEdit: (patient: IPatient) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <tr className="border-b border-zinc-100 last:border-0 transition hover:bg-green-50/30">
      <td className="px-6 py-4">
        <Link href={`/patients/${patient.id}`} className="flex items-center gap-3">
          <PatientAvatar patient={patient} />
          <div>
            <p className="font-semibold text-zinc-900">{patientFullName(patient)}</p>
            <p className="text-xs text-zinc-500">{patient.nationalId ?? 'No national ID'}</p>
            {patient.dateOfBirth && (
              <p className="text-xs text-zinc-400">DOB: {format(new Date(patient.dateOfBirth), 'dd MMM yyyy')}</p>
            )}
          </div>
        </Link>
      </td>
      <td className="px-6 py-4">
        <div className="flex flex-col gap-1 text-zinc-600">
          {patient.phone ? (
            <span className="inline-flex items-center gap-1.5">
              <FaPhone className="text-xs text-zinc-400" />
              {patient.phone}
            </span>
          ) : null}
          {patient.email ? (
            <span className="inline-flex items-center gap-1.5">
              <FaEnvelope className="text-xs text-zinc-400" />
              {patient.email}
            </span>
          ) : null}
          {!patient.phone && !patient.email && <span className="text-zinc-400">—</span>}
        </div>
      </td>
      <td className="px-6 py-4 text-zinc-600">
        {patient.city ? (
          <span className="inline-flex items-center gap-1.5">
            <FaMapMarkerAlt className="text-xs text-zinc-400" />
            {patient.city}
          </span>
        ) : (
          '—'
        )}
      </td>
      <td className="px-6 py-4">
        {patient.insuranceProvider ? (
          <div className="flex flex-col gap-1 text-zinc-600">
            <span className="inline-flex items-center gap-1.5 font-medium text-zinc-800">
              <FaShieldAlt className="text-xs text-green-700" />
              {patient.insuranceProvider}
            </span>
            {patient.insurancePolicyNumber && (
              <span className="text-xs text-zinc-500">{patient.insurancePolicyNumber}</span>
            )}
          </div>
        ) : (
          <span className="text-zinc-400">Self-pay</span>
        )}
      </td>
      <td className="px-6 py-4">
        <PatientTypePill type={patient.type} />
      </td>
      <td className="px-6 py-4 text-zinc-600">{format(new Date(patient.createdAt), 'dd MMM yyyy')}</td>
      <td className="px-6 py-4">
        <div className="flex items-center justify-end gap-1">
          <Link
            href={`/patients/${patient.id}`}
            title="View"
            aria-label="View patient"
            className={`${actionBtn} text-blue-600 hover:text-blue-700`}
          >
            <FaEye />
          </Link>
          <button
            type="button"
            title="Edit"
            aria-label="Edit patient"
            className={`${actionBtn} text-amber-600 hover:text-amber-700`}
            onClick={() => onEdit(patient)}
          >
            <FaEdit />
          </button>
          <button
            type="button"
            title="Delete"
            aria-label="Delete patient"
            className={`${actionBtn} text-red-600 hover:text-red-700`}
            onClick={() => onDelete(patient.id)}
          >
            <FaTrash />
          </button>
        </div>
      </td>
    </tr>
  );
}
