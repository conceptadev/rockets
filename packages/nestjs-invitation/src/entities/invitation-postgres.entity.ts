import { Column } from 'typeorm';
import { PlainLiteralObject } from '@nestjs/common';
import { ReferenceActive, ReferenceIdInterface } from '@concepta/nestjs-common';
import { CommonPostgresEntity } from '@concepta/typeorm-common';

import { InvitationEntityInterface } from '../interfaces/invitation.entity.interface';
import { ReferenceEmailInterface } from '@concepta/nestjs-common/src';

// TODO check this entity later
export abstract class InvitationPostgresEntity
  extends CommonPostgresEntity
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

  @Column({ type: 'jsonb' })
  constraints?: PlainLiteralObject;

  user!: ReferenceIdInterface & ReferenceEmailInterface;
}
