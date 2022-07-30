import { Entity, ManyToOne } from 'typeorm';
import { InvitationSqliteEntity } from '../entities/invitation-sqlite.entity';
import { InvitationUserEntityFixture } from './invitation-user-entity.fixture';

//TODO check this entity fixture later
@Entity()
export class InvitationEntityFixture extends InvitationSqliteEntity {
  @ManyToOne(() => InvitationUserEntityFixture, (user) => user.invitations)
  user!: InvitationUserEntityFixture;
}
