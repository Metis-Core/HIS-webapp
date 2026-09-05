'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { format } from 'date-fns';
import useSWR from 'swr';
import { toast } from 'sonner';
import { FaEdit, FaShieldAlt } from 'react-icons/fa';
import { Button, PatientDrawer } from '@/components';
import { ButtonVariantEnum, ModalDrawerModeEnum } from '@/enum';
import { PatientBloodTypeEnum, PatientMaritalStatusEnum, PatientTypeEnum } from '@/enum/patient.enum';
import { GenderEnum } from '@/enum';
import { api } from '@/helpers/axios';
import type { PatientFormValues } from '@/interfaces';
import type { IPatient } from '@/interfaces/patient.interface';

function DetailSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border border-line bg-surface-raised p-5">
      <h2 className="mb-4 text-xs font-semibold uppercase tracking-wide text-ink-muted">{title}</h2>
      {children}
    </section>
  );
}

function DetailField({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <dt className="text-xs font-medium text-ink-muted">{label}</dt>
      <dd className="mt-0.5 text-sm text-ink">{value?.trim() ? value : '—'}</dd>
    </div>
  );
}

export default function PatientOverviewPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { data, mutate } = useSWR<{ data: { data: IPatient } }>(`/patients/${params.id}`, api);
  const [drawerMode, setDrawerMode] = useState<ModalDrawerModeEnum | null>(null);
  const patient = data?.data.data;

  if (!patient) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <p className="text-sm text-ink-muted">Patient not found</p>
        <Button type="button" variant={ButtonVariantEnum.PRIMARY} onClick={() => router.push('/patients')}>
          Back to patients
        </Button>
      </div>
    );
  }

  const handleSave = async (values: PatientFormValues) => {
    const payload: Partial<IPatient> = {
      firstName: values.firstName,
      lastName: values.lastName,
      middleName: values.middleName || undefined,
      dateOfBirth: values.dateOfBirth || undefined,
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
    };

    await toast.promise(api.put(`/patients/${patient.id}`, payload), {
      loading: 'Saving patient…',
      success: 'Patient updated',
      error: "Couldn't save — retry",
    });
    await mutate();
    setDrawerMode(null);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-end">
        <Button
          type="button"
          variant={ButtonVariantEnum.SECONDARY}
          onClick={() => setDrawerMode(ModalDrawerModeEnum.EDIT)}
        >
          <FaEdit /> Edit patient
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
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

        <DetailSection title="Insurance policy">
          {patient.insuranceProvider ? (
            <div className="rounded-md border border-line bg-surface p-4">
              <div className="flex items-start gap-3">
                <FaShieldAlt className="mt-1 text-brand" />
                <div className="grid flex-1 gap-4 sm:grid-cols-2">
                  <DetailField label="Provider" value={patient.insuranceProvider} />
                  <DetailField label="Policy / member ID" value={patient.insurancePolicyNumber} />
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-ink-muted">No insurance on file. Patient is self-pay.</p>
          )}
        </DetailSection>
      </div>

      <PatientDrawer
        mode={drawerMode}
        patient={patient}
        onClose={() => setDrawerMode(null)}
        onSave={handleSave}
        onEdit={() => setDrawerMode(ModalDrawerModeEnum.EDIT)}
      />
    </div>
  );
}
