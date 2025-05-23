import { Column } from 'typeorm';
import { PlainLiteralObject } from '@nestjs/common';
import { ReferenceActive, ReferenceId } from '@concepta/nestjs-common';
import { CommonSqliteEntity } from '@concepta/nestjs-typeorm-ext';
import { InvitationEntityInterface } from '../interfaces/domain/invitation-entity.interface';

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

  @Column({ type: 'uuid' })
  userId!: ReferenceId;
}
