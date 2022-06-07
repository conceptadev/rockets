import { Entity, ManyToOne } from 'typeorm';
import { RoleAssignmentSqliteEntity } from '../../entities/role-assignment-sqlite.entity';
import { RoleAssigneeInterface } from '../../interfaces/role-assignee.interface';
import { RoleEntityInterface } from '../../interfaces/role-entity.interface';
import { ApiKeyEntityFixture } from './api-key-entity.fixture';
import { RoleEntityFixture } from './role-entity.fixture';

/**
 * Api Key Role Entity Fixture
 */
@Entity()
export class ApiKeyRoleEntityFixture extends RoleAssignmentSqliteEntity {
  @ManyToOne(() => RoleEntityFixture, (role) => role.apiKeyRoles)
  role!: RoleEntityInterface;

  @ManyToOne(() => ApiKeyEntityFixture, (apiKey) => apiKey.apiKeyRoles)
  assignee!: RoleAssigneeInterface;
}
