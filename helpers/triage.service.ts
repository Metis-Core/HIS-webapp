import { api } from './axios';
import { CrudService, buildQuery } from './crud.service';
import { TriageEndpointEnum, TriageStatusEnum } from '@/enum';
import type {
  ICreateTriageDto,
  IPageQuery,
  IPagination,
  ITriage,
  ITriageFilters,
  IUpdateTriageDto,
} from '@/interfaces';

class TriageService extends CrudService<ITriage, ICreateTriageDto, IUpdateTriageDto, ITriageFilters> {
  constructor() {
    super(TriageEndpointEnum.BASE);
  }

  buildQueueUrl(status?: TriageStatusEnum): string {
    return `${TriageEndpointEnum.QUEUE}${buildQuery({ status })}`;
  }

  buildByPatientUrl(patientId: string, query: IPageQuery = {}): string {
    return `${TriageEndpointEnum.BY_PATIENT}/${patientId}${buildQuery(query)}`;
  }

  async findQueue(status?: TriageStatusEnum): Promise<ITriage[]> {
    const { data } = await api.get<ITriage[]>(this.buildQueueUrl(status));
    return data;
  }

  async findByPatient(patientId: string, query: IPageQuery = {}): Promise<IPagination<ITriage>> {
    const { data } = await api.get<IPagination<ITriage>>(this.buildByPatientUrl(patientId, query));
    return data;
  }
}

const triageService = new TriageService();
export default triageService;
