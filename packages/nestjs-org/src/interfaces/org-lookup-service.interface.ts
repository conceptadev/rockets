import {
  ByIdInterface,
  ReferenceId,
  ReferenceIdInterface,
} from '@concepta/nestjs-common';
import { OrgOwnerInterface } from '@concepta/nestjs-common';

export interface OrgLookupServiceInterface
  extends ByIdInterface<ReferenceId, ReferenceIdInterface> {
  getOwner(org: OrgOwnerInterface): Promise<ReferenceIdInterface | null>;
}
