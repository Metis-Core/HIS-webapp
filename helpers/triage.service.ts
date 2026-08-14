import { TriageEndpointEnum } from '@/enum';
import type { TriageStatusEnum } from '@/enum';
import type { ICreateTriageDto, IPagedResult, ITriage, ITriageFilters, IUpdateTriageDto } from '@/interfaces';
import api from './axios';

class TriageService {
  async list(filters: ITriageFilters = {}): Promise<IPagedResult<ITriage>> {
    const { data } = await api.get<IPagedResult<ITriage>>(TriageEndpointEnum.BASE, { params: filters });
    return data;
  }

  async queue(status?: TriageStatusEnum): Promise<ITriage[]> {
    const { data } = await api.get<ITriage[]>(TriageEndpointEnum.QUEUE, { params: { status } });
    return data;
  }

  async byPatient(patientId: string): Promise<ITriage[]> {
    const { data } = await api.get<ITriage[]>(`${TriageEndpointEnum.PATIENT}/${patientId}`);
    return data;
  }

  async get(id: string): Promise<ITriage> {
    const { data } = await api.get<ITriage>(`${TriageEndpointEnum.BASE}/${id}`);
    return data;
  }

  async create(dto: ICreateTriageDto): Promise<ITriage> {
    const { data } = await api.post<ITriage>(TriageEndpointEnum.BASE, dto);
    return data;
  }

  async update(id: string, dto: IUpdateTriageDto): Promise<ITriage> {
    const { data } = await api.patch<ITriage>(`${TriageEndpointEnum.BASE}/${id}`, dto);
    return data;
  }

  async remove(id: string): Promise<void> {
    await api.delete(`${TriageEndpointEnum.BASE}/${id}`);
  }
}

export const triageService = new TriageService();
export default triageService;
