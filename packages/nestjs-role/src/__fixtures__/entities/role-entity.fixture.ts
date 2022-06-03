import { Entity, OneToMany } from 'typeorm';
import { RoleSqliteEntity } from '../../entities/role-sqlite.entity';
import { ApiKeyRoleEntityFixture } from './api-key-role-entity.fixture';
import { UserRoleEntityFixture } from './user-role-entity.fixture';

/**
 * Role Entity Fixture
 */
@Entity()
export class RoleEntityFixture extends RoleSqliteEntity {
  @OneToMany(() => UserRoleEntityFixture, (userRole) => userRole.role)
  userRoles?: UserRoleEntityFixture[];

  @OneToMany(() => ApiKeyRoleEntityFixture, (apiKeyRole) => apiKeyRole.role)
  apiKeyRoles?: ApiKeyRoleEntityFixture[];
}
