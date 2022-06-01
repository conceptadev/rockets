import {
  CrudBody,
  CrudCreateOne,
  CrudDeleteOne,
  CrudReadAll,
  CrudReadOne,
  CrudRequest,
  CrudRequestInterface,
  CrudUpdateOne,
  CrudControllerInterface,
  CrudController,
  CrudCreateMany,
} from '@concepta/nestjs-crud';
import { RoleCrudService } from './services/role-crud.service';
import { RoleDto } from './dto/role.dto';
import { RoleCreateDto } from './dto/role-create.dto';
import { RoleCreateManyDto } from './dto/role-create-many.dto';
import { RoleUpdateDto } from './dto/role-update.dto';
import { RolePaginatedDto } from './dto/role-paginated.dto';
import { RoleEntityInterface } from './interfaces/role-entity.interface';

/**
 * Role controller.
 */
@CrudController({
  path: 'role',
  model: {
    type: RoleDto,
    paginatedType: RolePaginatedDto,
  },
})
export class RoleController
  implements CrudControllerInterface<RoleEntityInterface>
{
  /**
   * Constructor.
   *
   * @param roleCrudService instance of the Role crud service
   */
  constructor(private roleCrudService: RoleCrudService) {}

  /**
   * Get many
   *
   * @param crudRequest the CRUD request object
   */
  @CrudReadAll()
  async getMany(@CrudRequest() crudRequest: CrudRequestInterface) {
    return this.roleCrudService.getMany(crudRequest);
  }

  /**
   * Get one
   *
   * @param crudRequest the CRUD request object
   */
  @CrudReadOne()
  async getOne(@CrudRequest() crudRequest: CrudRequestInterface) {
    return this.roleCrudService.getOne(crudRequest);
  }

  /**
   * Create many
   *
   * @param crudRequest the CRUD request object
   * @param roleCreateManyDto role create many dto
   */
  @CrudCreateMany()
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
   * @param crudRequest the CRUD request object
   * @param roleCreateDto role create dto
   */
  @CrudCreateOne()
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
   * @param crudRequest the CRUD request object
   * @param roleUpdateDto role update dto
   */
  @CrudUpdateOne()
  async updateOne(
    @CrudRequest() crudRequest: CrudRequestInterface,
    @CrudBody() roleUpdateDto: RoleUpdateDto,
  ) {
    return this.roleCrudService.updateOne(crudRequest, roleUpdateDto);
  }

  /**
   * Delete one
   *
   * @param crudRequest the CRUD request object
   */
  @CrudDeleteOne()
  async deleteOne(@CrudRequest() crudRequest: CrudRequestInterface) {
    return this.roleCrudService.deleteOne(crudRequest);
  }
}
