import { Inject, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ReferenceAssignment } from '@concepta/nestjs-common';
import {
  RoleAssignmentCreatableInterface,
  RoleAssignmentInterface,
} from '@concepta/nestjs-common';
import {
  CrudBody,
  CrudCreateOne,
  CrudDeleteOne,
  CrudReadOne,
  CrudRequest,
  CrudRequestInterface,
  CrudControllerInterface,
  CrudController,
  CrudCreateMany,
  CrudReadMany,
} from '@concepta/nestjs-crud';
import {
  ROLE_MODULE_CRUD_SERVICES_TOKEN,
  ROLE_MODULE_SETTINGS_TOKEN,
} from './role.constants';
import { RoleEntityNotFoundException } from './exceptions/role-entity-not-found.exception';
import { RoleAssignmentNotFoundException } from './exceptions/role-assignment-not-found.exception';
import { RoleAssignmentCrudService } from './services/role-assignment-crud.service';
import { RoleAssignmentDto } from './dto/role-assignment.dto';
import { RoleAssignmentCreateDto } from './dto/role-assignment-create.dto';
import { RoleAssignmentPaginatedDto } from './dto/role-assignment-paginated.dto';
import { RoleAssignmentCreateManyDto } from './dto/role-assignment-create-many.dto';
import { RoleSettingsInterface } from './interfaces/role-settings.interface';
import {
  AccessControlCreateMany,
  AccessControlCreateOne,
  AccessControlDeleteOne,
  AccessControlReadMany,
  AccessControlReadOne,
} from '@concepta/nestjs-access-control';
import { RoleAssignmentResource } from './role.types';

/**
 * Role assignment controller.
 */
@ApiTags('role-assignment')
@CrudController({
  path: 'role-assignment/:assignment',
  model: {
    type: RoleAssignmentDto,
    paginatedType: RoleAssignmentPaginatedDto,
  },
  params: {
    id: { field: 'id', type: 'string', primary: true },
    assignment: {
      field: 'assignment',
      disabled: true,
    },
  },
})
export class RoleAssignmentController
  implements
    CrudControllerInterface<
      RoleAssignmentInterface,
      RoleAssignmentCreatableInterface,
      never,
      never
    >
{
  /**
   * Constructor.
   *
   * @param settings - role settings
   * @param allCrudServices - instances of all crud services
   */
  constructor(
    @Inject(ROLE_MODULE_SETTINGS_TOKEN)
    private settings: RoleSettingsInterface,
    @Inject(ROLE_MODULE_CRUD_SERVICES_TOKEN)
    private allCrudServices: Record<string, RoleAssignmentCrudService>,
  ) {}

  /**
   * Get many
   *
   * @param crudRequest - the CRUD request object
   * @param assignment - the assignment
   */
  @CrudReadMany()
  @AccessControlReadMany(RoleAssignmentResource.Many)
  async getMany(
    @CrudRequest() crudRequest: CrudRequestInterface,
    @Param('assignment') assignment: ReferenceAssignment,
  ) {
    return this.getCrudService(assignment).getMany(crudRequest);
  }

  /**
   * Get one
   *
   * @param crudRequest - the CRUD request object
   * @param assignment - The role assignment
   */
  @CrudReadOne()
  @AccessControlReadOne(RoleAssignmentResource.One)
  async getOne(
    @CrudRequest() crudRequest: CrudRequestInterface,
    @Param('assignment') assignment: ReferenceAssignment,
  ) {
    return this.getCrudService(assignment).getOne(crudRequest);
  }

  /**
   * Create many
   *
   * @param crudRequest - the CRUD request object
   * @param roleAssignmentCreateDto - role create many dto
   * @param assignment - The role assignment
   */
  @CrudCreateMany()
  @AccessControlCreateMany(RoleAssignmentResource.Many)
  async createMany(
    @CrudRequest() crudRequest: CrudRequestInterface,
    @CrudBody() roleAssignmentCreateDto: RoleAssignmentCreateManyDto,
    @Param('assignment') assignment: ReferenceAssignment,
  ) {
    // the final data
    const roles = [];

    // loop all dtos
    for (const roleCreateDto of roleAssignmentCreateDto.bulk) {
      // encrypt it
      roles.push(roleCreateDto);
    }

    // call crud service to create
    return this.getCrudService(assignment).createMany(crudRequest, {
      bulk: roles,
    });
  }

  /**
   * Create one
   *
   * @param crudRequest - the CRUD request object
   * @param roleAssignmentCreateDto - role create dto
   * @param assignment - The role assignment
   */
  @CrudCreateOne()
  @AccessControlCreateOne(RoleAssignmentResource.One)
  async createOne(
    @CrudRequest() crudRequest: CrudRequestInterface,
    @CrudBody() roleAssignmentCreateDto: RoleAssignmentCreateDto,
    @Param('assignment') assignment: ReferenceAssignment,
  ) {
    // call crud service to create
    return this.getCrudService(assignment).createOne(
      crudRequest,
      roleAssignmentCreateDto,
    );
  }

  /**
   * Delete one
   *
   * @param crudRequest - the CRUD request object
   * @param assignment - The role assignment
   */
  @CrudDeleteOne()
  @AccessControlDeleteOne(RoleAssignmentResource.One)
  async deleteOne(
    @CrudRequest() crudRequest: CrudRequestInterface,
    @Param('assignment') assignment: ReferenceAssignment,
  ) {
    return this.getCrudService(assignment).deleteOne(crudRequest);
  }

  /**
   * Get the crud service for the given assignment.
   *
   * @internal
   * @param assignment - The role assignment
   */
  protected getCrudService(
    assignment: ReferenceAssignment,
  ): RoleAssignmentCrudService {
    // have entity key for given assignment?
    if (this.settings.assignments[assignment]) {
      // yes, set it
      const entityKey = this.settings.assignments[assignment].entityKey;
      // repo matching assignment was injected?
      if (this.allCrudServices[entityKey]) {
        // yes, return it
        return this.allCrudServices[entityKey];
      } else {
        // bad entity key
        throw new RoleEntityNotFoundException(entityKey);
      }
    } else {
      // bad assignment
      throw new RoleAssignmentNotFoundException(assignment);
    }
  }
}
