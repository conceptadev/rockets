import { LookupIdInterface, ReferenceIdInterface } from '@concepta/ts-core';
import { OrgOwnerInterface } from '@concepta/ts-common';

export interface OrgLookupServiceInterface extends LookupIdInterface {
  getOwner(org: OrgOwnerInterface): Promise<ReferenceIdInterface | null>;
}
