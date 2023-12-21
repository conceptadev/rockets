import { Column } from 'typeorm';
import { ReferenceActive, ReferenceIdInterface } from '@concepta/ts-core';
import { CommonSqliteEntity } from '@concepta/typeorm-common';

import { InvitationEntityInterface } from '../interfaces/invitation.entity.interface';
import { LiteralObject } from '@nestjs/common';

// TODO check this entity later
export abstract class InvitationSqliteEntity
  extends CommonSqliteEntity
  implements InvitationEntityInterface
{
  @Column('boolean', { default: true })
  active!: ReferenceActive;

  @Column()
  email!: string;

  @Column()
  code!: string;

  @Column()
  category!: string;

  @Column({ type: 'simple-json', nullable: true })
  constraints?: LiteralObject;

  user!: ReferenceIdInterface;
}
