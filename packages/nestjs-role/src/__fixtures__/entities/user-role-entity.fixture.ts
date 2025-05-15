import { RoleAssignmentSqliteEntity } from '@concepta/nestjs-typeorm-ext';
import { Entity } from 'typeorm';

/**
 * Role Entity Fixture
 */
@Entity()
export class UserRoleEntityFixture extends RoleAssignmentSqliteEntity {}
