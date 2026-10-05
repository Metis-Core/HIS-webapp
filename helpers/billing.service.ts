import { api } from './axios';
import { ChargeEndpointEnum } from '@/enum';
import type { ChargeStatusEnum } from '@/enum/billing.enum';
import type { ICreateVisitChargeDto, IVisitCharge } from '@/interfaces';

const billingService = {
  visitBillUrl: (visitId: string) => `${ChargeEndpointEnum.BY_VISIT}/${visitId}`,

  async addCharge(dto: ICreateVisitChargeDto): Promise<IVisitCharge> {
    const { data } = await api.post<IVisitCharge>(ChargeEndpointEnum.BASE, dto);
    return data;
  },

  async setStatus(id: string, status: ChargeStatusEnum): Promise<IVisitCharge> {
    const { data } = await api.patch<IVisitCharge>(`${ChargeEndpointEnum.BASE}/${id}/status`, { status });
    return data;
  },

  async remove(id: string): Promise<void> {
    await api.delete(`${ChargeEndpointEnum.BASE}/${id}`);
  },
};

export default billingService;
