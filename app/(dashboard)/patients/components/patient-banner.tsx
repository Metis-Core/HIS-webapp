'use client';

import Link from 'next/link';
import { FaChevronLeft, FaExclamationTriangle, FaPhone } from 'react-icons/fa';
import { patientFullName } from '@/data/patients';
import type { IPatient } from '@/interfaces/patient.interface';
import PatientAvatar from './patient-avatar';
import PatientTypePill from './patient-type-pill';

export default function PatientBanner({ patient }: { patient: IPatient }) {
  const hasAllergy = false;

  return (
    <section className="rounded-lg border border-line bg-surface-raised p-4">
      <div className="mb-3 flex items-center gap-2 text-xs text-ink-muted">
        <Link
          href="/patients"
          className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 hover:bg-surface hover:text-ink"
        >
          <FaChevronLeft className="text-[10px]" /> Patients
        </Link>
      </div>
      <div className="flex flex-wrap items-center gap-4">
        <PatientAvatar patient={patient} className="h-12 w-12 text-base" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="truncate text-lg font-semibold text-ink">{patientFullName(patient)}</h1>
            <PatientTypePill type={patient.type} />
            {patient.bloodType && (
              <span className="rounded-full bg-surface px-2 py-0.5 text-xs font-medium uppercase text-ink-muted ring-1 ring-line">
                {patient.bloodType}
              </span>
            )}
            {hasAllergy && (
              <span className="inline-flex items-center gap-1 rounded-full bg-critical-soft px-2 py-0.5 text-xs font-medium text-critical ring-1 ring-critical/20">
                <FaExclamationTriangle className="text-[10px]" /> Allergy
              </span>
            )}
          </div>
          <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-muted">
            <span className="font-mono">MRN {patient.id.slice(0, 8).toUpperCase()}</span>
            {patient.phone && (
              <span className="inline-flex items-center gap-1">
                <FaPhone className="text-[10px]" /> {patient.phone}
              </span>
            )}
            {patient.nationalId && <span>NID {patient.nationalId}</span>}
          </div>
        </div>
      </div>
    </section>
  );
}
