import { Entity, ManyToOne } from 'typeorm';
import { InvitationSqliteEntity } from '../../../entities/invitation-sqlite.entity';

import { UserEntityFixture } from '../../user/entities/user-entity.fixture';

@Entity()
export class InvitationEntityFixture extends InvitationSqliteEntity {
  @ManyToOne(() => UserEntityFixture, (user) => user.invitations, {
    nullable: false,
  })
  user!: UserEntityFixture;
}
