import {
  LookupIdInterface,
  ReferenceId,
  ReferenceIdInterface,
} from '@concepta/nestjs-common';
import { OrgOwnerInterface } from '@concepta/nestjs-common';
import { QueryOptionsInterface } from '@concepta/typeorm-common';

export interface OrgLookupServiceInterface
  extends LookupIdInterface<
    ReferenceId,
    ReferenceIdInterface,
    QueryOptionsInterface
  > {
  getOwner(
    org: OrgOwnerInterface,
    queryOptions?: QueryOptionsInterface,
  ): Promise<ReferenceIdInterface | null>;
}
