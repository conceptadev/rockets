import { Column, Unique } from 'typeorm';
import { ReferenceId } from '@concepta/nestjs-common';
import { CommonPostgresEntity } from '@concepta/nestjs-typeorm-ext';

import { OrgMemberEntityInterface } from '../interfaces/org-member-entity.interface';

@Unique(['userId', 'orgId'])
export abstract class OrgMemberPostgresEntity
  extends CommonPostgresEntity
  implements OrgMemberEntityInterface
{
  @Column('boolean', { default: true })
  active = true;

  @Column({ type: 'uuid' })
  userId!: ReferenceId;

  @Column({ type: 'uuid' })
  orgId!: ReferenceId;
}
