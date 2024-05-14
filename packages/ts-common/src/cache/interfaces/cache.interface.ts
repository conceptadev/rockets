import {
  AuditInterface,
  ReferenceAssigneeInterface,
  ReferenceIdInterface,
} from '@concepta/ts-core';

export interface CacheInterface
  extends ReferenceIdInterface,
    ReferenceAssigneeInterface,
    AuditInterface {
  /**
   * key to be used as reference for the cache data
   */
  key: string;

  /**
   * Type of the passcode
   */
  type: string;

  /**
   * data of the cache
   */
  data: string;

  /**
   * Date it will expire
   */
  expirationDate: Date;
}
