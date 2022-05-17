import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { AuditInterface } from '@concepta/ts-core';
import { AuditSqlLiteEmbed } from '@concepta/typeorm-common';

@Entity()
export class MyUser {
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
  @Column(() => AuditSqlLiteEmbed)
  audit?: AuditInterface;
}
