import { api } from './axios';
import { CrudService, buildQuery } from './crud.service';
import { PharmacyEndpointEnum } from '@/enum';
import type {
  ICreatePrescriptionDto,
  IDispense,
  IDispensePrescriptionDto,
  IPageQuery,
  IPagination,
  IPrescription,
  IPrescriptionFilters,
} from '@/interfaces';

class PharmacyService extends CrudService<
  IPrescription,
  ICreatePrescriptionDto,
  Partial<ICreatePrescriptionDto>,
  IPrescriptionFilters
> {
  constructor() {
    super(PharmacyEndpointEnum.PRESCRIPTIONS);
  }

  buildByPatientUrl(patientId: string, query: IPageQuery = {}): string {
    return `${PharmacyEndpointEnum.PRESCRIPTIONS_BY_PATIENT}/${patientId}${buildQuery(query)}`;
  }

  async findByPatient(patientId: string, query: IPageQuery = {}): Promise<IPagination<IPrescription>> {
    const { data } = await api.get<IPagination<IPrescription>>(this.buildByPatientUrl(patientId, query));
    return data;
  }

  async cancel(id: string, reason?: string): Promise<IPrescription> {
    const { data } = await api.post<IPrescription>(`${PharmacyEndpointEnum.PRESCRIPTIONS}/${id}/cancel`, { reason });
    return data;
  }

  async dispense(id: string, dto: IDispensePrescriptionDto): Promise<IDispense> {
    const { data } = await api.post<IDispense>(`${PharmacyEndpointEnum.PRESCRIPTIONS}/${id}/dispense`, dto);
    return data;
  }

  async listDispenses(id: string): Promise<IDispense[]> {
    const { data } = await api.get<IDispense[]>(`${PharmacyEndpointEnum.PRESCRIPTIONS}/${id}/dispenses`);
    return data;
  }
}

const pharmacyService = new PharmacyService();
export default pharmacyService;
