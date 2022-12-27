import { CrudResponsePaginatedInterface } from './crud-response-paginated.interface';

export interface CrudResultPaginatedInterface<T = unknown>
  extends CrudResponsePaginatedInterface<T> {
  __isPaginated?: boolean;
}
