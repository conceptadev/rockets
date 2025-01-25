import { Column, CreateDateColumn } from 'typeorm';
import { CommonSqliteEntity } from '@concepta/typeorm-common';
import { UserEntityInterface } from '../interfaces/user-entity.interface';
import { UserPasswordHistoryEntityInterface } from '../interfaces/user-password-history-entity.interface';

export abstract class UserSqliteEntity
  extends CommonSqliteEntity
  implements UserEntityInterface
{
  /**
   * Email
   */
  @Column({ unique: true })
  email!: string;

  /**
   * Username
   */
  @Column({ unique: true })
  username!: string;

  /**
   * Active
   */
  @Column({ default: true })
  active!: boolean;

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
   * Login attempts
   */
  @Column({ default: 0 })
  loginAttempts!: number;

  /**
   * Last login date
   */
  @CreateDateColumn({
    type: 'datetime',
    nullable: true,
    default: null,
  })
  lastLogin: Date | null = null;

  userPasswordHistory?: UserPasswordHistoryEntityInterface;
}
