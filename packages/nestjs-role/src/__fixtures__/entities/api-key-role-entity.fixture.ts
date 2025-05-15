import { RoleAssignmentSqliteEntity } from '@concepta/nestjs-typeorm-ext';
import { Entity } from 'typeorm';

/**
 * Api Key Role Entity Fixture
 */
@Entity()
export class ApiKeyRoleEntityFixture extends RoleAssignmentSqliteEntity {}
