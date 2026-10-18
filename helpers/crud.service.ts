import { api } from './axios';
import type { IPagination } from '@/interfaces';

const buildQuery = (filters: object = {}): string => {
  const params = new URLSearchParams();
  Object.entries(filters as Record<string, unknown>).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    if (Array.isArray(value)) {
      // The API reads list filters as one comma-separated value.
      if (value.length > 0) params.append(key, value.map(String).join(','));
      return;
    }
    params.append(key, String(value));
  });
  const qs = params.toString();
  return qs ? `?${qs}` : '';
};

export class CrudService<TEntity, TCreate, TUpdate, TFilters = Record<string, unknown>> {
  constructor(private readonly basePath: string) {}

  buildListUrl(filters?: TFilters): string {
    return `${this.basePath}${buildQuery(filters as Record<string, unknown>)}`;
  }

  async list(filters?: TFilters): Promise<IPagination<TEntity>> {
    const { data } = await api.get<IPagination<TEntity>>(this.buildListUrl(filters));
    return data;
  }

  async getOne(id: string): Promise<TEntity> {
    const { data } = await api.get<TEntity>(`${this.basePath}/${id}`);
    return data;
  }

  async create(dto: TCreate): Promise<TEntity> {
    const { data } = await api.post<TEntity>(this.basePath, dto);
    return data;
  }

  async update(id: string, dto: TUpdate): Promise<TEntity> {
    const { data } = await api.patch<TEntity>(`${this.basePath}/${id}`, dto);
    return data;
  }

  async replace(id: string, dto: TUpdate): Promise<TEntity> {
    const { data } = await api.put<TEntity>(`${this.basePath}/${id}`, dto);
    return data;
  }

  async remove(id: string): Promise<void> {
    await api.delete(`${this.basePath}/${id}`);
  }
}

export { buildQuery };
