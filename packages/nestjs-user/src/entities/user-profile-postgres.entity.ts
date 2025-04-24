import { Column } from 'typeorm';
import { CommonPostgresEntity } from '@concepta/typeorm-common';
import { UserProfileEntityInterface } from '../interfaces/user-profile-entity.interface';

/**
 * User Profile Postgres Entity
 */
export abstract class UserProfilePostgresEntity
  extends CommonPostgresEntity
  implements UserProfileEntityInterface
{
  /**
   * User ID
   */
  @Column({ type: 'uuid' })
  userId!: string;
}
