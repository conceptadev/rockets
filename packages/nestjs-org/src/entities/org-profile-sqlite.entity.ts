import { Column } from 'typeorm';
import { OrgInterface } from '@concepta/nestjs-common';
import { CommonSqliteEntity } from '@concepta/nestjs-typeorm-ext';
import { OrgProfileEntityInterface } from '../interfaces/org-profile-entity.interface';

/**
 * Org Profile Sqlite Entity
 */
export abstract class OrgProfileSqliteEntity
  extends CommonSqliteEntity
  implements OrgProfileEntityInterface
{
  @Column('uuid')
  orgId!: string;

  /**
   * Owner
   */
  org?: OrgInterface;
}
