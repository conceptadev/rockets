import { Entity } from 'typeorm';
import { OrgMemberSqliteEntity } from '@concepta/nestjs-typeorm-ext';

@Entity()
export class OrgMemberEntityFixture extends OrgMemberSqliteEntity {}
