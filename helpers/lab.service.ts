import { api } from './axios';
import { CrudService, buildQuery } from './crud.service';
import { LabEndpointEnum } from '@/enum';
import type {
  ICreateLabOrderDto,
  ICreateLabTestDto,
  ILabOrder,
  ILabOrderFilters,
  ILabTest,
  ILabTestFilters,
  IPageQuery,
  IPagination,
  IUpdateLabOrderDto,
  IUpdateLabOrderItemDto,
  IUpdateLabTestDto,
} from '@/interfaces';

class LabTestsService extends CrudService<ILabTest, ICreateLabTestDto, IUpdateLabTestDto, ILabTestFilters> {
  constructor() {
    super(LabEndpointEnum.TESTS);
  }
}

class LabOrdersService extends CrudService<ILabOrder, ICreateLabOrderDto, IUpdateLabOrderDto, ILabOrderFilters> {
  constructor() {
    super(LabEndpointEnum.ORDERS);
  }

  buildByPatientUrl(patientId: string, query: IPageQuery = {}): string {
    return `${LabEndpointEnum.ORDERS_BY_PATIENT}/${patientId}${buildQuery(query)}`;
  }

  buildByConsultationUrl(consultationId: string): string {
    return `${LabEndpointEnum.ORDERS_BY_CONSULTATION}/${consultationId}`;
  }

  async findByPatient(patientId: string, query: IPageQuery = {}): Promise<IPagination<ILabOrder>> {
    const { data } = await api.get<IPagination<ILabOrder>>(this.buildByPatientUrl(patientId, query));
    return data;
  }

  async findByConsultation(consultationId: string): Promise<ILabOrder[]> {
    const { data } = await api.get<ILabOrder[]>(this.buildByConsultationUrl(consultationId));
    return data;
  }

  async cancel(id: string, reason?: string): Promise<ILabOrder> {
    const { data } = await api.post<ILabOrder>(`${LabEndpointEnum.ORDERS}/${id}/cancel`, { reason });
    return data;
  }

  async updateItem(orderId: string, itemId: string, dto: IUpdateLabOrderItemDto): Promise<ILabOrder> {
    const { data } = await api.patch<ILabOrder>(`${LabEndpointEnum.ORDERS}/${orderId}/items/${itemId}`, dto);
    return data;
  }
}

const labTestsService = new LabTestsService();
const labOrdersService = new LabOrdersService();

export { labTestsService, labOrdersService };

export type { IPagination };
