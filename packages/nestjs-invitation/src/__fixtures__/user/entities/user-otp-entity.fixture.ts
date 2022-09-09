import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import {
  AuditInterface,
  ReferenceId,
  ReferenceIdInterface,
} from '@concepta/ts-core';
import { OtpInterface } from '@concepta/ts-common';
import { AuditSqlLiteEmbed } from '@concepta/typeorm-common';

import { UserEntityFixture } from './user-entity.fixture';

/**
 * Otp Entity Fixture
 */
@Entity()
export class UserOtpEntityFixture implements OtpInterface {
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

  @ManyToOne(() => UserEntityFixture, (user) => user.userOtps)
  assignee!: ReferenceIdInterface;
}
