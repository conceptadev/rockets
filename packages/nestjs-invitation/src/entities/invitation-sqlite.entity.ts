import { Column } from 'typeorm';
import { PlainLiteralObject } from '@nestjs/common';
import { CommonSqliteEntity } from '@concepta/typeorm-common';
import {
  InvitationUserInterface,
  ReferenceActive,
} from '@concepta/nestjs-common';
import { InvitationEntityInterface } from '../interfaces/invitation.entity.interface';

export abstract class InvitationSqliteEntity
  extends CommonSqliteEntity
  implements InvitationEntityInterface
{
  @Column('boolean', { default: true })
  active!: ReferenceActive;

  @Column()
  code!: string;

  @Column()
  category!: string;

  @Column({ type: 'simple-json', nullable: true })
  constraints!: PlainLiteralObject;

  user!: InvitationUserInterface;
}
