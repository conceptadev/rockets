import { ApiTags } from '@nestjs/swagger';
import {
  CrudBody,
  CrudCreateOne,
  CrudDeleteOne,
  CrudReadOne,
  CrudRequest,
  CrudRequestInterface,
  CrudUpdateOne,
  CrudControllerInterface,
  CrudController,
  CrudCreateMany,
  CrudReadMany,
} from '@concepta/nestjs-crud';
import {
  AccessControlCreateMany,
  AccessControlCreateOne,
  AccessControlDeleteOne,
  AccessControlReadMany,
  AccessControlReadOne,
  AccessControlUpdateOne,
} from '@concepta/nestjs-access-control';
import {
  RoleCreatableInterface,
  RoleUpdatableInterface,
} from '@concepta/nestjs-common';
import { RoleCrudServiceFixture } from '../service/role-crud.service.fixture';
import { RoleDto } from '../../dto/role.dto';
import { RoleCreateDto } from '../../dto/role-create.dto';
import { RoleCreateManyDto } from '../../dto/role-create-many.dto';
import { RoleUpdateDto } from '../../dto/role-update.dto';
import { RolePaginatedDto } from '../../dto/role-paginated.dto';
import { RoleEntityInterface } from '@concepta/nestjs-common';
import { RoleResource } from '../../role.types';

/**
 * Role controller.
 */
@ApiTags('role')
@CrudController({
  path: 'role',
  model: {
    type: RoleDto,
    paginatedType: RolePaginatedDto,
  },
})
export class RoleControllerFixture
  implements
    CrudControllerInterface<
      RoleEntityInterface,
      RoleCreatableInterface,
      RoleUpdatableInterface
    >
{
  /**
   * Constructor.
   *
   * @param roleCrudService - instance of the Role crud service
   */
  constructor(private roleCrudService: RoleCrudServiceFixture) {}

  /**
   * Get many
   *
   * @param crudRequest - the CRUD request object
   */
  @CrudReadMany()
  @AccessControlReadMany(RoleResource.Many)
  async getMany(@CrudRequest() crudRequest: CrudRequestInterface) {
    return this.roleCrudService.getMany(crudRequest);
  }

  /**
   * Get one
   *
   * @param crudRequest - the CRUD request object
   */
  @CrudReadOne()
  @AccessControlReadOne(RoleResource.One)
  async getOne(@CrudRequest() crudRequest: CrudRequestInterface) {
    return this.roleCrudService.getOne(crudRequest);
  }

  /**
   * Create many
   *
   * @param crudRequest - the CRUD request object
   * @param roleCreateManyDto - role create many dto
   */
  @CrudCreateMany()
  @AccessControlCreateMany(RoleResource.Many)
  async createMany(
    @CrudRequest() crudRequest: CrudRequestInterface,
    @CrudBody() roleCreateManyDto: RoleCreateManyDto,
  ) {
    // the final data
    const roles = [];

    // loop all dtos
    for (const roleCreateDto of roleCreateManyDto.bulk) {
      // encrypt it
      roles.push(roleCreateDto);
    }

    // call crud service to create
    return this.roleCrudService.createMany(crudRequest, { bulk: roles });
  }

  /**
   * Create one
   *
   * @param crudRequest - the CRUD request object
   * @param roleCreateDto - role create dto
   */
  @CrudCreateOne()
  @AccessControlCreateOne(RoleResource.One)
  async createOne(
    @CrudRequest() crudRequest: CrudRequestInterface,
    @CrudBody() roleCreateDto: RoleCreateDto,
  ) {
    // call crud service to create
    return this.roleCrudService.createOne(crudRequest, roleCreateDto);
  }

  /**
   * Update one
   *
   * @param crudRequest - the CRUD request object
   * @param roleUpdateDto - role update dto
   */
  @CrudUpdateOne()
  @AccessControlUpdateOne(RoleResource.One)
  async updateOne(
    @CrudRequest() crudRequest: CrudRequestInterface,
    @CrudBody() roleUpdateDto: RoleUpdateDto,
  ) {
    return this.roleCrudService.updateOne(crudRequest, roleUpdateDto);
  }

  /**
   * Delete one
   *
   * @param crudRequest - the CRUD request object
   */
  @CrudDeleteOne()
  @AccessControlDeleteOne(RoleResource.One)
  async deleteOne(@CrudRequest() crudRequest: CrudRequestInterface) {
    return this.roleCrudService.deleteOne(crudRequest);
  }
}
