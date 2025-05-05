import { Column } from 'typeorm';
import { ReferenceId } from '@concepta/nestjs-common';
import { CommonSqliteEntity } from '@concepta/nestjs-typeorm-ext';
import { UserPasswordHistoryEntityInterface } from '@concepta/nestjs-common';

/**
 * User Entity
 */
export abstract class UserPasswordHistorySqliteEntity
  extends CommonSqliteEntity
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
