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
import { PasswordStorageService } from '@concepta/nestjs-password';
import { UserCrudService } from './services/user-crud.service';
import { UserDto } from './dto/user.dto';
import { UserCreateDto } from './dto/user-create.dto';
import { UserCreateManyDto } from './dto/user-create-many.dto';
import { UserUpdateDto } from './dto/user-update.dto';
import { UserPaginatedDto } from './dto/user-paginated.dto';
import { UserEntityInterface } from './interfaces/user-entity.interface';

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
export class UserController
  implements CrudControllerInterface<UserEntityInterface>
{
  /**
   * Constructor.
   *
   * @param userCrudService instance of the user crud service
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
  @CrudReadAll()
  async getMany(@CrudRequest() crudRequest: CrudRequestInterface) {
    return this.userCrudService.getMany(crudRequest);
  }

  /**
   * Get one
   *
   * @param crudRequest the CRUD request object
   */
  @CrudReadOne()
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
  async createMany(
    @CrudRequest() crudRequest: CrudRequestInterface,
    @CrudBody() userCreateManyDto: UserCreateManyDto,
  ) {
    // the final data
    const encrypted = [];

    // loop all dtos
    for (const userCreateDto of userCreateManyDto.bulk) {
      // encrypt it
      encrypted.push(
        await this.passwordStorageService.encryptObject(userCreateDto),
      );
    }

    // call crud service to create
    return this.userCrudService.createMany(crudRequest, { bulk: encrypted });
  }

  /**
   * Create one
   *
   * @param crudRequest the CRUD request object
   * @param userCreateDto user create dto
   */
  @CrudCreateOne()
  async createOne(
    @CrudRequest() crudRequest: CrudRequestInterface,
    @CrudBody() userCreateDto: UserCreateDto,
  ) {
    // call crud service to create
    return this.userCrudService.createOne(
      crudRequest,
      await this.passwordStorageService.encryptObject(userCreateDto),
    );
  }

  /**
   * Update one
   *
   * @param crudRequest the CRUD request object
   * @param userUpdateDto user update dto
   */
  @CrudUpdateOne()
  async updateOne(
    @CrudRequest() crudRequest: CrudRequestInterface,
    @CrudBody() userUpdateDto: UserUpdateDto,
  ) {
    return this.userCrudService.updateOne(
      crudRequest,
      await this.passwordStorageService.encryptObject(userUpdateDto),
    );
  }

  /**
   * Delete one
   *
   * @param crudRequest the CRUD request object
   */
  @CrudDeleteOne()
  async deleteOne(@CrudRequest() crudRequest: CrudRequestInterface) {
    return this.userCrudService.deleteOne(crudRequest);
  }
}
