export interface IBaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IPagination<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

export interface IResponse<T> {
  data: T;
  pagination: unknown;
}

export interface IError {
  message: string;
  statusCode: number;
}
