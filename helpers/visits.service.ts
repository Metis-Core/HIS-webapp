import { api } from './axios';
import { CrudService } from './crud.service';
import { DepartmentEnum, VisitEndpointEnum } from '@/enum';
import type {
  ICreateVisitDto,
  IPagination,
  IQueueEntryRecord,
  IUpdateVisitDto,
  IVisitFilters,
  IVisitRecord,
} from '@/interfaces';

class VisitsService extends CrudService<IVisitRecord, ICreateVisitDto, IUpdateVisitDto, IVisitFilters> {
  constructor() {
    super(VisitEndpointEnum.BASE);
  }

  buildQueuesUrl(filters?: IVisitFilters): string {
    const params = new URLSearchParams();
    if (filters?.page) params.set('page', String(filters.page));
    if (filters?.limit) params.set('limit', String(filters.limit));
    const qs = params.toString();
    return qs ? `${VisitEndpointEnum.QUEUES}?${qs}` : VisitEndpointEnum.QUEUES;
  }

  async listQueues(filters?: IVisitFilters): Promise<IPagination<IVisitRecord>> {
    const { data } = await api.get<IPagination<IVisitRecord>>(this.buildQueuesUrl(filters));
    return data;
  }

  buildDepartmentQueueUrl(department: DepartmentEnum): string {
    return `${VisitEndpointEnum.QUEUE_BY_DEPARTMENT}/${department}`;
  }

  async listDepartmentQueue(department: DepartmentEnum): Promise<IQueueEntryRecord[]> {
    const { data } = await api.get<{ data: IQueueEntryRecord[] } | IQueueEntryRecord[]>(
      this.buildDepartmentQueueUrl(department),
    );
    return Array.isArray(data) ? data : data.data;
  }

  buildVisitQueueUrl(visitId: string): string {
    return `${VisitEndpointEnum.QUEUE_BY_VISIT}/${visitId}`;
  }

  async listVisitQueue(visitId: string): Promise<IQueueEntryRecord[]> {
    const { data } = await api.get<{ data: IQueueEntryRecord[] } | IQueueEntryRecord[]>(
      this.buildVisitQueueUrl(visitId),
    );
    return Array.isArray(data) ? data : data.data;
  }

  async callEntry(id: string): Promise<IQueueEntryRecord> {
    const { data } = await api.post<{ data: IQueueEntryRecord } | IQueueEntryRecord>(
      `${VisitEndpointEnum.QUEUE_ENTRIES}/${id}/call`,
    );
    return 'data' in (data as object) ? (data as { data: IQueueEntryRecord }).data : (data as IQueueEntryRecord);
  }

  async startEntry(id: string): Promise<IQueueEntryRecord> {
    const { data } = await api.post<{ data: IQueueEntryRecord } | IQueueEntryRecord>(
      `${VisitEndpointEnum.QUEUE_ENTRIES}/${id}/start`,
    );
    return 'data' in (data as object) ? (data as { data: IQueueEntryRecord }).data : (data as IQueueEntryRecord);
  }

  async completeEntry(
    id: string,
    notes?: string,
  ): Promise<{ entry: IQueueEntryRecord; next: IQueueEntryRecord | null }> {
    const { data } = await api.post<{
      data: { entry: IQueueEntryRecord; next: IQueueEntryRecord | null };
    }>(`${VisitEndpointEnum.QUEUE_ENTRIES}/${id}/complete`, { notes });
    return data.data;
  }

  async skipEntry(id: string, notes?: string): Promise<{ entry: IQueueEntryRecord; next: IQueueEntryRecord | null }> {
    const { data } = await api.post<{
      data: { entry: IQueueEntryRecord; next: IQueueEntryRecord | null };
    }>(`${VisitEndpointEnum.QUEUE_ENTRIES}/${id}/skip`, { notes });
    return data.data;
  }

  async deleteEntry(id: string): Promise<void> {
    await api.delete(`${VisitEndpointEnum.QUEUE_ENTRIES}/${id}`);
  }
}

const visitsService = new VisitsService();
export default visitsService;
