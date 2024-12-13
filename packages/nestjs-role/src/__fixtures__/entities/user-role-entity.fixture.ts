import { Entity, ManyToOne } from 'typeorm';
import { ReferenceIdInterface } from '@concepta/nestjs-common';
import { RoleAssignmentSqliteEntity } from '../../entities/role-assignment-sqlite.entity';
import { RoleEntityInterface } from '../../interfaces/role-entity.interface';
import { RoleEntityFixture } from './role-entity.fixture';
import { UserEntityFixture } from './user-entity.fixture';

/**
 * Role Entity Fixture
 */
@Entity()
export class UserRoleEntityFixture extends RoleAssignmentSqliteEntity {
  @ManyToOne(() => RoleEntityFixture, (role) => role.assignees)
  role!: RoleEntityInterface;

  @ManyToOne(() => UserEntityFixture, (user) => user.userRoles)
  assignee!: ReferenceIdInterface;
}
