import { api } from './axios';
import { buildQuery } from './crud.service';
import { unwrapData } from './envelope';
import { LabEndpointEnum } from '@/enum';
import type {
  IAmendLabResultDto,
  ILabAttachment,
  ILabBoardSummary,
  ILabDayRange,
  ILabItemFilters,
  ILabOrder,
  ILabOrderItem,
  ILabReportFilters,
  ILabResultAmendment,
  IPageQuery,
  IPagination,
  IVisitRecord,
} from '@/interfaces';

const itemPath = (orderId: string, itemId: string) => `${LabEndpointEnum.ORDERS}/${orderId}/items/${itemId}`;

/** Saves a blob the API streamed (CSV, attachment) under the given name. */
export function saveBlob(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.rel = 'noopener';
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

/** Verification, amendments, attachments, the bench board, reports and walk-ins (Sprints 4-5). */
export const labWorkService = {
  verify: async (orderId: string, itemId: string) =>
    (await api.post<ILabOrder>(`${itemPath(orderId, itemId)}/verify`)).data,

  amend: async (orderId: string, itemId: string, dto: IAmendLabResultDto) =>
    (await api.post<ILabOrder>(`${itemPath(orderId, itemId)}/amend`, dto)).data,

  amendmentsUrl: (orderId: string, itemId: string, query: IPageQuery = {}) =>
    `${itemPath(orderId, itemId)}/amendments${buildQuery(query)}`,

  attachmentsUrl: (orderId: string, itemId: string) => `${itemPath(orderId, itemId)}/attachments`,

  uploadAttachment: async (orderId: string, itemId: string, file: File) => {
    const form = new FormData();
    form.append('file', file);
    const { data } = await api.post<ILabAttachment>(`${itemPath(orderId, itemId)}/attachments`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },

  downloadAttachment: async (orderId: string, itemId: string, attachment: ILabAttachment) => {
    const { data } = await api.get<Blob>(`${itemPath(orderId, itemId)}/attachments/${attachment.id}/download`, {
      responseType: 'blob',
    });
    saveBlob(data, attachment.fileName);
  },

  removeAttachment: async (orderId: string, itemId: string, id: string) => {
    await api.delete(`${itemPath(orderId, itemId)}/attachments/${id}`);
  },

  boardUrl: (filters: ILabItemFilters) => `${LabEndpointEnum.ITEMS}${buildQuery(filters)}`,
  boardSummaryUrl: (range: ILabDayRange) => `${LabEndpointEnum.ITEMS_SUMMARY}${buildQuery(range)}`,
  reportUrl: (filters: ILabReportFilters) => `${LabEndpointEnum.REPORTS}${buildQuery(filters)}`,

  exportReport: async (filters: ILabReportFilters) => {
    const rest: ILabReportFilters = {
      from: filters.from,
      to: filters.to,
      gender: filters.gender,
      ageBand: filters.ageBand,
      test: filters.test,
    };
    const { data } = await api.get<Blob>(`${LabEndpointEnum.REPORTS_EXPORT}${buildQuery(rest)}`, {
      responseType: 'blob',
    });
    saveBlob(data, `lab-report_${rest.from ?? 'start'}_${rest.to ?? 'today'}.csv`);
  },

  /** Sends a walk-in straight to the lab (no consultation fee); reuses an open visit. */
  checkInForLab: async (patientId: string) =>
    unwrapData(
      (
        await api.post<IVisitRecord | { status: 'success'; data: IVisitRecord }>(LabEndpointEnum.LAB_ONLY_VISIT, {
          patientId,
        })
      ).data,
    ),
};

export type { IPagination, ILabResultAmendment, ILabBoardSummary, ILabOrderItem };
