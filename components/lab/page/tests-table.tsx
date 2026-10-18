import { FaFlask } from 'react-icons/fa';
import { EmptyState, Pill } from '@/components';
import { PillVariantEnum } from '@/enum';
import type { ILabTest } from '@/interfaces';
import { LINK, TD, TH } from './lab-filters';

interface TestsTableProps {
  tests: ILabTest[];
  searching: boolean;
  canManage: boolean;
  onAdd: () => void;
  onEdit: (t: ILabTest) => void;
  onDelete: (t: ILabTest) => void;
  onToggleActive: (t: ILabTest) => void;
}

export default function TestsTable({
  tests,
  searching,
  canManage,
  onAdd,
  onEdit,
  onDelete,
  onToggleActive,
}: TestsTableProps) {
  if (tests.length === 0) {
    return searching ? (
      <EmptyState message="No lab tests match your search" icon={FaFlask} />
    ) : (
      <EmptyState
        message="No lab tests yet"
        icon={FaFlask}
        actionLabel={canManage ? 'Add first test' : undefined}
        onAction={canManage ? onAdd : undefined}
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
          <th className={TH}>Sample</th>
          <th className={TH}>Template</th>
          <th className={TH}>Price</th>
          <th className={TH}>Status</th>
          {canManage && <th className={`${TH} text-right`}>Actions</th>}
        </tr>
      </thead>
      <tbody>
        {tests.map((t) => (
          <tr key={t.id} className="border-b border-line last:border-0">
            <td className={`${TD} font-mono text-xs text-ink`}>
              {t.code}
              {t.abbreviation && <div className="font-sans text-ink-muted">{t.abbreviation}</div>}
            </td>
            <td className={`${TD} text-sm font-medium text-ink`}>{t.name}</td>
            <td className={`${TD} text-sm capitalize text-ink-muted`}>{t.category}</td>
            <td className={`${TD} text-sm capitalize text-ink-muted`}>{t.sampleType}</td>
            <td className={`${TD} text-xs text-ink-muted`}>
              {t.resultSchema?.fields?.length ? `${t.resultSchema.fields.length} fields` : 'Single result'}
            </td>
            <td className={`${TD} text-sm tabular-nums text-ink`}>UGX {Number(t.price).toLocaleString()}</td>
            <td className={TD}>
              <Pill variant={t.isActive ? PillVariantEnum.SUCCESS : PillVariantEnum.DEFAULT}>
                {t.isActive ? 'active' : 'inactive'}
              </Pill>
            </td>
            {canManage && (
              <td className={`${TD} text-right`}>
                <div className="flex justify-end gap-2">
                  <button type="button" onClick={() => onToggleActive(t)} className={LINK}>
                    {t.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                  <button type="button" onClick={() => onEdit(t)} className={LINK}>
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(t)}
                    className="text-xs font-medium text-critical hover:opacity-80"
                  >
                    Delete
                  </button>
                </div>
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
