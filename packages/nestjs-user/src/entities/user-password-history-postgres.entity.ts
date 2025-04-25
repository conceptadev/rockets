import { Column } from 'typeorm';
import { ReferenceId } from '@concepta/nestjs-common';
import { CommonPostgresEntity } from '@concepta/nestjs-typeorm-ext';
import { UserPasswordHistoryEntityInterface } from '../interfaces/user-password-history-entity.interface';

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
  @Column({ type: 'text', nullable: true })
  passwordHash!: string;

  /**
   * Password salt
   */
  @Column({ type: 'text', nullable: true })
  passwordSalt!: string;

  /**
   * User ID
   */
  @Column({ type: 'uuid' })
  userId!: ReferenceId;
}
