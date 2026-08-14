import { ConsultationEndpointEnum } from '@/enum';
import type { ConsultationStatusEnum } from '@/enum';
import type {
  ICompleteConsultationDto,
  ICompleteConsultationResult,
  IConsultation,
  IConsultationFilters,
  ICreateConsultationDto,
  IPagedResult,
  IUpdateConsultationDto,
} from '@/interfaces';
import api from './axios';

class ConsultationService {
  async list(filters: IConsultationFilters = {}): Promise<IPagedResult<IConsultation>> {
    const { data } = await api.get<IPagedResult<IConsultation>>(ConsultationEndpointEnum.BASE, { params: filters });
    return data;
  }

  async byPatient(patientId: string): Promise<IConsultation[]> {
    const { data } = await api.get<IConsultation[]>(`${ConsultationEndpointEnum.PATIENT}/${patientId}`);
    return data;
  }

  async byVisit(visitId: string): Promise<IConsultation[]> {
    const { data } = await api.get<IConsultation[]>(`${ConsultationEndpointEnum.VISIT}/${visitId}`);
    return data;
  }

  async get(id: string): Promise<IConsultation> {
    const { data } = await api.get<IConsultation>(`${ConsultationEndpointEnum.BASE}/${id}`);
    return data;
  }

  async create(dto: ICreateConsultationDto): Promise<IConsultation> {
    const { data } = await api.post<IConsultation>(ConsultationEndpointEnum.BASE, dto);
    return data;
  }

  async update(id: string, dto: IUpdateConsultationDto): Promise<IConsultation> {
    const { data } = await api.patch<IConsultation>(`${ConsultationEndpointEnum.BASE}/${id}`, dto);
    return data;
  }

  async complete(id: string, dto: ICompleteConsultationDto = {}): Promise<ICompleteConsultationResult> {
    const { data } = await api.post<ICompleteConsultationResult>(
      `${ConsultationEndpointEnum.BASE}/${id}/complete`,
      dto,
    );
    return data;
  }

  async cancel(id: string, reason?: string): Promise<IConsultation> {
    const { data } = await api.post<IConsultation>(`${ConsultationEndpointEnum.BASE}/${id}/cancel`, { reason });
    return data;
  }

  async setStatus(id: string, status: ConsultationStatusEnum): Promise<IConsultation> {
    return this.update(id, { status });
  }
}

export const consultationService = new ConsultationService();
export default consultationService;
