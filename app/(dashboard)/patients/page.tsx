'use client';

import { useMemo, useState } from 'react';
import { FaBed, FaPlus, FaStethoscope, FaUserInjured, FaUsers } from 'react-icons/fa';
import { endOfDay, isWithinInterval, startOfDay } from 'date-fns';
import { Button, PatientDrawer } from '@/components';
import { ButtonVariantEnum, ModalDrawerModeEnum, StatVariantEnum } from '@/enum';
import type { IPagination, PatientFormValues } from '@/interfaces';
import type { IPatient } from '@/interfaces/patient.interface';
import PatientsFilter, { type PatientsFilterValue } from './components/filter';
import PatientRow from './components/patient-row';
import { publicApi } from '@/helpers/axios';
import useSWR from 'swr';

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

export default function PatientsPage() {
  const [drawerMode, setDrawerMode] = useState<ModalDrawerModeEnum | null>(null);
  const [selected, setSelected] = useState<IPatient | null>(null);
  const [filters, setFilters] = useState<PatientsFilterValue>(initialFilters);

  const { data, isLoading, mutate, error } = useSWR<{ data: { data: IPagination<IPatient> } }>('/patients', publicApi);
  const patients = data?.data.data.items;

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

  const handleDelete = async (id: string) => {
    try {
      await publicApi.delete(id);
      mutate();
    } catch (error) {}
  };

  const handleSave = async (values: PatientFormValues) => {
    try {
      const {
        emergencyContactName,
        emergencyContactPhone,
        emergencyContactRelationship,
        maritalStatus,
        bloodType,
        ...rest
      } = values;
      const payload = {
        ...rest,
        maritalStatus: maritalStatus || undefined,
        bloodType: bloodType || undefined,
        emergencyContact: {
          name: emergencyContactName.trim(),
          phone: emergencyContactPhone.trim(),
          relationship: emergencyContactRelationship.trim() || undefined,
        },
      };

      if (drawerMode === ModalDrawerModeEnum.ADD) {
        await publicApi.post<IPatient>('/patients', payload);
        mutate();
        closeDrawer();
      } else if (drawerMode === ModalDrawerModeEnum.EDIT && selected) {
        await publicApi.put(`/patients/${selected.id}`, payload);
        mutate();
        closeDrawer();
      }
    } catch (error) {}
  };

  const filtered = useMemo(() => {
    const query = filters.search.trim().toLowerCase();
    const hasRange = filters.dateActive && Boolean(filters.range.startDate && filters.range.endDate);

    return patients
      ? patients.filter((patient) => {
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
        })
      : [];
  }, [patients, filters]);

  const stats = useMemo(() => {
    // const total = patients.length;
    // const inpatient = patients.filter((p) => p.type === PatientTypeEnum.INPATIENT).length;
    // const outpatient = patients.filter((p) => p.type === PatientTypeEnum.OUTPATIENT).length;
    // const share = (count: number) => (total > 0 ? `${Math.round((count / total) * 100)}% of total` : undefined);

    return {
      items: [
        {
          label: 'Total patients',
          value: 100,
          icon: FaUsers,
          variant: StatVariantEnum.Green,
        },
        {
          label: 'Inpatients',
          value: 100,
          icon: FaBed,
          hint: 100,
          variant: StatVariantEnum.Blue,
        },
        {
          label: 'Outpatients',
          value: 100,
          icon: FaStethoscope,
          hint: '100',
          variant: StatVariantEnum.Emerald,
        },
      ],
    };
  }, [patients]);

  return (
    <div className="flex flex-col gap-8 py-4">
      {/* <Stats items={stats.items} /> */}

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
                  <PatientRow key={patient.id} patient={patient} onEdit={openEdit} onDelete={handleDelete} />
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
