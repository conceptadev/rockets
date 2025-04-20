import { Entity } from 'typeorm';
import { InvitationSqliteEntity } from '@concepta/nestjs-invitation';

@Entity()
export class InvitationEntityFixture extends InvitationSqliteEntity {}
