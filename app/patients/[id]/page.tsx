'use client';

import { useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { FaEdit, FaEnvelope, FaMapMarkerAlt, FaPhone, FaShieldAlt, FaUserFriends } from 'react-icons/fa';
import { Button, PatientDrawer, PatientTimeline, Pill, VisitDrawer } from '@/components';
import { ButtonVariantEnum, ModalDrawerModeEnum, PillVariantEnum } from '@/enum';
import { PatientTypeEnum } from '@/enum/patient.enum';
import { getPatientHistory } from '@/data/patient-history';
import type { IPatientHistoryEvent } from '@/data/patient-history';
import { patientFullName, patientInitials } from '@/data/patients';
import type { PatientFormValues } from '@/interfaces';
import type { IPatient } from '@/interfaces/patient.interface';
import { PatientBloodTypeEnum, PatientMaritalStatusEnum } from '@/enum/patient.enum';
import { GenderEnum } from '@/enum';
import { usePatients } from '../patients-provider';

function DetailSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-zinc-300 bg-white p-5">
      <h2 className="mb-4 border-b border-zinc-300 pb-2 text-xs font-bold uppercase tracking-wide text-green-800">
        {title}
      </h2>
      {children}
    </section>
  );
}

function DetailField({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-zinc-400">{label}</dt>
      <dd className="mt-1 capitalize text-zinc-900">{value?.trim() ? value : '—'}</dd>
    </div>
  );
}

function ProfileRow({ icon, label, value }: { icon: React.ReactNode; label: string; value?: string | null }) {
  if (!value?.trim()) return null;

  return (
    <div className="flex items-start gap-3 text-sm text-zinc-700">
      <span className="mt-0.5 text-zinc-500">{icon}</span>
      <div>
        <p className="text-xs uppercase tracking-wide text-grey-300">{label}</p>
        <p className="mt-0.5 font-semibold text-zinc-900">{value}</p>
      </div>
    </div>
  );
}

export default function PatientDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { getPatient, setPatients } = usePatients();
  const [drawerMode, setDrawerMode] = useState<ModalDrawerModeEnum | null>(null);
  const [selectedVisit, setSelectedVisit] = useState<IPatientHistoryEvent | null>(null);

  const patient = getPatient(params.id);
  const history = useMemo(() => (patient ? getPatientHistory(patient.id) : []), [patient]);

  if (!patient) {
    return (
      <div className="flex flex-col items-center gap-4 py-20 text-center">
        <p className="text-lg font-semibold text-zinc-800">Patient not found</p>
        <Button type="button" variant={ButtonVariantEnum.PRIMARY} onClick={() => router.push('/patients')}>
          Back to patients
        </Button>
      </div>
    );
  }

  const handleSave = (values: PatientFormValues) => {
    const now = new Date();
    const payload: Partial<IPatient> = {
      firstName: values.firstName,
      lastName: values.lastName,
      middleName: values.middleName || undefined,
      dateOfBirth: values.dateOfBirth ? new Date(values.dateOfBirth) : undefined,
      phone: values.phone,
      email: values.email || undefined,
      gender: values.gender as GenderEnum,
      type: values.type as PatientTypeEnum,
      address: values.address,
      city: values.city,
      nationalId: values.nationalId || undefined,
      maritalStatus: (values.maritalStatus as PatientMaritalStatusEnum) || undefined,
      bloodType: (values.bloodType as PatientBloodTypeEnum) || undefined,
      emergencyContactName: values.emergencyContactName,
      emergencyContactPhone: values.emergencyContactPhone,
      emergencyContactRelationship: values.emergencyContactRelationship,
      insuranceProvider: values.insuranceProvider || undefined,
      insurancePolicyNumber: values.insurancePolicyNumber || undefined,
      updatedAt: now,
    };

    setPatients((prev) => prev.map((entry) => (entry.id === patient.id ? { ...entry, ...payload } : entry)));
    setDrawerMode(null);
  };

  return (
    <div className="flex flex-col gap-6 py-4">
      <div className="grid gap-6 lg:grid-cols-12">
        <div className="flex flex-col gap-6 lg:col-span-5">
          <section className="p-6">
            <div className="flex flex-col items-center text-center">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-slate-800 text-3xl font-bold text-white">
                {patientInitials(patient)}
              </div>
              <h1 className="mt-4 text-2xl font-bold text-zinc-900">{patientFullName(patient)}</h1>
              <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
                <Pill
                  variant={patient.type === PatientTypeEnum.INPATIENT ? PillVariantEnum.INFO : PillVariantEnum.SUCCESS}
                >
                  {patient.type}
                </Pill>
                {patient.bloodType && (
                  <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold uppercase text-zinc-700">
                    {patient.bloodType}
                  </span>
                )}
                <Button
                  type="button"
                  variant={ButtonVariantEnum.GHOST}
                  onClick={() => setDrawerMode(ModalDrawerModeEnum.EDIT)}
                >
                  <FaEdit />
                  Edit patient
                </Button>
              </div>
              <div className="mt-5 w-full space-y-3 border-t border-zinc-100 pt-5 text-left">
                <ProfileRow icon={<FaPhone />} label="Phone" value={patient.phone} />
                <ProfileRow icon={<FaEnvelope />} label="Email" value={patient.email} />
                <ProfileRow
                  icon={<FaMapMarkerAlt />}
                  label="Location"
                  value={
                    patient.city && patient.address
                      ? `${patient.city} · ${patient.address}`
                      : (patient.city ?? patient.address)
                  }
                />
                <ProfileRow
                  icon={<FaUserFriends />}
                  label="Emergency contact"
                  value={
                    patient.emergencyContactName
                      ? `${patient.emergencyContactName} (${patient.emergencyContactRelationship})`
                      : undefined
                  }
                />
              </div>
            </div>
          </section>

          <DetailSection title="Personal details">
            <dl className="grid gap-4 sm:grid-cols-2">
              <DetailField
                label="Date of birth"
                value={patient.dateOfBirth ? format(new Date(patient.dateOfBirth), 'dd MMM yyyy') : undefined}
              />
              <DetailField label="Gender" value={patient.gender} />
              <DetailField label="National ID" value={patient.nationalId} />
              <DetailField label="Marital status" value={patient.maritalStatus} />
              <DetailField label="Registered" value={format(new Date(patient.createdAt), 'dd MMM yyyy')} />
            </dl>
          </DetailSection>

          <DetailSection title="Contact information">
            <dl className="grid gap-4 sm:grid-cols-2">
              <DetailField label="Phone" value={patient.phone} />
              <DetailField label="Email" value={patient.email} />
              <DetailField label="Address" value={patient.address} />
              <DetailField label="City" value={patient.city} />
            </dl>
          </DetailSection>

          <DetailSection title="Emergency contact">
            <dl className="grid gap-4 sm:grid-cols-2">
              <DetailField label="Contact name" value={patient.emergencyContactName} />
              <DetailField label="Relationship" value={patient.emergencyContactRelationship} />
              <DetailField label="Contact phone" value={patient.emergencyContactPhone} />
            </dl>
          </DetailSection>
        </div>

        <div className="flex flex-col gap-6 lg:col-span-7">
          <DetailSection title="Insurance policy">
            {patient.insuranceProvider ? (
              <div className="rounded-lg border border-green-100 bg-green-50/50 p-5">
                <div className="flex items-start gap-3">
                  <FaShieldAlt className="mt-1 text-green-700" />
                  <div className="grid flex-1 gap-4 sm:grid-cols-2">
                    <DetailField label="Provider" value={patient.insuranceProvider} />
                    <DetailField label="Policy / member ID" value={patient.insurancePolicyNumber} />
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-zinc-500">No insurance on file. Patient is self-pay.</p>
            )}
          </DetailSection>

          <DetailSection title="Activity timeline">
            <PatientTimeline events={history} onSelect={setSelectedVisit} />
          </DetailSection>
        </div>
      </div>

      <PatientDrawer
        mode={drawerMode}
        patient={patient}
        onClose={() => setDrawerMode(null)}
        onSave={handleSave}
        onEdit={() => setDrawerMode(ModalDrawerModeEnum.EDIT)}
      />

      <VisitDrawer visit={selectedVisit} onClose={() => setSelectedVisit(null)} />
    </div>
  );
}
