import { Column, PrimaryGeneratedColumn } from 'typeorm';
import {
  AuditInterface,
  ReferenceActive,
  ReferenceId,
  ReferenceIdInterface,
} from '@concepta/ts-core';
import { AuditPostgresEmbed } from '@concepta/typeorm-common';

import { InvitationEntityInterface } from '../interfaces/invitation.entity.interface';
import { LiteralObject } from '@nestjs/common';

// TODO check this entity later
export abstract class InvitationPostgresEntity
  implements InvitationEntityInterface
{
  @PrimaryGeneratedColumn('uuid')
  id!: ReferenceId;

  @Column(() => AuditPostgresEmbed, {})
  audit!: AuditInterface;

  @Column('boolean', { default: true })
  active!: ReferenceActive;

  @Column()
  email!: string;

  @Column()
  code!: string;

  @Column()
  category!: string;

  @Column({ type: 'jsonb' })
  constraints?: LiteralObject;

  user!: ReferenceIdInterface;
}
