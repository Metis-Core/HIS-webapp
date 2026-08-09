'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import {
  FaBed,
  FaEdit,
  FaEnvelope,
  FaEye,
  FaMapMarkerAlt,
  FaPhone,
  FaPlus,
  FaShieldAlt,
  FaStethoscope,
  FaTrash,
  FaUserInjured,
  FaUsers,
} from 'react-icons/fa';
import { endOfDay, isWithinInterval, startOfDay } from 'date-fns';
import { Button, PatientDrawer, Pill, Stats } from '@/components';
import { ButtonVariantEnum, ModalDrawerModeEnum, PillVariantEnum, StatVariantEnum } from '@/enum';
import { PatientTypeEnum, PatientMaritalStatusEnum, PatientBloodTypeEnum } from '@/enum/patient.enum';
import { GenderEnum } from '@/enum';
import { patientFullName, patientInitials } from '@/data/patients';
import type { PatientFormValues } from '@/interfaces';
import type { IPatient } from '@/interfaces/patient.interface';
import PatientsFilter, { type PatientsFilterValue } from './filter';
import { usePatients } from './patients-provider';

const initialFilters: PatientsFilterValue = {
  search: '',
  type: null,
  dateActive: false,
  range: {
    startDate: undefined,
    endDate: undefined,
    key: 'selection',
  },
};

const actionBtn = 'inline-flex h-8 w-8 items-center justify-center rounded-md transition hover:bg-zinc-100';

export default function PatientsPage() {
  const { patients, setPatients } = usePatients();
  const [drawerMode, setDrawerMode] = useState<ModalDrawerModeEnum | null>(null);
  const [selected, setSelected] = useState<IPatient | null>(null);
  const [filters, setFilters] = useState<PatientsFilterValue>(initialFilters);

  const openAdd = () => {
    setSelected(null);
    setDrawerMode(ModalDrawerModeEnum.ADD);
  };

  const openEdit = (patient: IPatient) => {
    setSelected(patient);
    setDrawerMode(ModalDrawerModeEnum.EDIT);
  };

  const closeDrawer = () => {
    setDrawerMode(null);
    setSelected(null);
  };

  const handleDelete = (patient: IPatient) => {
    if (!window.confirm(`Delete ${patient.firstName} ${patient.lastName}? This cannot be undone.`)) {
      return;
    }
    setPatients((prev) => prev.filter((p) => p.id !== patient.id));
  };

  const handleSave = (values: PatientFormValues) => {
    const now = new Date();
    const payload = {
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

    if (drawerMode === ModalDrawerModeEnum.EDIT && selected) {
      setPatients((prev) => prev.map((p) => (p.id === selected.id ? { ...p, ...payload } : p)));
    } else {
      setPatients((prev) => [
        {
          id: crypto.randomUUID(),
          ...payload,
          createdAt: now,
        },
        ...prev,
      ]);
    }
    closeDrawer();
  };

  const filtered = useMemo(() => {
    const query = filters.search.trim().toLowerCase();
    const hasRange = filters.dateActive && Boolean(filters.range.startDate && filters.range.endDate);

    return patients.filter((patient) => {
      if (filters.type && patient.type !== filters.type) return false;

      if (query) {
        const haystack = [
          patient.firstName,
          patient.lastName,
          patient.middleName,
          patient.phone,
          patient.email,
          patient.nationalId,
          patient.city,
          patient.insuranceProvider,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        if (!haystack.includes(query)) return false;
      }

      if (hasRange) {
        const createdAt = new Date(patient.createdAt);
        if (
          !isWithinInterval(createdAt, {
            start: startOfDay(filters.range.startDate!),
            end: endOfDay(filters.range.endDate!),
          })
        ) {
          return false;
        }
      }

      return true;
    });
  }, [patients, filters]);

  const stats = useMemo(() => {
    const total = patients.length;
    const inpatient = patients.filter((p) => p.type === PatientTypeEnum.INPATIENT).length;
    const outpatient = patients.filter((p) => p.type === PatientTypeEnum.OUTPATIENT).length;
    const share = (count: number) => (total > 0 ? `${Math.round((count / total) * 100)}% of total` : undefined);

    return {
      items: [
        {
          label: 'Total patients',
          value: total,
          icon: FaUsers,
          variant: StatVariantEnum.Green,
        },
        {
          label: 'Inpatients',
          value: inpatient,
          icon: FaBed,
          hint: share(inpatient),
          variant: StatVariantEnum.Blue,
        },
        {
          label: 'Outpatients',
          value: outpatient,
          icon: FaStethoscope,
          hint: share(outpatient),
          variant: StatVariantEnum.Emerald,
        },
      ],
    };
  }, [patients]);

  return (
    <div className="flex flex-col gap-8 py-4">
      <Stats items={stats.items} />

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="min-w-0 flex-1">
          <PatientsFilter value={filters} onChange={setFilters} />
        </div>
        <Button type="button" variant={ButtonVariantEnum.PRIMARY} onClick={openAdd}>
          <FaPlus className="text-base" />
          <span className="font-semibold">New patient</span>
        </Button>
      </div>

      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="border-b border-zinc-200 bg-green-50 text-green-900">
              <tr>
                <th className="px-6 py-3 text-md font-bold">Patient</th>
                <th className="px-6 py-3 text-md font-bold">Contact</th>
                <th className="px-6 py-3 text-md font-bold">Location</th>
                <th className="px-6 py-3 text-md font-bold">Insurance</th>
                <th className="px-6 py-3 text-md font-bold">Type</th>
                <th className="px-6 py-3 text-md font-bold">Registered</th>
                <th className="px-6 py-3 text-right text-md font-bold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr className="border-b border-zinc-100 last:border-0">
                  <td colSpan={7} className="px-6 py-20 text-center">
                    <div className="mx-auto flex max-w-sm flex-col items-center gap-3 text-zinc-500">
                      <FaUserInjured className="text-4xl text-zinc-200" />
                      <p className="text-lg font-bold text-zinc-700">No patients found</p>
                      <p className="text-sm">Try adjusting your filters or add a new patient.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((patient) => (
                  <tr
                    key={patient.id}
                    className="border-b border-zinc-100 last:border-0 transition hover:bg-green-50/30"
                  >
                    <td className="px-6 py-4">
                      <Link href={`/patients/${patient.id}`} className="flex items-center gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-slate-800 text-base font-bold text-white shadow">
                          {patientInitials(patient)}
                        </div>
                        <div>
                          <p className="font-semibold text-zinc-900">{patientFullName(patient)}</p>
                          <p className="text-xs text-zinc-500">{patient.nationalId ?? 'No national ID'}</p>
                          {patient.dateOfBirth && (
                            <p className="text-xs text-zinc-400">
                              DOB: {format(new Date(patient.dateOfBirth), 'dd MMM yyyy')}
                            </p>
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
                      <Pill
                        variant={
                          patient.type === PatientTypeEnum.INPATIENT ? PillVariantEnum.INFO : PillVariantEnum.SUCCESS
                        }
                      >
                        {patient.type}
                      </Pill>
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
                          onClick={() => openEdit(patient)}
                        >
                          <FaEdit />
                        </button>
                        <button
                          type="button"
                          title="Delete"
                          aria-label="Delete patient"
                          className={`${actionBtn} text-red-600 hover:text-red-700`}
                          onClick={() => handleDelete(patient)}
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <PatientDrawer mode={drawerMode} patient={selected} onClose={closeDrawer} onSave={handleSave} onEdit={openEdit} />
    </div>
  );
}
