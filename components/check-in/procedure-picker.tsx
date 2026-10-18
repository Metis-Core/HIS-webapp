'use client';

import { FaTimes } from 'react-icons/fa';
import RemoteSearchSelect from '@/components/inputs/remote-search-select';
import { CATEGORY_LABEL } from '@/components/orders/order-format';
import { PICKER_PAGE_SIZE } from '@/helpers/pagination';
import { procedureTestsService } from '@/helpers/procedure-tests.service';
import type { IOption, IProcedureTest } from '@/interfaces';

const toOption = (test: IProcedureTest): IOption => ({
  label: `${test.name} · ${CATEGORY_LABEL[test.category]} · UGX ${test.price.toLocaleString('en-US')}`,
  value: test.id,
});
const buildUrl = (search: string) =>
  procedureTestsService.buildListUrl({ search: search || undefined, isActive: true, limit: PICKER_PAGE_SIZE });

interface ProcedurePickerProps {
  selected: IProcedureTest[];
  onChange: (selected: IProcedureTest[]) => void;
}

/** Procedures and imaging from the catalogue; each is billed at its price when the patient is checked in. */
export default function ProcedurePicker({ selected, onChange }: ProcedurePickerProps) {
  return (
    <div className="flex flex-col gap-2">
      <RemoteSearchSelect<IProcedureTest>
        key={selected.length}
        label="Procedure or imaging"
        placeholder="Search, e.g. wound dressing or chest x-ray"
        value={null}
        onChange={(test) => {
          if (test && !selected.some((s) => s.id === test.id)) onChange([...selected, test]);
        }}
        buildUrl={buildUrl}
        toOption={toOption}
        minSearchLength={0}
        noun="procedures"
      />
      {selected.length > 0 && (
        <ul className="flex flex-wrap gap-1.5">
          {selected.map((test) => (
            <li
              key={test.id}
              className="inline-flex items-center gap-1.5 rounded-full bg-brand-soft px-3 py-1 text-xs font-medium text-brand"
            >
              {test.name}
              <button
                type="button"
                aria-label={`Remove ${test.name}`}
                onClick={() => onChange(selected.filter((s) => s.id !== test.id))}
              >
                <FaTimes className="text-[10px]" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
