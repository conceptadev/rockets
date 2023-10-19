import { Entity, ManyToOne } from 'typeorm';
import { InvitationSqliteEntity } from '@concepta/nestjs-invitation';
import { UserEntityFixture } from './user-entity.fixture';

@Entity()
export class InvitationEntityFixture extends InvitationSqliteEntity {
  @ManyToOne(() => UserEntityFixture, (user) => user.invitations, {
    nullable: false,
  })
  user!: UserEntityFixture;
}
