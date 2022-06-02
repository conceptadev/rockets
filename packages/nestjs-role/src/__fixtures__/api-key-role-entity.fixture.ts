import { Column, Entity } from 'typeorm';
import { RoleTargetSqliteEntity } from '../entities/role-target-sqlite.entity';

/**
 * Role Entity Fixture
 */
@Entity()
export class ApiKeyRoleEntityFixture extends RoleTargetSqliteEntity {
  @Column({ name: 'apiKeyId' })
  targetId: string;
}
