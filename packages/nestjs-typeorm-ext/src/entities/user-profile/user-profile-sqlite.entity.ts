import { Column } from 'typeorm';
import { CommonSqliteEntity } from '../common/common-sqlite.entity';
import { UserProfileEntityInterface } from '@concepta/nestjs-common';

/**
 * User Profile Sqlite Entity
 */
export abstract class UserProfileSqliteEntity
  extends CommonSqliteEntity
  implements UserProfileEntityInterface
{
  @Column({ type: 'uuid' })
  userId!: string;
}
