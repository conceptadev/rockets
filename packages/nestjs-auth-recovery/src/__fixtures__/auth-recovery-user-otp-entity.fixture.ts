import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import {
  AuditInterface,
  ReferenceId,
  ReferenceIdInterface,
} from '@concepta/ts-core';
import { AuthRecoveryUserEntityFixture } from './auth-recovery-user-entity.fixture';
import { OtpInterface } from '@concepta/ts-common';
import { AuditSqlLiteEmbed } from '@concepta/typeorm-common';

/**
 * Otp Entity Fixture
 */
@Entity()
export class AuthRecoveryUserOtpEntityFixture implements OtpInterface {
  @PrimaryGeneratedColumn('uuid')
  id!: ReferenceId;

  @Column()
  category!: string;

  @Column({ nullable: true })
  type!: string;

  @Column()
  passcode!: string;

  @Column({ type: 'datetime' })
  expirationDate!: Date;

  @Column(() => AuditSqlLiteEmbed, {})
  audit!: AuditInterface;

  @ManyToOne(() => AuthRecoveryUserEntityFixture, (user) => user.userOtps)
  assignee!: ReferenceIdInterface;
}
