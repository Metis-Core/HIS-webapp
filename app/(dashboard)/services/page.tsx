'use client';

import { useMemo, useState } from 'react';
import { FaConciergeBell, FaPlus } from 'react-icons/fa';
import { toast } from 'sonner';
import { Button, EmptyState, Input, PageHeader, Pill, ServiceDrawer, Stats } from '@/components';
import { ButtonVariantEnum, ModalDrawerModeEnum, PillVariantEnum, StatVariantEnum } from '@/enum';
import { useServices } from '@/hooks';
import type { ICreateServiceDto, IService, IUpdateServiceDto, ServiceFormValues } from '@/interfaces';

export default function ServicesPage() {
  const [drawerMode, setDrawerMode] = useState<ModalDrawerModeEnum | null>(null);
  const [selected, setSelected] = useState<IService | null>(null);
  const [search, setSearch] = useState('');

  const { services, createService, updateService, removeService } = useServices({ limit: 100 });

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return services;
    return services.filter((s) => s.name.toLowerCase().includes(q) || (s.description ?? '').toLowerCase().includes(q));
  }, [services, search]);

  const stats = useMemo(
    () => [
      {
        label: 'Active services',
        value: services.filter((s) => s.isActive).length,
        icon: FaConciergeBell,
        variant: StatVariantEnum.Green,
      },
      {
        label: 'Inactive',
        value: services.filter((s) => !s.isActive).length,
        icon: FaConciergeBell,
        variant: StatVariantEnum.Amber,
      },
      {
        label: 'Avg fee',
        value: services.length
          ? `UGX ${Math.round(services.reduce((a, s) => a + s.fee, 0) / services.length).toLocaleString()}`
          : '—',
        icon: FaConciergeBell,
        variant: StatVariantEnum.Blue,
      },
      { label: 'Total', value: services.length, icon: FaConciergeBell, variant: StatVariantEnum.Emerald },
    ],
    [services],
  );

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
        title="Services"
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
        placeholder="Search name / description"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {filtered.length === 0 ? (
        <EmptyState
          message="No services yet"
          icon={FaConciergeBell}
          actionLabel="Add first service"
          onAction={openAdd}
        />
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
              {filtered.map((s) => (
                <tr key={s.id} className="border-b border-line last:border-0">
                  <td className="px-4 py-3 text-sm font-medium text-ink">{s.name}</td>
                  <td className="px-4 py-3 text-sm text-ink-muted">{s.description ?? '—'}</td>
                  <td className="px-4 py-3 text-sm tabular-nums text-ink">UGX {s.fee.toLocaleString()}</td>
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
                        className="text-xs font-medium text-brand hover:text-brand-hover"
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
        </div>
      )}

      <ServiceDrawer mode={drawerMode} service={selected} onClose={closeDrawer} onSave={save} onEdit={openEdit} />
    </div>
  );
}
