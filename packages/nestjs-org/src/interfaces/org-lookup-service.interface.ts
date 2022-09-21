import {
  LookupIdInterface,
  ReferenceId,
  ReferenceIdInterface,
} from '@concepta/ts-core';
import { OrgOwnerInterface } from '@concepta/ts-common';
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
