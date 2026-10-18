'use client';

import { useState } from 'react';
import { FaConciergeBell, FaPlus } from 'react-icons/fa';
import { toast } from 'sonner';
import { Button, EmptyState, Input, PageHeader, Pagination, Pill, ServiceDrawer, Stats } from '@/components';
import { ButtonVariantEnum, ModalDrawerModeEnum, PillVariantEnum, StatVariantEnum } from '@/enum';
import { formatFee } from '@/components/billing/billing-format';
import { useCheckIn, useListTotal, usePagedSearch, useServices } from '@/hooks';
import servicesService from '@/helpers/services.service';
import type { ICreateServiceDto, IService, IUpdateServiceDto, ServiceFormValues } from '@/interfaces';

export default function ServicesPage() {
  const [drawerMode, setDrawerMode] = useState<ModalDrawerModeEnum | null>(null);
  const [selected, setSelected] = useState<IService | null>(null);
  const { page, setPage, search, setSearch, debouncedSearch } = usePagedSearch();

  const { services, pagination, createService, updateService, removeService } = useServices({
    page,
    search: debouncedSearch,
  });
  // Server-side counts and the coded fee, so the cards don't depend on which page is showing.
  const activeCount = useListTotal(servicesService.buildListUrl({ isActive: true, limit: 1 }));
  const inactiveCount = useListTotal(servicesService.buildListUrl({ isActive: false, limit: 1 }));
  const allCount = useListTotal(servicesService.buildListUrl({ limit: 1 }));
  const { consultationFee } = useCheckIn();

  const stats = [
    { label: 'Active services', value: activeCount, icon: FaConciergeBell, variant: StatVariantEnum.Green },
    { label: 'Inactive', value: inactiveCount, icon: FaConciergeBell, variant: StatVariantEnum.Amber },
    {
      label: 'Consultation fee',
      value: consultationFee ? formatFee(consultationFee.fee) : 'Not set',
      icon: FaConciergeBell,
      variant: StatVariantEnum.Blue,
    },
    { label: 'Total', value: allCount, icon: FaConciergeBell, variant: StatVariantEnum.Emerald },
  ];

  const openAdd = () => {
    setSelected(null);
    setDrawerMode(ModalDrawerModeEnum.ADD);
  };
  const openEdit = (s: IService) => {
    setSelected(s);
    setDrawerMode(ModalDrawerModeEnum.EDIT);
  };
  const closeDrawer = () => {
    setDrawerMode(null);
    setSelected(null);
  };

  const save = async (values: ServiceFormValues) => {
    const payload: ICreateServiceDto | IUpdateServiceDto = {
      name: values.name.trim(),
      code: values.code.trim().toUpperCase() || undefined,
      fee: Number(values.fee),
      description: values.description.trim() || undefined,
      isActive: values.isActive,
    };
    if (selected) {
      await toast.promise(updateService(selected.id, payload), {
        loading: 'Saving…',
        success: 'Service updated',
        error: "Couldn't save — retry",
      });
    } else {
      await toast.promise(createService(payload as ICreateServiceDto), {
        loading: 'Creating…',
        success: 'Service created',
        error: "Couldn't create — retry",
      });
    }
    closeDrawer();
  };

  const remove = async (s: IService) => {
    if (!confirm(`Remove ${s.name}?`)) return;
    await toast.promise(removeService(s.id), {
      loading: 'Removing…',
      success: 'Service removed',
      error: "Couldn't remove — retry",
    });
  };

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        description="Billable services offered — consultation, procedures, admissions."
        action={
          <Button type="button" variant={ButtonVariantEnum.PRIMARY} onClick={openAdd}>
            <FaPlus className="text-xs" />
            New service
          </Button>
        }
      />

      <Stats items={stats} />

      <Input
        className="max-w-sm"
        placeholder="Search name"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {services.length === 0 ? (
        search.trim() ? (
          <EmptyState message="No services match your search" icon={FaConciergeBell} />
        ) : (
          <EmptyState
            message="No services yet"
            icon={FaConciergeBell}
            actionLabel="Add first service"
            onAction={openAdd}
          />
        )
      ) : (
        <div className="overflow-hidden rounded-lg border border-line bg-surface-raised">
          <table className="w-full text-left">
            <thead className="border-b border-line bg-surface text-ink-muted">
              <tr>
                <th className="px-4 py-2.5 text-xs font-medium uppercase tracking-wide">Name</th>
                <th className="px-4 py-2.5 text-xs font-medium uppercase tracking-wide">Description</th>
                <th className="px-4 py-2.5 text-xs font-medium uppercase tracking-wide">Fee</th>
                <th className="px-4 py-2.5 text-xs font-medium uppercase tracking-wide">Status</th>
                <th className="px-4 py-2.5 text-right text-xs font-medium uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody>
              {services.map((s) => (
                <tr key={s.id} className="border-b border-line last:border-0">
                  <td className="px-4 py-3 text-sm font-medium text-ink">
                    {s.name}
                    {s.code && <span className="ml-2 font-mono text-[11px] text-ink-muted">{s.code}</span>}
                  </td>
                  <td className="px-4 py-3 text-sm text-ink-muted">{s.description ?? '—'}</td>
                  <td className="px-4 py-3 text-sm tabular-nums text-ink">{formatFee(s.fee)}</td>
                  <td className="px-4 py-3">
                    <Pill variant={s.isActive ? PillVariantEnum.SUCCESS : PillVariantEnum.DEFAULT}>
                      {s.isActive ? 'active' : 'inactive'}
                    </Pill>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => openEdit(s)}
                        className="text-xs font-medium text-primary hover:text-primary-hover"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => remove(s)}
                        className="text-xs font-medium text-critical hover:opacity-80"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <Pagination {...pagination} onPageChange={setPage} label="Services pages" />
        </div>
      )}

      <ServiceDrawer mode={drawerMode} service={selected} onClose={closeDrawer} onSave={save} onEdit={openEdit} />
    </div>
  );
}
