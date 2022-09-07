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
  PasswordPlainInterface,
  UserCreatableInterface,
  UserUpdatableInterface,
} from '@concepta/ts-common';
import { PasswordStorageService } from '@concepta/nestjs-password';
import {
  AccessControlCreateMany,
  AccessControlCreateOne,
  AccessControlDeleteOne,
  AccessControlReadMany,
  AccessControlReadOne,
  AccessControlRecoverOne,
  AccessControlUpdateOne,
} from '@concepta/nestjs-access-control';
import { UserCrudService } from './services/user-crud.service';
import { UserDto } from './dto/user.dto';
import { UserCreateDto } from './dto/user-create.dto';
import { UserCreateManyDto } from './dto/user-create-many.dto';
import { UserUpdateDto } from './dto/user-update.dto';
import { UserPaginatedDto } from './dto/user-paginated.dto';
import { UserEntityInterface } from './interfaces/user-entity.interface';
import { UserResource } from './user.types';

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
@ApiTags('user')
export class UserController
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
   * @param userCrudService instance of the user crud service
   * @param passwordStorageService instance of password service
   */
  constructor(
    private userCrudService: UserCrudService,
    private passwordStorageService: PasswordStorageService,
  ) {}

  /**
   * Get many
   *
   * @param crudRequest the CRUD request object
   */
  @CrudReadMany()
  @AccessControlReadMany(UserResource.Many)
  async getMany(@CrudRequest() crudRequest: CrudRequestInterface) {
    return this.userCrudService.getMany(crudRequest);
  }

  /**
   * Get one
   *
   * @param crudRequest the CRUD request object
   */
  @CrudReadOne()
  @AccessControlReadOne(UserResource.One)
  async getOne(@CrudRequest() crudRequest: CrudRequestInterface) {
    return this.userCrudService.getOne(crudRequest);
  }

  /**
   * Create many
   *
   * @param crudRequest the CRUD request object
   * @param userCreateManyDto user create many dto
   */
  @CrudCreateMany()
  @AccessControlCreateMany(UserResource.Many)
  async createMany(
    @CrudRequest() crudRequest: CrudRequestInterface,
    @CrudBody() userCreateManyDto: UserCreateManyDto,
  ) {
    // the final data
    const hashed = [];

    // loop all dtos
    for (const userCreateDto of userCreateManyDto.bulk) {
      // hash it
      hashed.push(await this.maybeHashPassword(userCreateDto));
    }

    // call crud service to create
    return this.userCrudService.createMany(crudRequest, { bulk: hashed });
  }

  /**
   * Create one
   *
   * @param crudRequest the CRUD request object
   * @param userCreateDto user create dto
   */
  @CrudCreateOne()
  @AccessControlCreateOne(UserResource.One)
  async createOne(
    @CrudRequest() crudRequest: CrudRequestInterface,
    @CrudBody() userCreateDto: UserCreateDto,
  ) {
    // call crud service to create
    return this.userCrudService.createOne(
      crudRequest,
      await this.maybeHashPassword(userCreateDto),
    );
  }

  /**
   * Update one
   *
   * @param crudRequest the CRUD request object
   * @param userUpdateDto user update dto
   */
  @CrudUpdateOne()
  @AccessControlUpdateOne(UserResource.One)
  async updateOne(
    @CrudRequest() crudRequest: CrudRequestInterface,
    @CrudBody() userUpdateDto: UserUpdateDto,
  ) {
    return this.userCrudService.updateOne(
      crudRequest,
      await this.maybeHashPassword(userUpdateDto),
    );
  }

  /**
   * Delete one
   *
   * @param crudRequest the CRUD request object
   */
  @CrudDeleteOne()
  @AccessControlDeleteOne(UserResource.One)
  async deleteOne(@CrudRequest() crudRequest: CrudRequestInterface) {
    return this.userCrudService.deleteOne(crudRequest);
  }

  /**
   * Recover one
   *
   * @param crudRequest the CRUD request object
   */
  @CrudRecoverOne()
  @AccessControlRecoverOne(UserResource.One)
  async recoverOne(@CrudRequest() crudRequest: CrudRequestInterface) {
    return this.userCrudService.recoverOne(crudRequest);
  }

  /**
   * Maybe hash passwords on a dto.
   *
   * @param dto The object on which to hash password.
   */
  protected async maybeHashPassword<T>(dto: T | (T & PasswordPlainInterface)) {
    // get a password?
    if ('password' in dto && typeof dto.password === 'string') {
      // yes, hash it
      return this.passwordStorageService.hashObject(dto);
    } else {
      // return untouched
      return dto;
    }
  }
}
