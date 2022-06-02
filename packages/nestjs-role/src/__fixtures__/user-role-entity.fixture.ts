import { Column, Entity } from 'typeorm';
import { RoleTargetSqliteEntity } from '../entities/role-target-sqlite.entity';

/**
 * Role Entity Fixture
 */
@Entity()
export class UserRoleEntityFixture extends RoleTargetSqliteEntity {
  @Column({ name: 'userId' })
  targetId: string;
}
