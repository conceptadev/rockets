import { Controller } from '@nestjs/common';
import {
  CrudBody,
  CrudController,
  CrudCreateOne,
  CrudReadOne,
  CrudRequest,
  CrudRequestInterface,
} from '@rockts-org/nestjs-crud';
import { UserDto } from './dto/user.dto';
import { User } from './entities/user.entity';
import { UserCrudService } from './services/user-crud.service';
import { UserService } from './services/user.service';

/**
 * User controller.
 */
@Controller('user')
@CrudController({ model: { type: User } })
export class UserController {
  /**
   * Constructor.
   *
   * @param userService instance of the user service
   * @param userCrudService instance of the user crud service
   */
  constructor(
    private userService: UserService,
    private userCrudService: UserCrudService,
  ) {}

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
   * @param userDto user dto
   */
  @CrudCreateOne()
  async createOne(
    @CrudRequest() crudRequest: CrudRequestInterface,
    @CrudBody() userDto: UserDto,
  ) {
    return this.userCrudService.createOne(crudRequest, userDto);
  }
}
