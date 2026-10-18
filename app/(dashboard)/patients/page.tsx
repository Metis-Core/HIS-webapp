'use client';

import { Suspense, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { FaPlus, FaProcedures, FaUserInjured } from 'react-icons/fa';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { Button, Pagination, PatientDrawer, Tabs, VisitReceiptDrawer } from '@/components';
import TriageWorkspace from '@/components/queue/triage-workspace';
import { ButtonVariantEnum, ModalDrawerModeEnum } from '@/enum';
import type { IPatientFilters, PatientFormValues } from '@/interfaces';
import type { IPatient } from '@/interfaces/patient.interface';
import { unwrapData } from '@/helpers/envelope';
import { extractErrorMessage } from '@/helpers/errors';
import { toPatientPayload } from '@/helpers/patients.service';
import { roleInGroup } from '@/helpers/role-groups';
import { useDebouncedValue, usePatients, useUrlPage } from '@/hooks';
import { useAuth } from '@/providers';
import PatientsFilter, { type PatientsFilterValue } from './components/filter';
import PatientRow from './components/patient-row';

const PAGE_SIZE = 20;
const SEARCH_DEBOUNCE_MS = 300;

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

/** Translates the filter bar into API query parameters (search, type and registration dates run server-side). */
function toQuery(filters: PatientsFilterValue, search: string, page: number): IPatientFilters {
  const hasRange = filters.dateActive && filters.range.startDate && filters.range.endDate;
  return {
    page,
    limit: PAGE_SIZE,
    search: search.trim() || undefined,
    type: filters.type ?? undefined,
    registeredFrom: hasRange ? format(filters.range.startDate!, 'yyyy-MM-dd') : undefined,
    registeredTo: hasRange ? format(filters.range.endDate!, 'yyyy-MM-dd') : undefined,
  };
}

export default function PatientsPage() {
  return (
    <Suspense>
      <PatientsView />
    </Suspense>
  );
}

function PatientsView() {
  const { effectiveRole } = useAuth();
  const searchParams = useSearchParams();
  const canTriage = roleInGroup(effectiveRole, 'FRONT_DESK_CLINICAL');
  const canDelete = roleInGroup(effectiveRole, 'ADMINS');
  const canCheckIn = roleInGroup(effectiveRole, 'CHECK_IN_STAFF');
  // One guided step (R8): a newly registered patient goes straight to the check-in receipt.
  const [checkInPatient, setCheckInPatient] = useState<IPatient | null>(null);
  const [tab, setTab] = useState<PatientsTab>(searchParams.get('tab') === 'triage' ? 'triage' : 'registry');
  const [drawerMode, setDrawerMode] = useState<ModalDrawerModeEnum | null>(null);
  const [selected, setSelected] = useState<IPatient | null>(null);
  const [filters, setFilters] = useState<PatientsFilterValue>(initialFilters);
  const [page, setPage] = useUrlPage();
  const search = useDebouncedValue(filters.search, SEARCH_DEBOUNCE_MS);

  const query = useMemo(() => toQuery(filters, search, page), [filters, search, page]);
  const {
    patients,
    total,
    limit,
    hasNextPage,
    isLoading,
    isValidating,
    error,
    createPatient,
    updatePatient,
    removePatient,
  } = usePatients(query);

  const changeFilters = (next: PatientsFilterValue) => {
    setFilters(next);
    setPage(1);
  };

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
    if (!window.confirm('Archive this patient? Their clinical records are kept.')) return;
    try {
      await toast
        .promise(removePatient(id), {
          loading: 'Archiving patient…',
          success: 'Patient archived',
          error: (err: unknown) => extractErrorMessage(err, "Couldn't archive — retry"),
        })
        .unwrap();
    } catch {
      // The toast already shows the reason.
    }
  };

  const handleSave = async (values: PatientFormValues) => {
    const payload = toPatientPayload(values);

    if (drawerMode === ModalDrawerModeEnum.ADD) {
      const created = await toast
        .promise(createPatient(payload), {
          loading: 'Registering patient…',
          success: canCheckIn ? 'Patient registered — confirm check-in' : 'Patient registered',
          error: (err: unknown) => extractErrorMessage(err, "Couldn't register — retry"),
        })
        .unwrap();
      if (canCheckIn) setCheckInPatient(unwrapData(created));
    } else if (drawerMode === ModalDrawerModeEnum.EDIT && selected) {
      await toast
        .promise(updatePatient(selected.id, payload), {
          loading: 'Saving patient…',
          success: 'Patient updated',
          error: (err: unknown) => extractErrorMessage(err, "Couldn't save — retry"),
        })
        .unwrap();
    }
    closeDrawer();
  };

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
          <PatientsFilter value={filters} onChange={changeFilters} />

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
                  {patients.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-16 text-center">
                        <div className="mx-auto flex max-w-sm flex-col items-center gap-2 text-ink-muted">
                          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface">
                            <FaUserInjured className="h-5 w-5" />
                          </div>
                          <p className="text-sm font-medium text-ink">
                            {isLoading ? 'Loading patients…' : error ? "Couldn't load patients" : 'No patients found'}
                          </p>
                          <p className="text-xs">
                            {error ? extractErrorMessage(error) : 'Try adjusting your filters or add a new patient.'}
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    patients.map((patient) => (
                      <PatientRow
                        key={patient.id}
                        patient={patient}
                        onEdit={openEdit}
                        onDelete={canDelete ? handleDelete : undefined}
                      />
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <Pagination
              page={page}
              limit={limit}
              total={total}
              hasNextPage={hasNextPage}
              loading={isValidating}
              onPageChange={setPage}
            />
          </div>
        </>
      )}

      <VisitReceiptDrawer
        open={Boolean(checkInPatient)}
        patient={checkInPatient}
        title="Check in the new patient"
        onClose={() => setCheckInPatient(null)}
      />

      <PatientDrawer mode={drawerMode} patient={selected} onClose={closeDrawer} onSave={handleSave} onEdit={openEdit} />
    </div>
  );
}
