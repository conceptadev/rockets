import { ApiTags } from '@nestjs/swagger';
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

import { RoleAssignmentDto } from '../../dto/role-assignment.dto';
import { RoleAssignmentCreateDto } from '../../dto/role-assignment-create.dto';
import { RoleAssignmentPaginatedDto } from '../../dto/role-assignment-paginated.dto';
import { RoleAssignmentCreateManyDto } from '../../dto/role-assignment-create-many.dto';

import {
  AccessControlCreateMany,
  AccessControlCreateOne,
  AccessControlDeleteOne,
  AccessControlReadMany,
  AccessControlReadOne,
} from '@concepta/nestjs-access-control';
import { RoleAssignmentResource } from '../../role.types';
import { UserRoleAssignmentCrudServiceFixture } from '../service/user-role-assignment-crud.service.fixture';

/**
 * Role assignment controller.
 */
@ApiTags('role-assignment')
@CrudController({
  path: 'role-assignment/user',
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
export class UserRoleAssignmentControllerFixture
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
   * @param userRoleAssignmentCrudService User role assignment crud service
   */
  constructor(
    private userRoleAssignmentCrudService: UserRoleAssignmentCrudServiceFixture,
  ) {}

  /**
   * Get many user role assignment
   *
   * @param crudRequest Crud request object
   * @returns Found assignments
   */
  @CrudReadMany()
  @AccessControlReadMany(RoleAssignmentResource.Many)
  async getMany(@CrudRequest() crudRequest: CrudRequestInterface) {
    return this.userRoleAssignmentCrudService.getMany(crudRequest);
  }

  /**
   * Get one user role assignment
   *
   * @param crudRequest Crud request object
   * @returns Found assignment
   */
  @CrudReadOne()
  @AccessControlReadOne(RoleAssignmentResource.One)
  async getOne(@CrudRequest() crudRequest: CrudRequestInterface) {
    return this.userRoleAssignmentCrudService.getOne(crudRequest);
  }

  /**
   * Create many users role assignment
   *
   * @param crudRequest Crud request object
   * @param roleAssignmentCreateDto Role assignments create DTOs
   * @returns Created assignments
   */
  @CrudCreateMany()
  @AccessControlCreateMany(RoleAssignmentResource.Many)
  async createMany(
    @CrudRequest() crudRequest: CrudRequestInterface,
    @CrudBody() roleAssignmentCreateDto: RoleAssignmentCreateManyDto,
  ) {
    // the final data
    const roles = [];

    // loop all dtos
    for (const roleCreateDto of roleAssignmentCreateDto.bulk) {
      // encrypt it
      roles.push(roleCreateDto);
    }

    // call crud service to create
    return this.userRoleAssignmentCrudService.createMany(crudRequest, {
      bulk: roles,
    });
  }

  /**
   * Create one user role assignment
   *
   * @param crudRequest Crud request object
   * @param roleAssignmentCreateDto Role assignment create DTO
   * @returns Created assignment
   */
  @CrudCreateOne()
  @AccessControlCreateOne(RoleAssignmentResource.One)
  async createOne(
    @CrudRequest() crudRequest: CrudRequestInterface,
    @CrudBody() roleAssignmentCreateDto: RoleAssignmentCreateDto,
  ) {
    // call crud service to create
    return this.userRoleAssignmentCrudService.createOne(
      crudRequest,
      roleAssignmentCreateDto,
    );
  }

  /**
   * Delete one user role assignment
   *
   * @param crudRequest Crud request object
   */
  @CrudDeleteOne()
  @AccessControlDeleteOne(RoleAssignmentResource.One)
  async deleteOne(@CrudRequest() crudRequest: CrudRequestInterface) {
    return this.userRoleAssignmentCrudService.deleteOne(crudRequest);
  }
}
