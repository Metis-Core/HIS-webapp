'use client';

import { useState } from 'react';
import { FaPlus } from 'react-icons/fa';
import { toast } from 'sonner';
import { Button, Pagination } from '@/components';
import { SearchBox } from '@/components/lab/page/lab-filters';
import { ButtonVariantEnum, ModalDrawerModeEnum } from '@/enum';
import { usePagedSearch, useProcedureTests } from '@/hooks';
import type { ICreateProcedureTestDto, IProcedureTest, IUpdateProcedureTestDto } from '@/interfaces';
import ProcedureTestDrawer from './procedure-test.drawer';
import ProcedureTestsTable from './procedure-tests-table';

/** The imaging and procedure catalogue: prices, result templates and what can be ordered. */
export default function ProcedureTestsTab() {
  const list = usePagedSearch('catalogueTestsPage');
  const [mode, setMode] = useState<ModalDrawerModeEnum | null>(null);
  const [selected, setSelected] = useState<IProcedureTest | null>(null);
  const { tests, pagination, isLoading, createTest, updateTest, removeTest } = useProcedureTests({
    page: list.page,
    search: list.debouncedSearch,
  });

  const open = (next: ModalDrawerModeEnum, test: IProcedureTest | null) => {
    setSelected(test);
    setMode(next);
  };

  const save = async (payload: ICreateProcedureTestDto | IUpdateProcedureTestDto, id?: string) => {
    const work = id ? updateTest(id, payload) : createTest(payload as ICreateProcedureTestDto);
    await toast
      .promise(work, {
        loading: 'Saving…',
        success: id ? 'Entry updated' : 'Entry created',
        error: "Couldn't save — retry",
      })
      .unwrap();
  };

  const toggleActive = async (test: IProcedureTest) => {
    await toast.promise(updateTest(test.id, { isActive: !test.isActive }), {
      loading: 'Saving…',
      success: test.isActive ? `${test.name} can no longer be ordered` : `${test.name} can now be ordered`,
      error: "Couldn't update — retry",
    });
  };

  const remove = async (test: IProcedureTest) => {
    if (!confirm(`Remove ${test.name}?`)) return;
    await toast.promise(removeTest(test.id), {
      loading: 'Removing…',
      success: 'Entry removed',
      error: "Couldn't remove — retry",
    });
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <SearchBox value={list.search} placeholder="Search code or name" onChange={list.setSearch} />
        <Button type="button" variant={ButtonVariantEnum.PRIMARY} onClick={() => open(ModalDrawerModeEnum.ADD, null)}>
          <FaPlus className="text-xs" /> New entry
        </Button>
      </div>
      <div className="overflow-hidden rounded-lg border border-line bg-surface-raised">
        <ProcedureTestsTable
          tests={tests}
          searching={Boolean(list.debouncedSearch)}
          onAdd={() => open(ModalDrawerModeEnum.ADD, null)}
          onEdit={(test) => open(ModalDrawerModeEnum.EDIT, test)}
          onDelete={remove}
          onToggleActive={toggleActive}
        />
        <Pagination {...pagination} loading={isLoading} onPageChange={list.setPage} label="Catalogue pages" />
      </div>
      <ProcedureTestDrawer mode={mode} test={selected} onClose={() => setMode(null)} onSave={save} />
    </div>
  );
}
