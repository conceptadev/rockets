import { GetManyDefaultResponse } from '@nestjsx/crud';

export interface CrudResponsePaginatedInterface<T = unknown>
  extends GetManyDefaultResponse<T> {}
