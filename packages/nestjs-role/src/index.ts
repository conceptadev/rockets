export { RoleModule } from './role.module';

export { RoleService } from './services/role.service';
export { RoleModelService } from './services/role-model.service';

export { RoleModelServiceInterface } from './interfaces/role-model-service.interface';

export { RoleAssignmentCreateManyDto } from './dto/role-assignment-create-many.dto';
export { RoleAssignmentCreateDto } from './dto/role-assignment-create.dto';
export { RoleAssignmentPaginatedDto } from './dto/role-assignment-paginated.dto';
export { RoleAssignmentDto } from './dto/role-assignment.dto';
export { RoleCreateManyDto } from './dto/role-create-many.dto';
export { RoleCreateDto } from './dto/role-create.dto';
export { RolePaginatedDto } from './dto/role-paginated.dto';
export { RoleUpdateDto } from './dto/role-update.dto';
export { RoleDto } from './dto/role.dto';

export { RoleResource, RoleAssignmentResource } from './role.types';
export { RoleException } from './exceptions/role.exception';
export { RoleAssignmentNotFoundException as AssignmentNotFoundException } from './exceptions/role-assignment-not-found.exception';
export { RoleEntityNotFoundException as EntityNotFoundException } from './exceptions/role-entity-not-found.exception';
export { RoleAssignmentConflictException } from './exceptions/role-assignment-conflict.exception';
export { RoleMissingEntitiesOptionsException } from './exceptions/role-missing-entities-options.exception';
