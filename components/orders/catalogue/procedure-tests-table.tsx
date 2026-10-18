import { FaXRay } from 'react-icons/fa';
import { EmptyState, Pill } from '@/components';
import { LINK, TD, TH } from '@/components/lab/page/lab-filters';
import { PillVariantEnum } from '@/enum';
import type { IProcedureTest } from '@/interfaces';
import { CATEGORY_LABEL } from '../order-format';

interface ProcedureTestsTableProps {
  tests: IProcedureTest[];
  searching: boolean;
  onAdd: () => void;
  onEdit: (test: IProcedureTest) => void;
  onDelete: (test: IProcedureTest) => void;
  onToggleActive: (test: IProcedureTest) => void;
}

export default function ProcedureTestsTable({
  tests,
  searching,
  onAdd,
  onEdit,
  onDelete,
  onToggleActive,
}: ProcedureTestsTableProps) {
  if (tests.length === 0) {
    return searching ? (
      <EmptyState message="Nothing matches your search" icon={FaXRay} />
    ) : (
      <EmptyState
        message="No imaging or procedures yet"
        icon={FaXRay}
        actionLabel="Add the first one"
        onAction={onAdd}
      />
    );
  }
  return (
    <table className="w-full text-left">
      <thead className="border-b border-line bg-surface text-ink-muted">
        <tr>
          <th className={TH}>Code</th>
          <th className={TH}>Name</th>
          <th className={TH}>Category</th>
          <th className={TH}>Template</th>
          <th className={TH}>Price</th>
          <th className={TH}>Status</th>
          <th className={`${TH} text-right`}>Actions</th>
        </tr>
      </thead>
      <tbody>
        {tests.map((test) => (
          <tr key={test.id} className="border-b border-line last:border-0">
            <td className={`${TD} font-mono text-xs text-ink`}>{test.code}</td>
            <td className={`${TD} text-sm font-medium text-ink`}>{test.name}</td>
            <td className={`${TD} text-sm text-ink-muted`}>{CATEGORY_LABEL[test.category]}</td>
            <td className={`${TD} text-xs text-ink-muted`}>
              {test.resultSchema?.fields?.length ? `${test.resultSchema.fields.length} fields` : 'Notes only'}
            </td>
            <td className={`${TD} text-sm tabular-nums text-ink`}>UGX {Number(test.price).toLocaleString()}</td>
            <td className={TD}>
              <Pill variant={test.isActive ? PillVariantEnum.SUCCESS : PillVariantEnum.DEFAULT}>
                {test.isActive ? 'active' : 'inactive'}
              </Pill>
            </td>
            <td className={`${TD} text-right`}>
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => onToggleActive(test)} className={LINK}>
                  {test.isActive ? 'Deactivate' : 'Activate'}
                </button>
                <button type="button" onClick={() => onEdit(test)} className={LINK}>
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(test)}
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
  );
}
