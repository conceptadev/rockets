import { Column, PrimaryGeneratedColumn, Unique } from 'typeorm';
import {
  AuditInterface,
  ReferenceId,
  ReferenceIdInterface,
} from '@concepta/ts-core';
import { AuditSqlLiteEmbed } from '@concepta/typeorm-common';

import { OrgMemberEntityInterface } from '../interfaces/org-member-entity.interface';

@Unique(['userId', 'orgId'])
export abstract class OrgMemberSqliteEntity
  implements OrgMemberEntityInterface
{
  @PrimaryGeneratedColumn('uuid')
  id!: ReferenceId;

  @Column(() => AuditSqlLiteEmbed, {})
  audit!: AuditInterface;

  @Column('boolean', { default: true })
  active = true;

  @Column()
  userId!: ReferenceId;

  @Column()
  orgId!: ReferenceId;

  user!: ReferenceIdInterface;

  org!: ReferenceIdInterface;
}
