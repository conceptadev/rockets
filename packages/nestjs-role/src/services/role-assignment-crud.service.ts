import { Repository } from 'typeorm';
import { TypeOrmCrudService } from '@concepta/nestjs-crud';
import { RoleAssignmentInterface } from '../interfaces/role-assignment.interface';

/**
 * Role assignment CRUD service
 */
export class RoleAssignmentCrudService extends TypeOrmCrudService<RoleAssignmentInterface> {
  /**
   * Constructor
   *
   * @param repo instance of a role assignment repository.
   */
  constructor(repo: Repository<RoleAssignmentInterface>) {
    super(repo);
  }
}
