import { Entity } from 'typeorm';
import { RoleAssignmentSqliteEntity } from '../../entities/role-assignment-sqlite.entity';

/**
 * Role Entity Fixture
 */
@Entity()
export class UserRoleEntityFixture extends RoleAssignmentSqliteEntity {}
