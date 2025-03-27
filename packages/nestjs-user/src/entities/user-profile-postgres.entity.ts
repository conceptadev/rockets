import { Column } from 'typeorm';
import { CommonPostgresEntity } from '@concepta/typeorm-common';
import { UserInterface } from '@concepta/nestjs-common';
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
  @Column('uuid')
  userId!: string;

  /**
   * User
   */
  user?: UserInterface;
}
