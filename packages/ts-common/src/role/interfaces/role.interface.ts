import {
  ReferenceAuditInterface,
  ReferenceIdInterface,
} from '@concepta/ts-core';
import { RoleAssigneesInterface } from './role-assignees.interface';

export interface RoleInterface
  extends ReferenceIdInterface,
    RoleAssigneesInterface,
    ReferenceAuditInterface {
  /**
   * Name
   */
  name: string;

  /**
   * Name
   */
  description: string;
}
