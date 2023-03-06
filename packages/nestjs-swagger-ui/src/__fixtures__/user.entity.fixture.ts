import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { AuditSqlLiteEmbed } from '@concepta/typeorm-common';
import { AuditInterface } from '@concepta/ts-core';

@Entity()
export class UserEntityFixture {
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
  @Column(() => AuditSqlLiteEmbed)
  audit!: AuditInterface;
}
