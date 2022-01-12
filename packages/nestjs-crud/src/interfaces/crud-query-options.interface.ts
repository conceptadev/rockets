import { QueryOptions } from '@nestjsx/crud';
import { SCondition } from '@nestjsx/crud-request';

export interface CrudQueryOptionsInterface
  extends Omit<QueryOptions, 'filter'> {
  search?: SCondition;
  query?: QueryOptions;
}
