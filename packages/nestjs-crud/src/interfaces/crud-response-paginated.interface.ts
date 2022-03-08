import { GetManyDefaultResponse } from '@nestjsx/crud';

export interface CrudResponsePaginatedInterface<T>
  extends GetManyDefaultResponse<T> {}
