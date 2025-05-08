// import { Param } from '@nestjs/common';
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
  CrudRecoverOne,
} from '@concepta/nestjs-crud';
import { ApiTags } from '@nestjs/swagger';
import {
  UserCreatableInterface,
  UserUpdatableInterface,
} from '@concepta/nestjs-common';
import {
  AccessControlCreateMany,
  AccessControlCreateOne,
  AccessControlDeleteOne,
  AccessControlQuery,
  AccessControlReadMany,
  AccessControlReadOne,
  AccessControlRecoverOne,
  AccessControlUpdateOne,
} from '@concepta/nestjs-access-control';

import { UserResource } from '../../user.types';
import { UserCrudServiceFixture } from '../services/user-crud.service.fixture';
import { UserEntityInterface } from '@concepta/nestjs-common';
import { UserDto } from '../../dto/user.dto';
import { UserCreateDto } from '../../dto/user-create.dto';
import { UserCreateManyDto } from '../../dto/user-create-many.dto';
import { UserUpdateDto } from '../../dto/user-update.dto';
import { UserPaginatedDto } from '../../dto/user-paginated.dto';
import { UserAccessQueryService } from '../../services/user-access-query.service';

/**
 * User controller.
 */
@CrudController({
  path: 'user',
  model: {
    type: UserDto,
    paginatedType: UserPaginatedDto,
  },
})
@AccessControlQuery({
  service: UserAccessQueryService,
})
@ApiTags('user')
export class UserCrudControllerFixture
  implements
    CrudControllerInterface<
      UserEntityInterface,
      UserCreatableInterface,
      UserUpdatableInterface
    >
{
  /**
   * Constructor.
   *
   * @param userCrudService - instance of the user crud service
   */
  constructor(
    private userCrudService: UserCrudServiceFixture, // private userPasswordService: UserPasswordService,
  ) {}

  /**
   * Get many
   *
   * @param crudRequest - the CRUD request object
   */
  @CrudReadMany()
  @AccessControlReadMany(UserResource.Many)
  async getMany(@CrudRequest() crudRequest: CrudRequestInterface) {
    return this.userCrudService.getMany(crudRequest);
  }

  /**
   * Get one
   *
   * @param crudRequest - the CRUD request object
   */
  @CrudReadOne()
  @AccessControlReadOne(UserResource.One)
  async getOne(@CrudRequest() crudRequest: CrudRequestInterface) {
    return this.userCrudService.getOne(crudRequest);
  }

  /**
   * Create many
   *
   * @param crudRequest - the CRUD request object
   * @param userCreateManyDto - user create many dto
   */
  @CrudCreateMany()
  @AccessControlCreateMany(UserResource.Many)
  async createMany(
    @CrudRequest() crudRequest: CrudRequestInterface,
    @CrudBody() userCreateManyDto: UserCreateManyDto,
  ) {
    // call crud service to create
    return this.userCrudService.createMany(crudRequest, userCreateManyDto);
  }

  /**
   * Create one
   *
   * @param crudRequest - the CRUD request object
   * @param userCreateDto - user create dto
   */
  @CrudCreateOne()
  @AccessControlCreateOne(UserResource.One)
  async createOne(
    @CrudRequest() crudRequest: CrudRequestInterface,
    @CrudBody() userCreateDto: UserCreateDto,
  ) {
    return this.userCrudService.createOne(crudRequest, userCreateDto);
  }

  /**
   * Update one
   *
   * @param crudRequest - the CRUD request object
   * @param userUpdateDto - user update dto
   */
  @CrudUpdateOne()
  @AccessControlUpdateOne(UserResource.One)
  async updateOne(
    @CrudRequest() crudRequest: CrudRequestInterface,
    @CrudBody() userUpdateDto: UserUpdateDto,
  ) {
    return this.userCrudService.updateOne(crudRequest, userUpdateDto);
  }

  /**
   * Delete one
   *
   * @param crudRequest - the CRUD request object
   */
  @CrudDeleteOne()
  @AccessControlDeleteOne(UserResource.One)
  async deleteOne(@CrudRequest() crudRequest: CrudRequestInterface) {
    return this.userCrudService.deleteOne(crudRequest);
  }

  /**
   * Recover one
   *
   * @param crudRequest - the CRUD request object
   */
  @CrudRecoverOne()
  @AccessControlRecoverOne(UserResource.One)
  async recoverOne(@CrudRequest() crudRequest: CrudRequestInterface) {
    return this.userCrudService.recoverOne(crudRequest);
  }
}
