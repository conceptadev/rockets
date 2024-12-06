import { Column } from 'typeorm';
import { PlainLiteralObject } from '@nestjs/common';
import { ReferenceActive, ReferenceIdInterface } from '@concepta/nestjs-common';
import { CommonSqliteEntity } from '@concepta/typeorm-common';

import { InvitationEntityInterface } from '../interfaces/invitation.entity.interface';

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
  constraints?: PlainLiteralObject;

  user!: ReferenceIdInterface;
}
