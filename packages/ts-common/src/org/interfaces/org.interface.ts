import {
  AuditInterface,
  ReferenceActiveInterface,
  ReferenceIdInterface,
} from '@concepta/ts-core';
import { OrgOwnerInterface } from './org-owner.interface';
import { OrgMemberInterface } from './org-member.interface';

export interface OrgInterface
  extends ReferenceIdInterface,
    ReferenceActiveInterface,
    AuditInterface,
    OrgOwnerInterface {
  /**
   * Name
   */
  name: string;
  members?: OrgMemberInterface;
}
