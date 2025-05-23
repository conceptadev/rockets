import { Column } from 'typeorm';
import { OrgInterface } from '@concepta/nestjs-common';
import { CommonPostgresEntity } from '@concepta/nestjs-typeorm-ext';
import { OrgProfileEntityInterface } from '../interfaces/org-profile-entity.interface';

/**
 * Org Profile Postgres Entity
 */
export abstract class OrgProfilePostgresEntity
  extends CommonPostgresEntity
  implements OrgProfileEntityInterface
{
  /**
   * Flag to determine if the org is active or not
   */
  @Column('uuid')
  orgId!: string;

  /**
   * Owner
   */
  org?: OrgInterface;
}
