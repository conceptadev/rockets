import { AuditInterface, ReferenceIdInterface } from '@concepta/ts-core';
import { RoleAssigneesInterface } from './role-assignees.interface';

export interface RoleInterface
  extends ReferenceIdInterface,
    RoleAssigneesInterface,
    AuditInterface {
  /**
   * Name
   */
  name: string;

  /**
   * Name
   */
  description: string;
}
