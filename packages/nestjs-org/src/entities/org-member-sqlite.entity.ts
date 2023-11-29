import { Column, Unique } from 'typeorm';
import { ReferenceId, ReferenceIdInterface } from '@concepta/ts-core';
import { CommonSqliteEntity } from '@concepta/typeorm-common';

import { OrgMemberEntityInterface } from '../interfaces/org-member-entity.interface';

@Unique(['userId', 'orgId'])
export abstract class OrgMemberSqliteEntity
  extends CommonSqliteEntity
  implements OrgMemberEntityInterface
{
  @Column('boolean', { default: true })
  active = true;

  @Column()
  userId!: ReferenceId;

  @Column()
  orgId!: ReferenceId;

  user!: ReferenceIdInterface;

  org!: ReferenceIdInterface;
}
