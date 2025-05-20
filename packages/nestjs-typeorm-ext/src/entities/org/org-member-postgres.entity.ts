import { Column, Unique } from 'typeorm';
import { ReferenceId } from '@concepta/nestjs-common';
import { CommonPostgresEntity } from '../common/common-postgres.entity';
import { OrgMemberEntityInterface } from '@concepta/nestjs-common';

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
