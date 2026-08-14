import { UserEndpointEnum } from '@/enum';
import type { ICreateUserDto, IPaginatedList, IUpdateUserDto, IUser, IUserFilters } from '@/interfaces';
import api from './axios';

class UsersService {
  async list(filters: IUserFilters = {}): Promise<IPaginatedList<IUser>> {
    const { data } = await api.get<IPaginatedList<IUser>>(UserEndpointEnum.BASE, { params: filters });
    return data;
  }

  async get(id: string): Promise<IUser> {
    const { data } = await api.get<IUser>(`${UserEndpointEnum.BASE}/${id}`);
    return data;
  }

  async create(dto: ICreateUserDto): Promise<IUser> {
    const { data } = await api.post<IUser>(UserEndpointEnum.BASE, dto);
    return data;
  }

  async update(id: string, dto: IUpdateUserDto): Promise<IUser> {
    const { data } = await api.patch<IUser>(`${UserEndpointEnum.BASE}/${id}`, dto);
    return data;
  }

  async remove(id: string): Promise<void> {
    await api.delete(`${UserEndpointEnum.BASE}/${id}`);
  }
}

export const usersService = new UsersService();
export default usersService;
