import { Entity } from 'typeorm';
import { OrgMemberSqliteEntity } from '../entities/org-member-sqlite.entity';

@Entity()
export class OrgMemberEntityFixture extends OrgMemberSqliteEntity {}
