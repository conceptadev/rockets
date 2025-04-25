import { Column } from 'typeorm';
import {
  OrgProfileInterface,
  ReferenceId,
  ReferenceIdInterface,
} from '@concepta/nestjs-common';
import { CommonSqliteEntity } from '@concepta/nestjs-typeorm-ext';
import { OrgEntityInterface } from '../interfaces/org-entity.interface';

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
