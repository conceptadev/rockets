import { Entity } from 'typeorm';
import { InvitationSqliteEntity } from '../../../entities/invitation-sqlite.entity';

@Entity()
export class InvitationEntityFixture extends InvitationSqliteEntity {}
