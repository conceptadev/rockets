import { Controller } from '@nestjs/common';
import {
  CrudBody,
  CrudModel,
  CrudCreateOne,
  CrudDeleteOne,
  CrudReadAll,
  CrudReadOne,
  CrudRequest,
  CrudRequestInterface,
  CrudUpdateOne,
  CrudValidation,
} from '@rockts-org/nestjs-crud';
import { UserCreateDto } from './dto/user-create.dto';
import { UserReadDto } from './dto/user-read.dto';
import { UserUpdateDto } from './dto/user-update.dto';
import { UserCrudService } from './services/user-crud.service';

/**
 * User controller.
 */
@Controller('user')
@CrudModel({ type: UserReadDto })
@CrudValidation()
export class UserController {
  /**
   * Constructor.
   *
   * @param userCrudService instance of the user crud service
   */
  constructor(private userCrudService: UserCrudService) {}

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
    return this.userCrudService.createOne(crudRequest, userCreateDto);
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
    return this.userCrudService.updateOne(crudRequest, userUpdateDto);
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
