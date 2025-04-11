import {
  ByIdInterface,
  ReferenceId,
  ReferenceIdInterface,
} from '@concepta/nestjs-common';

export interface OrgMemberLookupServiceInterface
  extends ByIdInterface<ReferenceId, ReferenceIdInterface> {}
