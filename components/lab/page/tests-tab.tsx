'use client';

import { useState } from 'react';
import { FaPlus } from 'react-icons/fa';
import { toast } from 'sonner';
import { Button, Pagination } from '@/components';
import { ButtonVariantEnum, ModalDrawerModeEnum } from '@/enum';
import { useLabTests, usePagedSearch } from '@/hooks';
import type { ICreateLabTestDto, ILabTest, IUpdateLabTestDto } from '@/interfaces';
import LabTestDrawer from '../tests/lab-test.drawer';
import { SearchBox } from './lab-filters';
import TestsTable from './tests-table';

/** L4: the catalogue, searchable by code, abbreviation or name; admins edit it. */
export default function TestsTab({ canManage }: { canManage: boolean }) {
  const list = usePagedSearch('testsPage');
  const [mode, setMode] = useState<ModalDrawerModeEnum | null>(null);
  const [selected, setSelected] = useState<ILabTest | null>(null);
  const { tests, pagination, isLoading, createTest, updateTest, removeTest } = useLabTests({
    page: list.page,
    search: list.debouncedSearch,
  });

  const open = (next: ModalDrawerModeEnum, test: ILabTest | null) => {
    setSelected(test);
    setMode(next);
  };
  const save = async (payload: ICreateLabTestDto | IUpdateLabTestDto, id?: string) => {
    const work = id ? updateTest(id, payload) : createTest(payload as ICreateLabTestDto);
    await toast
      .promise(work, {
        loading: 'Saving…',
        success: id ? 'Test updated' : 'Test created',
        error: "Couldn't save — retry",
      })
      .unwrap();
  };
  const toggleActive = async (test: ILabTest) => {
    await toast.promise(updateTest(test.id, { isActive: !test.isActive }), {
      loading: 'Saving…',
      success: test.isActive ? `${test.name} can no longer be ordered` : `${test.name} can now be ordered`,
      error: "Couldn't update — retry",
    });
  };
  const remove = async (test: ILabTest) => {
    if (!confirm(`Remove ${test.name}?`)) return;
    await toast.promise(removeTest(test.id), {
      loading: 'Removing…',
      success: 'Test removed',
      error: "Couldn't remove — retry",
    });
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <SearchBox value={list.search} placeholder="Search code, abbreviation or name" onChange={list.setSearch} />
        {canManage && (
          <Button type="button" variant={ButtonVariantEnum.PRIMARY} onClick={() => open(ModalDrawerModeEnum.ADD, null)}>
            <FaPlus className="text-xs" /> New test
          </Button>
        )}
      </div>
      <div className="overflow-hidden rounded-lg border border-line bg-surface-raised">
        <TestsTable
          tests={tests}
          searching={Boolean(list.debouncedSearch)}
          canManage={canManage}
          onAdd={() => open(ModalDrawerModeEnum.ADD, null)}
          onEdit={(t) => open(ModalDrawerModeEnum.EDIT, t)}
          onDelete={remove}
          onToggleActive={toggleActive}
        />
        <Pagination {...pagination} loading={isLoading} onPageChange={list.setPage} label="Lab test pages" />
      </div>
      <LabTestDrawer mode={mode} test={selected} onClose={() => setMode(null)} onSave={save} />
    </div>
  );
}
