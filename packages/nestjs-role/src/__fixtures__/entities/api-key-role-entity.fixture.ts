import { RoleAssignmentSqliteEntity } from '@concepta/nestjs-typeorm-ext/src/entities/role/role-assignment-sqlite.entity';
import { Entity } from 'typeorm';

/**
 * Api Key Role Entity Fixture
 */
@Entity()
export class ApiKeyRoleEntityFixture extends RoleAssignmentSqliteEntity {}
