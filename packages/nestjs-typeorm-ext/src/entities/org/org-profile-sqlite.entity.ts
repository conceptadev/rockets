import { Column } from 'typeorm';
import { OrgInterface } from '@concepta/nestjs-common';
import { CommonSqliteEntity } from '../common/common-sqlite.entity';
import { OrgProfileEntityInterface } from '@concepta/nestjs-common';

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
