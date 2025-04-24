import { Column } from 'typeorm';
import { PlainLiteralObject } from '@nestjs/common';
import { CommonPostgresEntity } from '@concepta/typeorm-common';
import { ReferenceActive, ReferenceId } from '@concepta/nestjs-common';

import { InvitationEntityInterface } from '../interfaces/domain/invitation-entity.interface';

// TODO check this entity later
export abstract class InvitationPostgresEntity
  extends CommonPostgresEntity
  implements InvitationEntityInterface
{
  @Column('boolean', { default: true })
  active!: ReferenceActive;

  @Column()
  code!: string;

  @Column()
  category!: string;

  @Column({ type: 'jsonb' })
  constraints!: PlainLiteralObject;

  @Column({ type: 'uuid' })
  userId!: ReferenceId;
}
