import { Column } from 'typeorm';
import { CommonSqliteEntity } from '@concepta/nestjs-typeorm-ext';
import { UserProfileEntityInterface } from '../interfaces/user-profile-entity.interface';

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
