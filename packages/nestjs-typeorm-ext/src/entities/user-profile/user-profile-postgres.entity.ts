import { Column } from 'typeorm';
import { CommonPostgresEntity } from '../common/common-postgres.entity';
import { UserProfileEntityInterface } from '@concepta/nestjs-common';

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
