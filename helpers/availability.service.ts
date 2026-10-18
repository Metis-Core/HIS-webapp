import { api } from './axios';
import { buildQuery } from './crud.service';
import { unwrapData } from './envelope';
import { AvailabilityEndpointEnum, DoctorEndpointEnum } from '@/enum';
import type {
  IAvailabilityOverview,
  IDoctorFilters,
  IReassignVisitDto,
  ISetAvailabilityDto,
  IStaffAvailabilityFilters,
  IVisitRecord,
} from '@/interfaces';

const overviewOf = (body: unknown) => unwrapData(body as { status: 'success'; data: IAvailabilityOverview });

export const availabilityService = {
  staffUrl: (filters: IStaffAvailabilityFilters = {}) => `${AvailabilityEndpointEnum.STAFF}${buildQuery(filters)}`,

  doctorsUrl: (filters: IDoctorFilters = {}) => `${DoctorEndpointEnum.BASE}${buildQuery(filters)}`,

  overviewUrl: (userId?: string) =>
    userId ? `${AvailabilityEndpointEnum.USERS}/${userId}` : AvailabilityEndpointEnum.ME,

  set: async (dto: ISetAvailabilityDto, userId?: string) => {
    const { data } = await api.post(availabilityService.overviewUrl(userId), dto);
    return overviewOf(data);
  },

  cancel: async (periodId: string, userId?: string) => {
    const { data } = await api.delete(`${availabilityService.overviewUrl(userId)}/${periodId}`);
    return overviewOf(data);
  },

  reassign: async (visitId: string, dto: IReassignVisitDto) => {
    const { data } = await api.put(`${DoctorEndpointEnum.VISITS}/${visitId}`, dto);
    return unwrapData(data as { status: 'success'; data: IVisitRecord });
  },

  autoAssign: async (visitId: string) => {
    const { data } = await api.post(`${DoctorEndpointEnum.VISITS}/${visitId}/auto`);
    return unwrapData(data as { status: 'success'; data: IVisitRecord });
  },
};
