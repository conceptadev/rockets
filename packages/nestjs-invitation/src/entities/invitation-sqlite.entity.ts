import { Column, PrimaryGeneratedColumn } from 'typeorm';
import {
  AuditInterface,
  ReferenceActive,
  ReferenceId,
  ReferenceIdInterface,
} from '@concepta/ts-core';
import { AuditSqlLiteEmbed } from '@concepta/typeorm-common';

import { InvitationEntityInterface } from '../interfaces/invitation.entity.interface';

//TODO check this entity later
export abstract class InvitationSqliteEntity
  implements InvitationEntityInterface
{
  @PrimaryGeneratedColumn('uuid')
  id!: ReferenceId;

  @Column(() => AuditSqlLiteEmbed, {})
  audit!: AuditInterface;

  @Column('boolean', { default: true })
  active!: ReferenceActive;

  @Column()
  email!: string;

  @Column()
  code!: string;

  @Column()
  category!: string;

  user!: ReferenceIdInterface;
}
