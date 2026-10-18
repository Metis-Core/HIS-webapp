'use client';

import { useState } from 'react';
import { FaDownload, FaFlask } from 'react-icons/fa';
import { toast } from 'sonner';
import { Button, EmptyState, Pagination } from '@/components';
import { ButtonVariantEnum } from '@/enum';
import { extractErrorMessage } from '@/helpers/errors';
import { labWorkService } from '@/helpers/lab-work.service';
import { useLabReport, useUrlPage } from '@/hooks';
import type { ILabReportFilters, ILabTest } from '@/interfaces';
import { TD, TH } from './lab-filters';
import ReportFilters, { AGE_BAND_LABEL } from './report-filters';

const firstOfMonth = () => {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1).toLocaleDateString('en-CA');
};

/** L11: verified results by test, sex and age band, with CSV export of the same filters. */
export default function ReportsTab() {
  const [page, setPage] = useUrlPage('reportsPage');
  const [filters, setFilters] = useState<ILabReportFilters>(() => ({ from: firstOfMonth() }));
  const [test, setTest] = useState<ILabTest | null>(null);
  const [exporting, setExporting] = useState(false);
  const { rows, pagination, isLoading } = useLabReport({ ...filters, page });

  const change = (next: ILabReportFilters, nextTest: ILabTest | null) => {
    setFilters(next);
    setTest(nextTest);
    setPage(1);
  };
  const exportCsv = async () => {
    setExporting(true);
    try {
      await labWorkService.exportReport(filters);
    } catch (err) {
      toast.error(extractErrorMessage(err, "Couldn't export — retry"));
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <ReportFilters value={filters} test={test} onChange={change} />
        <Button type="button" variant={ButtonVariantEnum.SECONDARY} loading={exporting} onClick={exportCsv}>
          <FaDownload className="text-xs" /> Export CSV
        </Button>
      </div>
      <div className="overflow-hidden rounded-lg border border-line bg-surface-raised">
        {rows.length === 0 ? (
          <EmptyState message="No verified results for these filters" icon={FaFlask} />
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="border-b border-line bg-surface text-ink-muted">
              <tr>
                <th className={TH}>Test</th>
                <th className={TH}>Sex</th>
                <th className={TH}>Age band</th>
                <th className={`${TH} text-right`}>Total</th>
                <th className={`${TH} text-right`}>Abnormal</th>
                <th className={`${TH} text-right`}>Critical</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={`${r.testId}-${r.gender}-${r.ageBand}`} className="border-b border-line last:border-0">
                  <td className={TD}>
                    <span className="font-mono text-xs">{r.testCode}</span> {r.testName}
                  </td>
                  <td className={`${TD} capitalize`}>{r.gender}</td>
                  <td className={TD}>{r.ageBand ? AGE_BAND_LABEL[r.ageBand] : 'Unknown'}</td>
                  <td className={`${TD} text-right tabular-nums`}>{r.total}</td>
                  <td className={`${TD} text-right tabular-nums`}>{r.abnormal}</td>
                  <td className={`${TD} text-right tabular-nums`}>{r.critical}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <Pagination {...pagination} loading={isLoading} onPageChange={setPage} label="Lab report pages" />
      </div>
    </div>
  );
}
