import { LookupIdInterface, ReferenceIdInterface } from '@concepta/ts-core';
import { OrgOwnerInterface } from './org-owner.interface';

export interface OrgLookupServiceInterface extends LookupIdInterface {
  getOwner(org: OrgOwnerInterface): Promise<ReferenceIdInterface | undefined>;
}
