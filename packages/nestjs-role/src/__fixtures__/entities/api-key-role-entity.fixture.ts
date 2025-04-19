import { Entity } from 'typeorm';
import { RoleAssignmentSqliteEntity } from '../../entities/role-assignment-sqlite.entity';

/**
 * Api Key Role Entity Fixture
 */
@Entity()
export class ApiKeyRoleEntityFixture extends RoleAssignmentSqliteEntity {}
