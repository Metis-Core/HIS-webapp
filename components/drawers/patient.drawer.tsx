'use client';

import * as Yup from 'yup';
import { format } from 'date-fns';
import type { ReactNode } from 'react';
import { FaExclamationTriangle } from 'react-icons/fa';
import Drawer from './drawer';
import Button from '../buttons/button';
import Form from '../forms/form';
import FormDropdown from '../forms/form-dropdown';
import FormInput from '../forms/form-input';
import FormPhoneInput from '../forms/form-phone-input';
import Pill from '../pills/pill';
import { ButtonVariantEnum, GenderEnum, ModalDrawerModeEnum, PillVariantEnum } from '@/enum';
import { PatientBloodTypeEnum, PatientMaritalStatusEnum, PatientTypeEnum } from '@/enum/patient.enum';
import type { IPatientDrawerProps, PatientFormValues } from '@/interfaces';
import type { IPatient } from '@/interfaces/patient.interface';
import { ugandaInsuranceProviders } from '@/data/insurance-providers';

const fieldGrid = 'grid gap-4 sm:grid-cols-2';
const fullWidth = 'sm:col-span-2';

const schema = Yup.object({
  firstName: Yup.string().required('First name is required'),
  lastName: Yup.string().required('Last name is required'),
  middleName: Yup.string(),
  dateOfBirth: Yup.string().required('Date of birth is required'),
  gender: Yup.string().oneOf(Object.values(GenderEnum)).required('Gender is required'),
  type: Yup.string().oneOf(Object.values(PatientTypeEnum)).required('Patient type is required'),
  phone: Yup.string().required('Phone is required'),
  email: Yup.string().email('Enter a valid email'),
  address: Yup.string().required('Address is required'),
  city: Yup.string().required('City is required'),
  nationalId: Yup.string(),
  maritalStatus: Yup.string().oneOf([...Object.values(PatientMaritalStatusEnum), '']),
  bloodType: Yup.string().oneOf([...Object.values(PatientBloodTypeEnum), '']),
  emergencyContactName: Yup.string().required('Emergency contact name is required'),
  emergencyContactPhone: Yup.string().required('Emergency contact phone is required'),
  emergencyContactRelationship: Yup.string().required('Relationship is required'),
  insuranceProvider: Yup.string(),
  insurancePolicyNumber: Yup.string(),
});

const genderOptions = [
  { label: 'Male', value: GenderEnum.MALE },
  { label: 'Female', value: GenderEnum.FEMALE },
  { label: 'Other', value: GenderEnum.OTHER },
];

const typeOptions = [
  { label: 'Outpatient', value: PatientTypeEnum.OUTPATIENT },
  { label: 'Inpatient', value: PatientTypeEnum.INPATIENT },
];

const maritalOptions = [
  { label: 'Single', value: PatientMaritalStatusEnum.SINGLE },
  { label: 'Married', value: PatientMaritalStatusEnum.MARRIED },
  { label: 'Divorced', value: PatientMaritalStatusEnum.DIVORCED },
  { label: 'Widowed', value: PatientMaritalStatusEnum.WIDOWED },
];

const bloodTypeOptions = [
  { label: 'A+', value: PatientBloodTypeEnum.APOSITIVE },
  { label: 'A-', value: PatientBloodTypeEnum.ANEGATIVE },
  { label: 'B+', value: PatientBloodTypeEnum.BPOSITIVE },
  { label: 'B-', value: PatientBloodTypeEnum.BNEGATIVE },
  { label: 'AB+', value: PatientBloodTypeEnum.ABPOSITIVE },
  { label: 'AB-', value: PatientBloodTypeEnum.ABNEGATIVE },
  { label: 'O+', value: PatientBloodTypeEnum.OPOSITIVE },
  { label: 'O-', value: PatientBloodTypeEnum.ONEGATIVE },
];

const insuranceOptions = ugandaInsuranceProviders.map((provider) => ({
  label: provider,
  value: provider,
}));

const emptyValues: PatientFormValues = {
  firstName: '',
  lastName: '',
  middleName: '',
  dateOfBirth: '',
  gender: GenderEnum.OTHER,
  type: PatientTypeEnum.OUTPATIENT,
  phone: '',
  email: '',
  address: '',
  city: '',
  nationalId: '',
  maritalStatus: '',
  bloodType: '',
  emergencyContactName: '',
  emergencyContactPhone: '',
  emergencyContactRelationship: '',
  insuranceProvider: '',
  insurancePolicyNumber: '',
  allergies: '',
};

function initials(patient: IPatient) {
  return `${patient.firstName[0] ?? ''}${patient.lastName[0] ?? ''}`.toUpperCase();
}

function toFormValues(patient?: IPatient | null): PatientFormValues {
  if (!patient) return emptyValues;

  return {
    firstName: patient.firstName,
    lastName: patient.lastName,
    middleName: patient.middleName ?? '',
    dateOfBirth: patient.dateOfBirth ? format(new Date(patient.dateOfBirth), 'yyyy-MM-dd') : '',
    gender: patient.gender,
    type: patient.type,
    phone: patient.phone ?? '',
    email: patient.email ?? '',
    address: patient.address ?? '',
    city: patient.city ?? '',
    nationalId: patient.nationalId ?? '',
    maritalStatus: patient.maritalStatus ?? '',
    bloodType: patient.bloodType ?? '',
    emergencyContactName: patient.emergencyContactName ?? '',
    emergencyContactPhone: patient.emergencyContactPhone ?? '',
    emergencyContactRelationship: patient.emergencyContactRelationship ?? '',
    insuranceProvider: patient.insuranceProvider ?? '',
    insurancePolicyNumber: patient.insurancePolicyNumber ?? '',
    allergies: patient.allergies ?? '',
  };
}

function FormSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-4">
      <h3 className="border-b border-zinc-100 pb-2 text-xs font-semibold uppercase tracking-wide text-green-800">
        {title}
      </h3>
      {children}
    </section>
  );
}

function ViewField({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-zinc-400">{label}</dt>
      <dd className="mt-1 text-zinc-900">{value?.trim() ? value : '—'}</dd>
    </div>
  );
}

export default function PatientDrawer({ mode, patient, onClose, onSave, onEdit }: IPatientDrawerProps) {
  const title =
    mode === ModalDrawerModeEnum.ADD
      ? 'Register patient'
      : mode === ModalDrawerModeEnum.EDIT
        ? 'Edit patient'
        : 'Patient details';

  return (
    <Drawer open={mode !== null} onClose={onClose} title={title}>
      {mode === ModalDrawerModeEnum.VIEW && patient ? (
        <div className="flex flex-col gap-8">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-800 text-xl font-bold text-white">
              {initials(patient)}
            </div>
            <div>
              <p className="text-xl font-bold text-zinc-900">
                {[patient.firstName, patient.middleName, patient.lastName].filter(Boolean).join(' ')}
              </p>
              <Pill
                variant={patient.type === PatientTypeEnum.INPATIENT ? PillVariantEnum.INFO : PillVariantEnum.SUCCESS}
              >
                {patient.type}
              </Pill>
            </div>
          </div>

          <FormSection title="Personal information">
            <dl className={fieldGrid}>
              <ViewField
                label="Date of birth"
                value={patient.dateOfBirth ? format(new Date(patient.dateOfBirth), 'dd MMM yyyy') : undefined}
              />
              <ViewField label="Gender" value={patient.gender} />
              <ViewField label="National ID" value={patient.nationalId} />
              <ViewField label="Marital status" value={patient.maritalStatus} />
              <ViewField label="Blood type" value={patient.bloodType?.toUpperCase()} />
            </dl>
          </FormSection>

          <FormSection title="Contact & address">
            <dl className={fieldGrid}>
              <ViewField label="Phone" value={patient.phone} />
              <ViewField label="Email" value={patient.email} />
              <ViewField label="Address" value={patient.address} />
              <ViewField label="City" value={patient.city} />
            </dl>
          </FormSection>

          <FormSection title="Emergency contact">
            <dl className={fieldGrid}>
              <ViewField label="Contact name" value={patient.emergencyContactName} />
              <ViewField label="Relationship" value={patient.emergencyContactRelationship} />
              <ViewField label="Contact phone" value={patient.emergencyContactPhone} />
            </dl>
          </FormSection>

          <FormSection title="Clinical">
            <div
              role={patient.allergies?.trim() ? 'alert' : undefined}
              className={
                patient.allergies?.trim()
                  ? 'flex items-start gap-3 rounded-lg border-l-4 border-red-600 bg-red-50 px-4 py-3'
                  : 'text-sm text-zinc-500'
              }
            >
              {patient.allergies?.trim() ? (
                <>
                  <FaExclamationTriangle aria-hidden className="mt-0.5 shrink-0 text-red-600" />
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-red-800">Allergies</p>
                    <p className="text-sm text-red-900">{patient.allergies}</p>
                  </div>
                </>
              ) : (
                'No known allergies recorded.'
              )}
            </div>
          </FormSection>

          <FormSection title="Insurance">
            <dl className={fieldGrid}>
              <ViewField label="Provider" value={patient.insuranceProvider} />
              <ViewField label="Policy / member ID" value={patient.insurancePolicyNumber} />
              <ViewField label="Registered" value={format(new Date(patient.createdAt), 'dd MMM yyyy')} />
            </dl>
          </FormSection>

          <div className="flex justify-end gap-3 border-t border-zinc-100 pt-5">
            <Button type="button" variant={ButtonVariantEnum.DANGER} onClick={onClose}>
              Close
            </Button>
            <Button type="button" onClick={() => onEdit(patient)}>
              Edit patient
            </Button>
          </div>
        </div>
      ) : (
        <Form
          key={patient?.id ?? 'new'}
          initialValues={toFormValues(patient)}
          validationSchema={schema}
          onSubmit={(values, { resetForm }) => {
            onSave(values);
            resetForm();
          }}
          className="flex h-full flex-col gap-8"
        >
          <FormSection title="Personal information">
            <div className={fieldGrid}>
              <FormInput name="firstName" label="First name" placeholder="First name" required />
              <FormInput name="lastName" label="Last name" placeholder="Last name" required />
              <FormInput name="middleName" label="Middle name" placeholder="Optional" />
              <FormInput name="dateOfBirth" label="Date of birth" type="date" required />
              <FormDropdown name="gender" label="Gender" options={genderOptions} placeholder="Select gender" />
              <FormDropdown name="type" label="Patient type" options={typeOptions} placeholder="Select type" />
              <FormInput name="nationalId" label="National ID" placeholder="Optional" />
              <FormDropdown
                name="maritalStatus"
                label="Marital status"
                options={maritalOptions}
                placeholder="Select status"
              />
              <FormDropdown
                name="bloodType"
                label="Blood type"
                options={bloodTypeOptions}
                placeholder="Select blood type"
              />
            </div>
          </FormSection>

          <FormSection title="Contact & address">
            <div className={fieldGrid}>
              <FormPhoneInput name="phone" label="Phone" />
              <FormInput name="email" label="Email" type="email" placeholder="Optional" />
              <div className={fullWidth}>
                <FormInput name="address" label="Address" placeholder="Street, building, area" required />
              </div>
              <FormInput name="city" label="City" placeholder="City" required />
            </div>
          </FormSection>

          <FormSection title="Emergency contact">
            <div className={fieldGrid}>
              <FormInput name="emergencyContactName" label="Contact name" placeholder="Full name" required />
              <FormInput
                name="emergencyContactRelationship"
                label="Relationship"
                placeholder="e.g. Spouse, Parent"
                required
              />
              <FormPhoneInput name="emergencyContactPhone" label="Contact phone" />
            </div>
          </FormSection>

          <FormSection title="Insurance">
            <div className={fieldGrid}>
              <FormDropdown
                name="insuranceProvider"
                label="Insurance provider"
                options={insuranceOptions}
                placeholder="Select provider"
              />
              <FormInput name="insurancePolicyNumber" label="Policy / member ID" placeholder="Optional" />
            </div>
          </FormSection>

          <FormSection title="Clinical">
            <div className={fullWidth}>
              <FormInput
                name="allergies"
                label="Known allergies"
                placeholder="e.g. Penicillin, peanuts — leave blank if none"
              />
            </div>
          </FormSection>

          <div className="mt-auto flex justify-end gap-3 border-t border-zinc-100 pt-5">
            <Button type="button" className="bg-red-400 text-white hover:bg-red-700" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="px-6 py-2 font-semibold">
              {mode === ModalDrawerModeEnum.EDIT ? 'Save changes' : 'Register patient'}
            </Button>
          </div>
        </Form>
      )}
    </Drawer>
  );
}
