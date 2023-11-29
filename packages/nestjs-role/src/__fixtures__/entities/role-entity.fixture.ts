import { Entity, OneToMany } from 'typeorm';
import { RoleSqliteEntity } from '../../entities/role-sqlite.entity';
import { RoleEntityInterface } from '../../interfaces/role-entity.interface';
import { ApiKeyRoleEntityFixture } from './api-key-role-entity.fixture';
import { UserRoleEntityFixture } from './user-role-entity.fixture';

/**
 * Role Entity Fixture
 */
@Entity()
export class RoleEntityFixture
  extends RoleSqliteEntity
  implements RoleEntityInterface
{
  @OneToMany(() => UserRoleEntityFixture, (userRole) => userRole.role)
  userRoles?: UserRoleEntityFixture[];

  @OneToMany(() => ApiKeyRoleEntityFixture, (apiKeyRole) => apiKeyRole.role)
  apiKeyRoles?: ApiKeyRoleEntityFixture[];
}
