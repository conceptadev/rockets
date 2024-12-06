import { Column } from 'typeorm';
import { ReferenceId } from '@concepta/nestjs-common';
import { CommonPostgresEntity } from '@concepta/typeorm-common';
import { UserPasswordHistoryEntityInterface } from '../interfaces/user-password-history-entity.interface';
import { UserEntityInterface } from '../interfaces/user-entity.interface';

/**
 * User Entity
 */
export abstract class UserPasswordHistoryPostgresEntity
  extends CommonPostgresEntity
  implements UserPasswordHistoryEntityInterface
{
  /**
   * Password hash
   */
  @Column({ type: 'text', nullable: true, default: null })
  passwordHash: string | null = null;

  /**
   * Password salt
   */
  @Column({ type: 'text', nullable: true, default: null })
  passwordSalt: string | null = null;

  /**
   * User ID
   */
  @Column({ type: 'uuid' })
  userId!: ReferenceId;

  /**
   * Should be configured by the implementation
   */
  user?: UserEntityInterface;
}
