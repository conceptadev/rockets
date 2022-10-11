import { Column, PrimaryGeneratedColumn, Unique } from 'typeorm';
import {
  AuditInterface,
  ReferenceId,
  ReferenceIdInterface,
} from '@concepta/ts-core';
import { AuditPostgresEmbed } from '@concepta/typeorm-common';

import { OrgMemberEntityInterface } from '../interfaces/org-member-entity.interface';

@Unique(['userId', 'orgId'])
export abstract class OrgMemberPostgresEntity
  implements OrgMemberEntityInterface
{
  @PrimaryGeneratedColumn('uuid')
  id!: ReferenceId;

  @Column(() => AuditPostgresEmbed, {})
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
