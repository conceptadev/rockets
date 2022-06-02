import { Column, Entity } from 'typeorm';
import { RoleTargetSqliteEntity } from '../entities/role-target-sqlite.entity';

/**
 * Role Entity Fixture
 */
@Entity()
export class OrgMemberRoleEntityFixture extends RoleTargetSqliteEntity {
  @Column({ name: 'orgId' })
  targetId: string;
}
