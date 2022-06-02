import { ReferenceIdInterface } from '@concepta/ts-core';

export interface RoleTargetInterface extends ReferenceIdInterface {
  /**
   * Name
   */
  targetId: string;

  /**
   * Name
   */
  roleId: string;
}
