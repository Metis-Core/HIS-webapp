import { QueueEndpointEnum } from '@/enum';
import type { DepartmentEnum, QueueEntryStatusEnum } from '@/enum';
import type {
  ICheckInVisitDto,
  ICompleteQueueStageDto,
  IPagedResult,
  IQueueEntry,
  IQueueFilters,
  ITransferQueueEntryDto,
  IVisit,
} from '@/interfaces';
import api from './axios';

class QueueService {
  async list(filters: IQueueFilters = {}): Promise<IPagedResult<IQueueEntry>> {
    const { data } = await api.get<IPagedResult<IQueueEntry>>(QueueEndpointEnum.BASE, { params: filters });
    return data;
  }

  async departmentQueue(department: DepartmentEnum, status?: QueueEntryStatusEnum): Promise<IQueueEntry[]> {
    const { data } = await api.get<IQueueEntry[]>(`${QueueEndpointEnum.DEPARTMENT}/${department}`, {
      params: { status },
    });
    return data;
  }

  async displayBoard(department: DepartmentEnum): Promise<IQueueEntry[]> {
    const { data } = await api.get<IQueueEntry[]>(`${QueueEndpointEnum.DISPLAY}/${department}`);
    return data;
  }

  async getVisit(id: string): Promise<IVisit> {
    const { data } = await api.get<IVisit>(`${QueueEndpointEnum.VISITS}/${id}`);
    return data;
  }

  async getEntry(id: string): Promise<IQueueEntry> {
    const { data } = await api.get<IQueueEntry>(`${QueueEndpointEnum.ENTRIES}/${id}`);
    return data;
  }

  async checkIn(dto: ICheckInVisitDto): Promise<IVisit> {
    const { data } = await api.post<IVisit>(QueueEndpointEnum.CHECK_IN, dto);
    return data;
  }

  async callNext(department: DepartmentEnum): Promise<IQueueEntry> {
    const { data } = await api.post<IQueueEntry>(`${QueueEndpointEnum.DEPARTMENT}/${department}/call-next`, {});
    return data;
  }

  async startService(entryId: string): Promise<IQueueEntry> {
    const { data } = await api.post<IQueueEntry>(`${QueueEndpointEnum.ENTRIES}/${entryId}/start`, {});
    return data;
  }

  async completeStage(entryId: string, dto: ICompleteQueueStageDto = {}): Promise<IQueueEntry> {
    const { data } = await api.post<IQueueEntry>(`${QueueEndpointEnum.ENTRIES}/${entryId}/complete`, dto);
    return data;
  }

  async skip(entryId: string, notes?: string): Promise<IQueueEntry> {
    const { data } = await api.post<IQueueEntry>(`${QueueEndpointEnum.ENTRIES}/${entryId}/skip`, { notes });
    return data;
  }

  async transfer(entryId: string, dto: ITransferQueueEntryDto): Promise<IQueueEntry> {
    const { data } = await api.post<IQueueEntry>(`${QueueEndpointEnum.ENTRIES}/${entryId}/transfer`, dto);
    return data;
  }

  async updatePriority(visitId: string, priority: number): Promise<IVisit> {
    const { data } = await api.patch<IVisit>(`${QueueEndpointEnum.VISITS}/${visitId}/priority`, { priority });
    return data;
  }

  async cancelVisit(visitId: string): Promise<void> {
    await api.delete(`${QueueEndpointEnum.VISITS}/${visitId}`);
  }
}

export const queueService = new QueueService();
export default queueService;
