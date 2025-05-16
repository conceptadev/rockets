import { Column } from 'typeorm';
import {
  OrgProfileInterface,
  ReferenceId,
  ReferenceIdInterface,
} from '@concepta/nestjs-common';
import { CommonSqliteEntity } from '../common/common-sqlite.entity';
import { OrgEntityInterface } from '@concepta/nestjs-common';

/**
 * Org Sqlite Entity
 */
export abstract class OrgSqliteEntity
  extends CommonSqliteEntity
  implements OrgEntityInterface
{
  @Column()
  name!: string;

  @Column('boolean', { default: true })
  active = true;

  /**
   * Owner Id
   */
  @Column('uuid')
  ownerId!: ReferenceId;

  /**
   * Owner
   */
  owner!: ReferenceIdInterface;

  /**
   * Profile
   */
  orgProfile?: OrgProfileInterface;
}
