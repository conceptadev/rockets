import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { AuditInterface } from '@concepta/ts-core';
import { AuditPostgresEmbed } from '@concepta/nestjs-typeorm-ext';
import { UserEntityInterface } from '../interfaces/user-entity.interface';

/**
 * User Entity
 */
@Entity()
export class User implements UserEntityInterface {
  /**
   * Unique Id
   */
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * Email
   */
  @Column()
  email: string;

  /**
   * Username
   */
  @Column()
  username: string;

  /**
   * Password hash
   */
  @Column({ nullable: true, default: null })
  passwordHash: string = null;

  /**
   * Password salt
   */
  @Column({ nullable: true, default: null })
  passwordSalt: string = null;

  /**
   * Audit embed
   */
  @Column(() => AuditPostgresEmbed)
  audit: AuditInterface;
}
