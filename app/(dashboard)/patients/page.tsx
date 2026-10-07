'use client';

import { useMemo, useState } from 'react';
import { FaPlus, FaProcedures, FaUserInjured } from 'react-icons/fa';
import { endOfDay, isWithinInterval, startOfDay } from 'date-fns';
import { toast } from 'sonner';
import useSWR from 'swr';
import { Button, PatientDrawer, Tabs } from '@/components';
import TriageWorkspace from '@/components/queue/triage-workspace';
import { ButtonVariantEnum, ModalDrawerModeEnum } from '@/enum';
import type { IPagination, PatientFormValues } from '@/interfaces';
import type { IPatient } from '@/interfaces/patient.interface';
import { api } from '@/helpers/axios';
import { extractErrorMessage } from '@/helpers/errors';
import { toPatientPayload } from '@/helpers/patients.service';
import { roleInGroup } from '@/helpers/role-groups';
import { useAuth } from '@/providers';
import PatientsFilter, { type PatientsFilterValue } from './components/filter';
import PatientRow from './components/patient-row';

type PatientsTab = 'registry' | 'triage';

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
  const { effectiveRole } = useAuth();
  const canTriage = roleInGroup(effectiveRole, 'CHECK_IN_STAFF');
  const [tab, setTab] = useState<PatientsTab>('registry');
  const [drawerMode, setDrawerMode] = useState<ModalDrawerModeEnum | null>(null);
  const [selected, setSelected] = useState<IPatient | null>(null);
  const [filters, setFilters] = useState<PatientsFilterValue>(initialFilters);

  const { data, mutate } = useSWR<{ data: { data: IPagination<IPatient> } }>('/patients', api);
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
    await toast.promise(api.delete(`/patients/${id}`), {
      loading: 'Removing patient…',
      success: 'Patient removed',
      error: "Couldn't remove — retry",
    });
    await mutate();
  };

  const handleSave = async (values: PatientFormValues) => {
    const payload = toPatientPayload(values);

    if (drawerMode === ModalDrawerModeEnum.ADD) {
      await toast.promise(api.post<IPatient>('/patients', payload), {
        loading: 'Registering patient…',
        success: 'Patient registered',
        error: (err) => extractErrorMessage(err, "Couldn't register — retry"),
      });
    } else if (drawerMode === ModalDrawerModeEnum.EDIT && selected) {
      await toast.promise(api.patch(`/patients/${selected.id}`, payload), {
        loading: 'Saving patient…',
        success: 'Patient updated',
        error: (err) => extractErrorMessage(err, "Couldn't save — retry"),
      });
    }
    await mutate();
    closeDrawer();
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

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm text-ink-muted">Register, search, check in and triage patients.</p>
        </div>
        <Button type="button" variant={ButtonVariantEnum.PRIMARY} onClick={openAdd}>
          <FaPlus className="text-xs" />
          New patient
        </Button>
      </div>

      {canTriage && (
        <Tabs<PatientsTab>
          tabs={[
            { id: 'registry', label: 'All patients', icon: FaUserInjured },
            { id: 'triage', label: 'Triage & check-in', icon: FaProcedures },
          ]}
          active={tab}
          onChange={setTab}
        />
      )}

      {canTriage && tab === 'triage' ? (
        <TriageWorkspace />
      ) : (
        <>
          <PatientsFilter value={filters} onChange={setFilters} />

          <div className="overflow-hidden rounded-lg border border-line bg-surface-raised">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="border-b border-line bg-surface text-primary">
                  <tr>
                    <th className="px-6 py-2.5 text-xs font-medium uppercase tracking-wide">Patient</th>
                    <th className="px-4 py-2.5 text-xs font-medium uppercase tracking-wide">Contact</th>
                    <th className="px-4 py-2.5 text-xs font-medium uppercase tracking-wide">Location</th>
                    <th className="px-4 py-2.5 text-xs font-medium uppercase tracking-wide">Insurance</th>
                    <th className="px-4 py-2.5 text-xs font-medium uppercase tracking-wide">Type</th>
                    <th className="px-4 py-2.5 text-xs font-medium uppercase tracking-wide">Registered</th>
                    <th className="px-4 py-2.5 text-right text-xs font-medium uppercase tracking-wide">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-16 text-center">
                        <div className="mx-auto flex max-w-sm flex-col items-center gap-2 text-ink-muted">
                          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface">
                            <FaUserInjured className="h-5 w-5" />
                          </div>
                          <p className="text-sm font-medium text-ink">No patients found</p>
                          <p className="text-xs">Try adjusting your filters or add a new patient.</p>
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
        </>
      )}

      <PatientDrawer mode={drawerMode} patient={selected} onClose={closeDrawer} onSave={handleSave} onEdit={openEdit} />
    </div>
  );
}
