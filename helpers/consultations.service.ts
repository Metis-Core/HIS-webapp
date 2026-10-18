import { api } from './axios';
import { CrudService, buildQuery } from './crud.service';
import { ConsultationEndpointEnum } from '@/enum';
import type {
  ICancelConsultationDto,
  ICompleteConsultationDto,
  IConsultation,
  IConsultationAddendum,
  IConsultationFilters,
  IConsultationLabOrderDto,
  IConsultationPrescriptionDto,
  ICreateAddendumDto,
  ICreateConsultationDto,
  ILabOrder,
  IPageQuery,
  IPagination,
  IPrescription,
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

  /** Orders go through the consultation so the API links patient and visit itself (H-5). */
  async orderLabs(id: string, dto: IConsultationLabOrderDto): Promise<ILabOrder> {
    const { data } = await api.post<ILabOrder>(`${ConsultationEndpointEnum.BASE}/${id}/lab-orders`, dto);
    return data;
  }

  async prescribe(id: string, dto: IConsultationPrescriptionDto): Promise<IPrescription> {
    const { data } = await api.post<IPrescription>(`${ConsultationEndpointEnum.BASE}/${id}/prescriptions`, dto);
    return data;
  }

  buildAddendaUrl(id: string, query: IPageQuery = {}): string {
    return `${ConsultationEndpointEnum.BASE}/${id}/addenda${buildQuery(query)}`;
  }

  async addAddendum(id: string, dto: ICreateAddendumDto): Promise<IConsultationAddendum> {
    const { data } = await api.post<IConsultationAddendum>(`${ConsultationEndpointEnum.BASE}/${id}/addenda`, dto);
    return data;
  }
}

const consultationsService = new ConsultationsService();
export default consultationsService;
export { buildQuery };
