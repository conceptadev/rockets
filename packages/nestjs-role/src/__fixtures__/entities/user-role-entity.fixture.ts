import { Entity } from 'typeorm';
import { RoleAssignmentSqliteEntity } from '@concepta/nestjs-typeorm-ext/src/entities/role/role-assignment-sqlite.entity';

/**
 * Role Entity Fixture
 */
@Entity()
export class UserRoleEntityFixture extends RoleAssignmentSqliteEntity {}
