import { api } from './axios';
import { CrudService, buildQuery } from './crud.service';
import { ConsultationEndpointEnum } from '@/enum';
import type {
  ICancelConsultationDto,
  ICompleteConsultationDto,
  IConsultation,
  IConsultationFilters,
  ICreateConsultationDto,
  IPageQuery,
  IPagination,
  IUpdateConsultationDto,
} from '@/interfaces';

class ConsultationsService extends CrudService<
  IConsultation,
  ICreateConsultationDto,
  IUpdateConsultationDto,
  IConsultationFilters
> {
  constructor() {
    super(ConsultationEndpointEnum.BASE);
  }

  buildByPatientUrl(patientId: string, query: IPageQuery = {}): string {
    return `${ConsultationEndpointEnum.BASE}/patient/${patientId}${buildQuery(query)}`;
  }

  buildByVisitUrl(visitId: string): string {
    return `${ConsultationEndpointEnum.BASE}/visit/${visitId}`;
  }

  async findByPatient(patientId: string, query: IPageQuery = {}): Promise<IPagination<IConsultation>> {
    const { data } = await api.get<IPagination<IConsultation>>(this.buildByPatientUrl(patientId, query));
    return data;
  }

  async findByVisit(visitId: string): Promise<IConsultation[]> {
    const { data } = await api.get<IConsultation[]>(this.buildByVisitUrl(visitId));
    return data;
  }

  async complete(id: string, dto: ICompleteConsultationDto = {}): Promise<IConsultation> {
    const { data } = await api.post<IConsultation>(`${ConsultationEndpointEnum.BASE}/${id}/complete`, dto);
    return data;
  }

  async cancel(id: string, dto: ICancelConsultationDto = {}): Promise<IConsultation> {
    const { data } = await api.post<IConsultation>(`${ConsultationEndpointEnum.BASE}/${id}/cancel`, dto);
    return data;
  }
}

const consultationsService = new ConsultationsService();
export default consultationsService;
export { buildQuery };
