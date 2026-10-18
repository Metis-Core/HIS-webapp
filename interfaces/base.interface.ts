export interface IBaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

/** Paging details returned by list endpoints alongside `items`. */
export interface IPaginationMeta {
  total: number;
  page: number;
  limit: number;
  hasNextPage: boolean;
}

/** page/limit for any paged list (API default 20, max 100). */
export interface IPageQuery {
  page?: number;
  limit?: number;
}

export interface IPagination<T> {
  items: T[];
  total: number;
  /** Legacy top-level paging fields; newer endpoints return `meta` instead. */
  page?: number;
  limit?: number;
  meta?: IPaginationMeta;
}

export interface IResponse<T> {
  data: T;
  pagination: unknown;
}

export interface IError {
  message: string;
  statusCode: number;
}
