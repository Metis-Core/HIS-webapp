import { api } from './axios';
import { CrudService, buildQuery } from './crud.service';
import { TriageEndpointEnum, TriageStatusEnum } from '@/enum';
import type { ICreateTriageDto, ITriage, ITriageFilters, IUpdateTriageDto } from '@/interfaces';

class TriageService extends CrudService<ITriage, ICreateTriageDto, IUpdateTriageDto, ITriageFilters> {
  constructor() {
    super(TriageEndpointEnum.BASE);
  }

  buildQueueUrl(status?: TriageStatusEnum): string {
    return `${TriageEndpointEnum.QUEUE}${buildQuery({ status })}`;
  }

  buildByPatientUrl(patientId: string): string {
    return `${TriageEndpointEnum.BY_PATIENT}/${patientId}`;
  }

  async findQueue(status?: TriageStatusEnum): Promise<ITriage[]> {
    const { data } = await api.get<ITriage[]>(this.buildQueueUrl(status));
    return data;
  }

  async findByPatient(patientId: string): Promise<ITriage[]> {
    const { data } = await api.get<ITriage[]>(this.buildByPatientUrl(patientId));
    return data;
  }
}

const triageService = new TriageService();
export default triageService;
