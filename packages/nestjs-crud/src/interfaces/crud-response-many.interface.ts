import { GetManyDefaultResponse } from '@nestjsx/crud';
import { IdentityInterface } from '@rockts-org/nestjs-common';

export interface CrudResponseManyInterface<
  T extends IdentityInterface = IdentityInterface,
> extends GetManyDefaultResponse<T> {}
