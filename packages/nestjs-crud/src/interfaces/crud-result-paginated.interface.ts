import { CrudResponsePaginatedInterface } from './crud-response-paginated.interface';

export interface CrudResultPaginatedInterface<T>
  extends CrudResponsePaginatedInterface<T> {
  __isPaginated?: boolean;
}
