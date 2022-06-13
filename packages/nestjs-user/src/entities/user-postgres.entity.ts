import { Column, PrimaryGeneratedColumn } from 'typeorm';
import { AuditInterface } from '@concepta/ts-core';
import { AuditPostgresEmbed } from '@concepta/typeorm-common';
import { UserEntityInterface } from '../interfaces/user-entity.interface';

/**
 * User Entity
 */
export abstract class UserPostgresEntity implements UserEntityInterface {
  /**
   * Unique Id
   */
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  /**
   * Email
   */
  @Column()
  email!: string;

  /**
   * Username
   */
  @Column()
  username!: string;

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
   * Audit embed
   */
  @Column(() => AuditPostgresEmbed)
  audit!: AuditInterface;
}
